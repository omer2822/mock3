import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

const pollSummaries = [
  {
    id: "poll-1",
    question: "Which launch metric matters most?",
    createdAt: "2026-04-15T10:00:00.000Z",
    isClosed: false,
    totalVotes: 20,
    options: [
      { text: "Signups", votes: 12 },
      { text: "Activation", votes: 8 }
    ]
  },
  {
    id: "poll-2",
    question: "Where should the team host the watch party?",
    createdAt: "2026-04-15T09:00:00.000Z",
    isClosed: false,
    totalVotes: 11,
    options: [
      { text: "Office", votes: 4 },
      { text: "Cafe", votes: 7 }
    ]
  }
];

const pollDetail = {
  id: "poll-1",
  question: "Which launch metric matters most?",
  createdAt: "2026-04-15T10:00:00.000Z",
  isClosed: false,
  totalVotes: 20,
  options: [
    { text: "Signups", votes: 12, percentage: 60 },
    { text: "Activation", votes: 8, percentage: 40 }
  ]
};

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders poll cards from the API and opens the selected poll detail", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollSummaries), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollDetail), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);

    expect(screen.getByText(/loading polls/i)).toBeInTheDocument();

    await screen.findByRole("button", {
      name: /open poll which launch metric matters most\?/i
    });

    expect(screen.getByText("20 votes")).toBeInTheDocument();
    expect(screen.getByText("11 votes")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: /open poll which launch metric matters most\?/i
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /which launch metric matters most\?/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /back to all polls/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vote for signups/i })).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, "/api/polls/poll-1");
  });

  test("submits a vote and refreshes the poll detail with updated totals", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([pollSummaries[0]]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollDetail), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...pollDetail,
            totalVotes: 21,
            options: [
              { text: "Signups", votes: 13, percentage: 62 },
              { text: "Activation", votes: 8, percentage: 38 }
            ]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: /open poll which launch metric matters most\?/i
      })
    );

    await userEvent.click(screen.getByRole("button", { name: /vote for signups/i }));

    await waitFor(() => {
      expect(screen.getByText("21 total votes")).toBeInTheDocument();
    });

    expect(screen.getByText("13 votes")).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/polls/poll-1/vote",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex: 0 })
      })
    );
  });

  test("creates a new poll from the create form and returns to the list", async () => {
    const createdPoll = {
      id: "poll-3",
      question: "Which city should host the next event?",
      createdAt: "2026-04-15T12:00:00.000Z",
      isClosed: false,
      options: [
        { text: "Tel Aviv", votes: 0 },
        { text: "Jerusalem", votes: 0 }
      ]
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollSummaries), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createdPoll), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);

    await screen.findByRole("button", {
      name: /create new poll/i
    });

    await userEvent.click(screen.getByRole("button", { name: /create new poll/i }));

    await userEvent.type(
      screen.getByLabelText(/poll question/i),
      "Which city should host the next event?"
    );
    await userEvent.type(screen.getByLabelText(/option 1/i), "Tel Aviv");
    await userEvent.type(screen.getByLabelText(/option 2/i), "Jerusalem");

    await userEvent.click(screen.getByRole("button", { name: /publish poll/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /open poll which city should host the next event\?/i
        })
      ).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/polls",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Which city should host the next event?",
          options: ["Tel Aviv", "Jerusalem"]
        })
      })
    );
  });

  test("shows inline validation for empty create form fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(pollSummaries), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", { name: /create new poll/i })
    );

    await userEvent.click(screen.getByRole("button", { name: /publish poll/i }));

    expect(await screen.findByText(/question is required/i)).toBeInTheDocument();
    const optionAlerts = screen.getAllByText(/option text is required/i);
    expect(optionAlerts).toHaveLength(2);
  });

  test("keeps the create flow available when the poll list is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    await screen.findByRole("heading", { name: /no polls available/i });
    await userEvent.click(screen.getByRole("button", { name: /create new poll/i }));

    expect(
      screen.getByRole("heading", { name: /compose a question worth answering/i })
    ).toBeInTheDocument();
  });

  test("adds and removes option inputs within the allowed bounds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(pollSummaries), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", { name: /create new poll/i })
    );

    const addButton = screen.getByRole("button", { name: /add option/i });

    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    expect(screen.getAllByLabelText(/option \d/i)).toHaveLength(5);
    expect(addButton).toBeDisabled();

    const optionRows = screen.getAllByTestId("option-row");
    const lastRow = optionRows[optionRows.length - 1];
    await userEvent.click(within(lastRow).getByRole("button", { name: /remove option 5/i }));

    expect(screen.getAllByLabelText(/option \d/i)).toHaveLength(4);
  });

  test("shows a friendly error when poll creation fails", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollSummaries), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "bad request" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", { name: /create new poll/i })
    );

    await userEvent.type(screen.getByLabelText(/poll question/i), "Should we launch on Friday?");
    await userEvent.type(screen.getByLabelText(/option 1/i), "Yes");
    await userEvent.type(screen.getByLabelText(/option 2/i), "No");
    await userEvent.click(screen.getByRole("button", { name: /publish poll/i }));

    expect(
      await screen.findByText(/the poll could not be published\. try again\./i)
    ).toBeInTheDocument();
  });

  test("retries loading the poll list without reloading the page", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollSummaries), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);

    await screen.findByRole("heading", { name: /poll list unavailable/i });
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(
      await screen.findByRole("button", {
        name: /open poll which launch metric matters most\?/i
      })
    ).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("prefers API-provided percentages in the poll detail view", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([pollSummaries[0]]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...pollDetail,
            totalVotes: 3,
            options: [
              { text: "Signups", votes: 2, percentage: 67 },
              { text: "Activation", votes: 1, percentage: 33 }
            ]
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: /open poll which launch metric matters most\?/i
      })
    );

    expect(await screen.findByText("67%")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  test("shows the missing-poll state when the selected poll disappears during refresh", async () => {
    let refreshCallback: (() => void) | undefined;
    vi.spyOn(window, "setInterval").mockImplementation((handler, timeout) => {
      if (timeout === 1500) {
        refreshCallback = handler as () => void;
      }

      return 1 as unknown as ReturnType<typeof window.setInterval>;
    });
    vi.spyOn(window, "clearInterval").mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([pollSummaries[0]]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollDetail), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pollDetail), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Poll not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        })
      );

    render(<App />);

    await userEvent.click(
      await screen.findByRole("button", {
        name: /open poll which launch metric matters most\?/i
      })
    );

    await screen.findByRole("button", { name: /vote for signups/i });

    expect(refreshCallback).toBeDefined();

    await act(async () => {
      refreshCallback?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    expect(
      await screen.findByRole("heading", { name: /selected poll not found/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /vote for signups/i })).not.toBeInTheDocument();
  });
});
