import { getPollById } from "./poll-helpers.js";
import type { Poll } from "../types/polls.js";

const polls: Poll[] = [];
let nextPollId = 1;

export function getAllPolls(): Poll[] {
  return [...polls];
}

export function findPollById(id: string): Poll | undefined {
  return getPollById(polls, id);
}

export function createPoll(question: string, options: string[]): Poll {
  const poll: Poll = {
    id: String(nextPollId),
    question,
    options: options.map((option) => ({
      text: option,
      votes: 0
    })),
    createdAt: new Date().toISOString(),
    isClosed: false
  };

  nextPollId += 1;
  polls.push(poll);

  return poll;
}

export function deletePoll(id: string): boolean {
  const pollIndex = polls.findIndex((poll) => poll.id === id);

  if (pollIndex === -1) {
    return false;
  }

  polls.splice(pollIndex, 1);
  return true;
}

export function voteForPollOption(id: string, optionIndex: number): Poll | null {
  const poll = findPollById(id);

  if (!poll) {
    return null;
  }

  poll.options[optionIndex].votes += 1;
  return poll;
}
