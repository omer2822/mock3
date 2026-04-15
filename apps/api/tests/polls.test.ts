import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import type { Server } from "node:http";

import { createApp } from "../src/app.js";

type JsonValue = boolean | number | string | null | JsonObject | JsonValue[];

type JsonObject = {
  [key: string]: JsonValue;
};

type TestServer = {
  close: () => Promise<void>;
  request: (path: string, init?: RequestInit) => Promise<Response>;
};

const openServers: Server[] = [];

function createTestServer(): TestServer {
  const app = createApp();
  const server = app.listen(0);
  openServers.push(server);

  return {
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
    request: (path, init) => {
      const address = server.address();

      if (!address || typeof address === "string") {
        throw new Error("Test server address is unavailable");
      }

      return fetch(`http://127.0.0.1:${address.port}${path}`, init);
    }
  };
}

async function readJson<T extends JsonObject>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        })
    )
  );
});

describe("poll routes", () => {
  it("creates a poll and returns zeroed percentages for the detail view", async () => {
    const server = createTestServer();

    const createResponse = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "Which launch theme should we use?",
        options: ["Bold", "Minimal", "Playful"]
      })
    });

    assert.equal(createResponse.status, 201);
    const createdPoll = await readJson<{
      id: string;
      question: string;
      isClosed: boolean;
      options: Array<{ text: string; votes: number }>;
    }>(createResponse);
    assert.equal(createdPoll.question, "Which launch theme should we use?");
    assert.equal(createdPoll.isClosed, false);
    assert.deepEqual(
      createdPoll.options.map((option) => option.votes),
      [0, 0, 0]
    );

    const detailResponse = await server.request(`/api/polls/${createdPoll.id}`);

    assert.equal(detailResponse.status, 200);
    const detail = await readJson<{
      totalVotes: number;
      options: Array<{ text: string; votes: number; percentage: number }>;
    }>(detailResponse);
    assert.equal(detail.totalVotes, 0);
    assert.deepEqual(
      detail.options.map((option) => option.percentage),
      [0, 0, 0]
    );
  });

  it("rejects invalid poll creation payloads", async () => {
    const server = createTestServer();

    const response = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "  ",
        options: ["Yes"]
      })
    });

    assert.equal(response.status, 400);
    const payload = await readJson<{ error: string }>(response);
    assert.match(payload.error, /question|options/i);
  });

  it("lists polls with total votes only", async () => {
    const server = createTestServer();

    const createResponse = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "Where should the team meetup happen?",
        options: ["Tel Aviv", "Haifa"]
      })
    });
    const createdPoll = await readJson<{ id: string }>(createResponse);

    const listResponse = await server.request("/api/polls");

    assert.equal(listResponse.status, 200);
    const polls = await readJson<
      Array<{
        id: string;
        totalVotes: number;
        options: Array<{ text: string; votes: number }>;
      }>
    >(listResponse);
    const poll = polls.find((item) => item.id === createdPoll.id);

    assert.ok(poll);
    assert.equal(poll.totalVotes, 0);
    assert.equal("percentage" in poll.options[0], false);
  });

  it("votes for an option and returns recalculated percentages", async () => {
    const server = createTestServer();

    const createResponse = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "Which feature should ship first?",
        options: ["Templates", "Analytics"]
      })
    });
    const createdPoll = await readJson<{ id: string }>(createResponse);

    const voteResponse = await server.request(`/api/polls/${createdPoll.id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        optionIndex: 1
      })
    });

    assert.equal(voteResponse.status, 200);
    const updatedPoll = await readJson<{
      totalVotes: number;
      options: Array<{ votes: number; percentage: number }>;
    }>(voteResponse);
    assert.equal(updatedPoll.totalVotes, 1);
    assert.deepEqual(
      updatedPoll.options.map((option) => option.votes),
      [0, 1]
    );
    assert.deepEqual(
      updatedPoll.options.map((option) => option.percentage),
      [0, 100]
    );
  });

  it("rejects invalid votes and closed-or-missing poll access", async () => {
    const server = createTestServer();

    const createResponse = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "Should we keep the event open late?",
        options: ["Yes", "No"]
      })
    });
    const createdPoll = await readJson<{ id: string }>(createResponse);

    const badVoteResponse = await server.request(`/api/polls/${createdPoll.id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        optionIndex: 4
      })
    });
    assert.equal(badVoteResponse.status, 400);

    const missingVoteResponse = await server.request("/api/polls/unknown-id/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        optionIndex: 0
      })
    });
    assert.equal(missingVoteResponse.status, 404);
  });

  it("deletes a poll and returns not found afterwards", async () => {
    const server = createTestServer();

    const createResponse = await server.request("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: "Which stream slot works best?",
        options: ["Morning", "Evening"]
      })
    });
    const createdPoll = await readJson<{ id: string }>(createResponse);

    const deleteResponse = await server.request(`/api/polls/${createdPoll.id}`, {
      method: "DELETE"
    });
    assert.equal(deleteResponse.status, 204);

    const detailResponse = await server.request(`/api/polls/${createdPoll.id}`);
    assert.equal(detailResponse.status, 404);
  });
});
