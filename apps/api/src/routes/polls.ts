import { Router } from "express";

import {
  createPoll as createStoredPoll,
  deletePoll,
  findPollById,
  getAllPolls,
  voteForPollOption
} from "../lib/poll-store.js";
import {
  parseCreatePollInput,
  parseVoteOptionIndex,
  toPollDetail,
  toPollSummary
} from "../lib/poll-helpers.js";

export const pollsRouter = Router();

pollsRouter.get("/", (_request, response) => {
  const polls = getAllPolls()
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((poll) => toPollSummary(poll));

  response.status(200).json(polls);
});

pollsRouter.post("/", (request, response) => {
  try {
    const payload = parseCreatePollInput(request.body);
    const poll = createStoredPoll(payload.question, payload.options);

    response.status(201).json(poll);
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Invalid poll payload."
    });
  }
});

pollsRouter.get("/:id", (request, response) => {
  const poll = findPollById(request.params.id);

  if (!poll) {
    response.status(404).json({
      error: "Poll not found."
    });
    return;
  }

  response.status(200).json(toPollDetail(poll));
});

pollsRouter.delete("/:id", (request, response) => {
  const wasDeleted = deletePoll(request.params.id);

  if (!wasDeleted) {
    response.status(404).json({
      error: "Poll not found."
    });
    return;
  }

  response.status(204).send();
});

pollsRouter.post("/:id/vote", (request, response) => {
  const poll = findPollById(request.params.id);

  if (!poll) {
    response.status(404).json({
      error: "Poll not found."
    });
    return;
  }

  if (poll.isClosed) {
    response.status(400).json({
      error: "Poll is closed."
    });
    return;
  }

  try {
    const optionIndex = parseVoteOptionIndex(request.body);

    if (optionIndex >= poll.options.length) {
      response.status(400).json({
        error: "optionIndex is out of range."
      });
      return;
    }

    const updatedPoll = voteForPollOption(request.params.id, optionIndex);

    if (!updatedPoll) {
      response.status(404).json({
        error: "Poll not found."
      });
      return;
    }

    response.status(200).json(toPollDetail(updatedPoll));
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Invalid vote payload."
    });
  }
});
