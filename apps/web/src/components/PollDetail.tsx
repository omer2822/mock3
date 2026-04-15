import type { Poll } from "../types";

type PollDetailProps = {
  poll: Poll;
  isSubmitting: boolean;
  voteError: string | null;
  onBack: () => void;
  onVote: (optionIndex: number) => void;
};

function getTotalVotes(poll: Poll) {
  return poll.totalVotes ?? poll.options.reduce((sum, option) => sum + option.votes, 0);
}

function getPercentage(votes: number, totalVotes: number) {
  if (totalVotes === 0) {
    return 0;
  }

  return Math.round((votes / totalVotes) * 100);
}

export function PollDetail({
  poll,
  isSubmitting,
  voteError,
  onBack,
  onVote
}: PollDetailProps) {
  const totalVotes = getTotalVotes(poll);

  return (
    <section className="panel">
      <div className="detail-topbar">
        <button type="button" className="back-button" onClick={onBack}>
          Back to all polls
        </button>
        <span className="panel-chip">{totalVotes} total votes</span>
      </div>
      <div className="panel__header">
        <p className="eyebrow">Poll Detail</p>
        <h1>{poll.question}</h1>
        <p className="detail">
          Compare the current split, cast a vote, and watch the distribution
          update immediately after the API responds.
        </p>
      </div>
      {voteError ? <p className="banner banner--error">{voteError}</p> : null}
      <div className="option-list">
        {poll.options.map((option, index) => {
          const percentage = option.percentage ?? getPercentage(option.votes, totalVotes);

          return (
            <article key={option.id ?? `${option.text}-${index}`} className="option-card">
              <div className="option-card__content">
                <div>
                  <p className="option-card__rank">Option {index + 1}</p>
                  <h2>{option.text}</h2>
                  <p className="option-card__meta">
                    <span>{option.votes} votes</span>
                    <span aria-hidden="true"> · </span>
                    <span>{percentage}%</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="vote-button"
                  disabled={isSubmitting}
                  onClick={() => onVote(index)}
                  aria-label={`Vote for ${option.text}`}
                >
                  {isSubmitting ? "Submitting..." : "Vote"}
                </button>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div
                  className="bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
