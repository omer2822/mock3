import type { Poll } from "../types";

type PollCardProps = {
  poll: Poll;
  onSelect: (pollId: string) => void;
};

function getTotalVotes(poll: Poll) {
  return poll.totalVotes ?? poll.options.reduce((sum, option) => sum + option.votes, 0);
}

export function PollCard({ poll, onSelect }: PollCardProps) {
  const totalVotes = getTotalVotes(poll);
  const optionCount = poll.options.length;

  return (
    <button
      type="button"
      className="poll-card"
      onClick={() => onSelect(poll.id)}
      aria-label={`Open poll ${poll.question}`}
    >
      <div className="poll-card__topline">
        <span className="poll-card__badge">Poll</span>
        <span className="poll-card__count">
          {optionCount} option{optionCount === 1 ? "" : "s"}
        </span>
      </div>
      <h2 className="poll-card__title">{poll.question}</h2>
      <p className="poll-card__meta">{totalVotes} votes</p>
      <span className="poll-card__cta">View breakdown</span>
    </button>
  );
}
