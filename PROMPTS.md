# AI Agent Prompts — Full-Stack App in 40 Minutes

> Copy-paste these in order. Replace [BRACKETED] placeholders with your actual content.
> These are optimized for Claude Opus / Claude Code with extended thinking.

---

## PROMPT 1 — KICKOFF SCAFFOLD (Phase 1: minutes 0–8)

*Paste this the moment you know what the app needs to do.*

```
Read the CLAUDE.md file first — it has all project conventions and constraints.

I need to build: [DESCRIBE THE APP IN 1-2 SENTENCES + ANY SPECIFIC REQUIREMENTS]

Before writing any code:
1. Use Context7 to verify the latest Next.js App Router patterns (route
   handlers, server components, metadata API)
2. Plan the data model, API endpoints, and component tree
3. Then generate everything

Generate the COMPLETE scaffold — make every decision yourself, do not ask
me anything. Specifically:

1. types/index.ts — all interfaces. Strict TypeScript, no `any`.
2. lib/store.ts — in-memory store (array/Map based) with getAll, getById,
   create, update, delete methods. Include 5-8 realistic seed records.
3. app/api/[resource]/route.ts — GET (with search, pagination, sorting
   via query params) + POST (with validation, returns 201)
4. app/api/[resource]/[id]/route.ts — GET (single) + PATCH (partial
   update with validation) + DELETE (returns 204)
5. app/page.tsx — main page with:
   - Data fetching with loading / error / empty states
   - List rendering with item cards
   - Create form (validates, disables while submitting, resets on success)
   - Delete button per item (optimistic removal)
   - Search input (calls API with ?search= param)
6. app/layout.tsx — proper metadata, title, Tailwind setup

Pagination response shape: { data, total, page, limit, totalPages }

Output each file with its full path. After the files, give me the exact
terminal commands to create the project, install deps, and start dev server.
```

---

## PROMPT 2 — FRONTEND UPGRADE (Phase 2: minutes 8–22)

*Paste after the app runs and you can see the basic UI.*

```
Here is my current app:

page.tsx:
[PASTE]

types/index.ts:
[PASTE]

Upgrade the frontend — keep all existing functionality, add:

1. SEARCH — debounced (300ms) input that calls GET with ?search= param.
   Show "Searching..." while loading. X button to clear. If empty query,
   fetch all items.

2. PAGINATION — "Load more" button OR page numbers below the list.
   Show "Showing X of Y items". Disable button on last page.
   Reset to page 1 when search query changes.

3. FORM UX:
   - Disable submit while request is in-flight (show spinner in button)
   - Inline validation: red border + message on required empty fields
   - On success: reset all fields, refocus first input
   - Enter key submits from any field

4. DELETE UX:
   - Optimistic: remove from list immediately on click
   - If DELETE fails: restore the item + show error banner
   - Confirm dialog or "undo" toast (pick whichever is faster to build)

5. EDIT (PATCH):
   - Click item to toggle inline edit mode OR open edit modal
   - Pre-fill current values
   - PATCH on save, optimistic update in the list
   - Cancel button to discard changes

6. VISUAL POLISH:
   - Consistent spacing (use Tailwind's spacing scale)
   - Hover states: subtle scale + shadow on cards
   - Transitions: 150ms ease on all interactive elements
   - Responsive: single column on mobile, grid on desktop
   - Focus ring on all interactive elements (accessibility)

Use only Tailwind utility classes. No custom CSS files.
Return complete file(s). Extract components if any exceed 60 lines.
```

---

## PROMPT 3 — BACKEND HARDENING (Phase 3: minutes 22–30)

*Use this if the API routes need strengthening or you need to add features.*

```
Here are my current API routes:

app/api/[resource]/route.ts:
[PASTE]

app/api/[resource]/[id]/route.ts:
[PASTE]

lib/store.ts:
[PASTE]

Harden the backend:

1. SEARCH — GET supports ?search= param. Case-insensitive partial match
   across ALL text fields. Multi-word: split by spaces, each word must
   match at least one field (AND logic).

2. PAGINATION — GET accepts ?page=1&limit=20 (defaults if missing).
   Response: { data: [...], total, page, limit, totalPages }.
   Clamp page to valid range (don't return page 99 of 3).

3. SORTING — ?sortBy=createdAt&order=desc. Whitelist allowed sort fields
   (don't let clients sort by arbitrary keys). Default: createdAt desc.

4. VALIDATION — POST and PATCH must validate all required fields.
   Return 400 with { error: "fieldName is required" } for missing fields.
   Return 404 with { error: "Item not found" } for bad IDs.
   PATCH: only update provided fields, preserve the rest.
   Never expose internal errors to the client.

5. ERROR HANDLING — every handler in try/catch.
   500 → { error: "Internal server error" }. Never stack traces.

6. TYPES — make sure request body parsing uses the shared types from
   types/index.ts. No `any` anywhere. Use Partial<> for PATCH bodies.

Return COMPLETE updated files. Mark each with its path.
```

---

## PROMPT 4 — BUG SQUASHER (use anytime something breaks)

```
Bug report:

Error / unexpected behavior:
[PASTE ERROR MESSAGE OR DESCRIBE WHAT'S WRONG]

Relevant file(s):
[PASTE THE FILE(S)]

Browser console errors (if any):
[PASTE OR "none"]

Before fixing: use Context7 to verify you're using the correct API for
Next.js App Router route handlers (not Pages Router patterns).

Then give me:
1. Root cause — one sentence
2. The fix — COMPLETE corrected file(s) (not diffs, I need to paste-replace)
3. Anything else in those files that looks fragile or would break next
4. How to verify the fix works (what to test)
```

---

## PROMPT 5 — FINAL POLISH (Phase 4: minutes 30–35)

*Only use if everything works. Turns "it works" into "it was built on purpose."*

```
Here is my working page:
[PASTE page.tsx AND any component files]

Add exactly these improvements — no refactors, no logic changes:

1. EMPTY STATE — when list has 0 items, show centered muted text:
   "No [items] yet — create your first one above." with a subtle icon or
   emoji. Make it feel warm, not broken.

2. ITEM COUNT — above the list, show "X [items]" (or "X of Y" if
   paginated) in small muted text. Pluralize correctly.

3. KEYBOARD — Enter submits the form from any input. Escape closes any
   open modal/edit mode.

4. HOVER & TRANSITIONS — cards: subtle translateY(-1px) + shadow on
   hover. Buttons: opacity change. All with transition-all duration-150.

5. METADATA — in layout.tsx: proper <title>, meta description, and
   viewport settings.

6. RESPONSIVE — verify the layout works at 375px width (phone).
   Stack form fields vertically on small screens.

Return complete updated file(s). Do not touch API routes or store logic.
```

---

## PROMPT 6 — BONUS "EXTRA TOUCH" (Phase 5: minutes 35–40)

*For the Wix exam Part 3, or whenever you want to add one impressive feature.*

```
Here is my current working app:
[PASTE page.tsx + route files + store + types]

I want to add ONE feature that:
- Takes <8 minutes to implement
- Demonstrates product thinking + full-stack ability
- Is immediately visible when someone uses the app

Pick the BEST option for my app from this list:
- Status/priority field with colored badges + filter dropdown
- Undo last delete (5-second toast with "Undo" button + restore)
- Sort toggle (click column headers or a dropdown to sort by different fields)
- Dark/light theme toggle (Tailwind dark: classes + prefers-color-scheme)
- Export to CSV button (generate + download client-side)
- Real-time item count animations (number ticks up/down smoothly)
- Bulk select + bulk delete with checkboxes

Implement end-to-end: store changes (if needed) → API changes → UI.
Return ALL changed files, complete.

At the end, give me 2 sentences explaining why this feature adds value —
I'll put this in my submission email.
```

---

## QUICK REFERENCE — Terminal Setup Commands

```bash
# Create project
npx create-next-app@latest my-app --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"

cd my-app

# Start dev
npm run dev
```

No database setup needed — in-memory store works immediately.

---

## TIPS FOR EXAM DAY

1. **Read ALL requirements before prompting.** 2 minutes reading saves 10
   minutes building the wrong thing.

2. **Commit after each phase.** Git history shows progress even if you
   don't finish everything.

3. **Don't debug for more than 3 minutes.** If stuck, paste the error into
   Prompt 4 and let the AI fix it. Your time is the bottleneck, not the AI's.

4. **Test the happy path first.** Create → list → search → delete. If those
   4 flows work smoothly, you're in great shape.

5. **The grader runs your app for 30 seconds.** They'll see: empty state →
   create item → list updates → maybe search → maybe delete. Make those
   moments feel polished.
