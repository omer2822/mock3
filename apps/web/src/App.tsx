import { useEffect, useMemo, useState } from "react";

import { PollCreateForm } from "./components/PollCreateForm";
import { PollDetail } from "./components/PollDetail";
import { PollList } from "./components/PollList";
import type { Poll } from "./types";

async function fetchPollList() {
  const response = await fetch("/api/polls");

  if (!response.ok) {
    throw new Error("Unable to load polls right now.");
  }

  return response.json() as Promise<Poll[]>;
}

export default function App() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedPollDetail, setSelectedPollDetail] = useState<Poll | null>(null);
  const [isSelectedPollMissing, setIsSelectedPollMissing] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const loadPolls = async () => {
    try {
      const data = await fetchPollList();
      setPolls(data);
      setListError(null);
    } catch {
      setListError("Could not load polls. Check whether the poll API is ready.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPolls();
  }, []);

  useEffect(() => {
    if (!selectedPollId || isCreateOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void handleSelectPoll(selectedPollId, true);
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedPollId, isCreateOpen]);

  const selectedPoll = useMemo(
    () => (selectedPollId ? selectedPollDetail : null),
    [selectedPollDetail, selectedPollId],
  );

  const handleSelectPoll = async (pollId: string, silent = false) => {
    setSelectedPollId(pollId);
    setVoteError(null);
    setIsSelectedPollMissing(false);
    if (!silent) {
      setIsLoadingDetail(true);
    }

    try {
      const response = await fetch(`/api/polls/${pollId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setIsSelectedPollMissing(true);
          setSelectedPollDetail(null);
          setPolls((currentPolls) => currentPolls.filter((poll) => poll.id !== pollId));
          return;
        }

        throw new Error("Unable to load poll detail.");
      }

      const detail: Poll = await response.json();
      setIsSelectedPollMissing(false);
      setSelectedPollDetail(detail);
      setPolls((currentPolls) =>
        currentPolls.map((poll) => (poll.id === detail.id ? { ...poll, ...detail } : poll)),
      );
    } catch {
      setIsSelectedPollMissing(false);
      setSelectedPollDetail(null);
    } finally {
      if (!silent) {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!selectedPoll) {
      return;
    }

    setIsSubmittingVote(true);
    setVoteError(null);

    try {
      const response = await fetch(`/api/polls/${selectedPoll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ optionIndex })
      });

      if (!response.ok) {
        throw new Error("Vote request failed.");
      }

      const updatedPoll: Poll = await response.json();
      setSelectedPollDetail(updatedPoll);
      setPolls((currentPolls) =>
        currentPolls.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll)),
      );
    } catch {
      setVoteError("Your vote could not be recorded. Try again.");
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleCreatePoll = async (input: { question: string; options: string[] }) => {
    setIsSubmittingCreate(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error("Unable to create poll.");
      }

      const createdPoll: Poll = await response.json();
      const totalVotes = createdPoll.options.reduce((sum, option) => sum + option.votes, 0);

      setPolls((currentPolls) => [{ ...createdPoll, totalVotes }, ...currentPolls]);
      setIsCreateOpen(false);
      setSelectedPollId(null);
      setSelectedPollDetail(null);
      setIsSelectedPollMissing(false);
      setVoteError(null);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  if (isLoading) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>Loading polls</h1>
          <p className="detail">
            Fetching the current list of live questions from the poll API.
          </p>
        </section>
      </main>
    );
  }

  if (listError) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>Poll list unavailable</h1>
          <p className="banner banner--error">{listError}</p>
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setIsLoading(true);
              void loadPolls();
            }}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  if (selectedPollId && isSelectedPollMissing) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>Selected poll not found</h1>
          <p className="detail">
            This poll is no longer present in the current results feed.
          </p>
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setSelectedPollId(null);
              setSelectedPollDetail(null);
              setIsSelectedPollMissing(false);
            }}
          >
            Back to all polls
          </button>
        </section>
      </main>
    );
  }

  if (polls.length === 0 && !isCreateOpen) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>No polls available</h1>
          <p className="detail">
            The API responded successfully, but there are no polls to display yet.
          </p>
          <button type="button" className="vote-button" onClick={() => setIsCreateOpen(true)}>
            Create new poll
          </button>
        </section>
      </main>
    );
  }

  if (selectedPollId && isLoadingDetail && !selectedPollDetail) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>Loading selected poll</h1>
          <p className="detail">
            Refreshing the current vote breakdown for the selected question.
          </p>
        </section>
      </main>
    );
  }

  if (selectedPollId && !selectedPoll) {
    return (
      <main className="app-shell">
        <div className="background-orb background-orb--one" />
        <div className="background-orb background-orb--two" />
        <section className="panel panel--centered">
          <p className="eyebrow">Live Poll Dashboard</p>
          <h1>Selected poll not found</h1>
          <p className="detail">
            This poll is no longer present in the current results feed.
          </p>
          <button
            type="button"
            className="back-button"
            onClick={() => {
              setSelectedPollId(null);
              setSelectedPollDetail(null);
              setIsSelectedPollMissing(false);
            }}
          >
            Back to all polls
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />
      {isCreateOpen ? (
        <PollCreateForm
          isSubmitting={isSubmittingCreate}
          onCancel={() => setIsCreateOpen(false)}
          onCreate={handleCreatePoll}
        />
      ) : selectedPoll ? (
        <PollDetail
          poll={selectedPoll}
          isSubmitting={isSubmittingVote || isLoadingDetail}
          voteError={voteError}
          onBack={() => {
            setSelectedPollId(null);
            setSelectedPollDetail(null);
            setIsSelectedPollMissing(false);
            setVoteError(null);
          }}
          onVote={handleVote}
        />
      ) : (
        <PollList
          polls={polls}
          onCreatePoll={() => setIsCreateOpen(true)}
          onSelect={handleSelectPoll}
        />
      )}
    </main>
  );
}
