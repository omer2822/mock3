export type PollOption = {
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  isClosed: boolean;
};

export type PollOptionWithPercentage = PollOption & {
  percentage: number;
};

export type PollSummary = Poll & {
  totalVotes: number;
};

export type PollDetail = Omit<Poll, "options"> & {
  options: PollOptionWithPercentage[];
  totalVotes: number;
};

export type CreatePollInput = {
  question: string;
  options: string[];
};

export type VotePollInput = {
  optionIndex: number;
};
