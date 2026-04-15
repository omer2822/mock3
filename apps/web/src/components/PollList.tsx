import type { Poll } from "../types";
import { PollCard } from "./PollCard";

type PollListProps = {
  polls: Poll[];
  onCreatePoll: () => void;
  onSelect: (pollId: string) => void;
};

export function PollList({ polls, onCreatePoll, onSelect }: PollListProps) {
  return (
    <section className="panel">
      <div className="detail-topbar">
        <span className="panel-chip">Live overview</span>
        <button type="button" className="vote-button" onClick={onCreatePoll}>
          Create new poll
        </button>
      </div>
      <div className="panel__header">
        <p className="eyebrow">Live Poll Dashboard</p>
        <h1>Live questions, presented with a cleaner read on sentiment</h1>
        <p className="detail">
          Browse every active question, review participation at a glance, and
          open a poll to inspect the option-level split in a focused detail view.
        </p>
        <div className="hero-metrics" aria-label="Poll overview">
          <div className="hero-metric">
            <span className="hero-metric__label">Active polls</span>
            <strong>{polls.length}</strong>
          </div>
          <div className="hero-metric">
            <span className="hero-metric__label">View mode</span>
            <strong>Live breakdown</strong>
          </div>
        </div>
      </div>
      <div className="poll-grid">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
