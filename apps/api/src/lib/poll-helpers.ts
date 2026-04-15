import type {
  CreatePollInput,
  Poll,
  PollDetail,
  PollOption,
  PollOptionWithPercentage,
  PollSummary
} from "../types/polls.js";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

export function getPollById(polls: Poll[], id: string): Poll | undefined {
  return polls.find((poll) => poll.id === id);
}

export function calculateTotalVotes(options: PollOption[]): number {
  return options.reduce((total, option) => total + option.votes, 0);
}

export function calculateVotePercentages(options: PollOption[]): PollOptionWithPercentage[] {
  const totalVotes = calculateTotalVotes(options);

  if (totalVotes === 0) {
    return options.map((option) => ({
      ...option,
      percentage: 0
    }));
  }

  return options.map((option) => ({
    ...option,
    percentage: Math.round((option.votes / totalVotes) * 100)
  }));
}

export function toPollSummary(poll: Poll): PollSummary {
  return {
    ...poll,
    totalVotes: calculateTotalVotes(poll.options)
  };
}

export function toPollDetail(poll: Poll): PollDetail {
  return {
    ...poll,
    totalVotes: calculateTotalVotes(poll.options),
    options: calculateVotePercentages(poll.options)
  };
}

export function parseCreatePollInput(payload: unknown): CreatePollInput {
  if (!isRecord(payload)) {
    throw new Error("Poll body must be a JSON object.");
  }

  const question = typeof payload.question === "string" ? payload.question.trim() : "";
  const optionsValue = payload.options;

  if (question.length === 0) {
    throw new Error("Question is required.");
  }

  if (!Array.isArray(optionsValue)) {
    throw new Error("Options must be an array.");
  }

  const options = optionsValue.map((option) => (typeof option === "string" ? option.trim() : ""));

  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    throw new Error("Options must contain between 2 and 5 entries.");
  }

  if (options.some((option) => option.length === 0)) {
    throw new Error("Options must contain non-empty text.");
  }

  return {
    question,
    options
  };
}

export function parseVoteOptionIndex(payload: unknown): number {
  if (!isRecord(payload) || typeof payload.optionIndex !== "number") {
    throw new Error("optionIndex is required.");
  }

  if (!Number.isInteger(payload.optionIndex) || payload.optionIndex < 0) {
    throw new Error("optionIndex must be a non-negative integer.");
  }

  return payload.optionIndex;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
