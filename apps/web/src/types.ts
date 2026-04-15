export type PollOption = {
  id?: string;
  text: string;
  votes: number;
  percentage?: number;
};

export type Poll = {
  id: string;
  question: string;
  createdAt?: string;
  isClosed?: boolean;
  totalVotes?: number;
  options: PollOption[];
};
