import { expect, test } from "@playwright/test";

test("creates a poll, votes, and handles a deleted selected poll", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /no polls available/i })).toBeVisible();
  await page.getByRole("button", { name: /create new poll/i }).click();

  await page.getByLabel(/poll question/i).fill("Which city should host the next event?");
  await page.getByLabel(/option 1/i).fill("Tel Aviv");
  await page.getByLabel(/option 2/i).fill("Jerusalem");
  await page.getByRole("button", { name: /publish poll/i }).click();

  const pollCard = page.getByRole("button", {
    name: /open poll which city should host the next event\?/i
  });
  await expect(pollCard).toBeVisible();
  await expect(page.getByText("1")).toBeVisible();

  await pollCard.click();

  await expect(
    page.getByRole("heading", { name: /which city should host the next event\?/i })
  ).toBeVisible();
  await expect(page.getByText("0 total votes")).toBeVisible();

  await page.getByRole("button", { name: /vote for tel aviv/i }).click();

  await expect(page.getByText("1 total votes")).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
  await expect(page.getByText("1 votes")).toBeVisible();

  const deleteResponse = await request.delete("http://127.0.0.1:3001/api/polls/1");
  expect(deleteResponse.status()).toBe(204);

  await expect(page.getByRole("heading", { name: /selected poll not found/i })).toBeVisible({
    timeout: 5000
  });
  await page.getByRole("button", { name: /back to all polls/i }).click();
  await expect(page.getByRole("heading", { name: /no polls available/i })).toBeVisible();
});
