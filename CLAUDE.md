# CLAUDE.md — Full-Stack App Builder Context

> **Mission:** Build an amazing, good-looking, fully working full-stack web
> application that meets the given requirements — in under 40 minutes.

---

## Stack & Constraints

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| Framework    | **Next.js 14+** (App Router, `app/` directory)               |
| Language     | **TypeScript — strict mode, zero `any`**                     |
| Styling      | **Tailwind CSS** (utility classes only, no custom CSS files)  |
| Database     | **In-memory storage** by default (Map / array in a module)   |
| API          | Next.js Route Handlers — `GET · POST · PATCH · DELETE`       |
| Runtime      | Node 20+                                                     |

> **Database rule:** Do NOT add Prisma, MongoDB, SQLite, or any external DB
> unless the task **explicitly** requires persistence. Use a simple in-memory
> store (`Map<string, T>` or array) exported from `lib/store.ts`. This
> eliminates setup time, migration steps, and connection issues.

---

## Code Quality — Non-Negotiable

- **Strict TypeScript** — `"strict": true` in tsconfig. No `any`, no `as any`,
  no `@ts-ignore`. Define interfaces/types in `types/index.ts`.
- **Complete error handling** — every async call wrapped in try/catch. API
  routes return proper status codes (400, 404, 500) with `{ error: string }`.
- **Clean structure** — components > 60 lines get extracted. One concern per
  file. Named exports. Descriptive variable names.
- **No leftovers** — zero `console.log`, zero `TODO`, zero commented-out code.

---

## API Design Pattern

Every resource follows this shape:

```
GET    /api/[resource]         → list (with ?search=, ?page=, ?limit=, ?sortBy=, ?order=)
GET    /api/[resource]/[id]    → single item
POST   /api/[resource]         → create (validate body, return 201)
PATCH  /api/[resource]/[id]    → partial update (validate body, return 200)
DELETE /api/[resource]/[id]    → delete (return 204 or 200)
```

**Pagination response shape** (always):
```json
{ "data": [...], "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
```

**Search** must be case-insensitive, partial-match, across ALL text fields.
Multi-word queries: each word must match at least one field (AND logic).

---

## Frontend Quality Signals

Every page MUST have these states from the start:
1. **Loading** — skeleton or spinner while fetching
2. **Error** — user-friendly message + retry button
3. **Empty** — friendly message when list has 0 items
4. **Success** — the actual content

Forms MUST:
- Disable submit button while request is in-flight
- Show inline validation for required fields
- Reset + refocus first input on success
- Support Enter key to submit

Lists MUST:
- Optimistic UI on delete (remove immediately, restore on failure)
- Show item count ("X items" or "Showing X of Y")
- Have hover states on interactive elements

---

## Tooling & Agent Workflow

You have access to powerful tools. **USE THEM** — they exist to help you
move faster and produce better output:

- **Context7** (`resolve-library-id` → `query-docs`) — ALWAYS check docs
  before using any library API you're not 100% certain about. Verify Next.js
  App Router patterns, Tailwind classes, etc. This takes 5 seconds and
  prevents 10-minute debugging sessions.
- **MCP servers** — if available (Tavily for search, etc.), use them to
  look up patterns, verify approaches, find solutions.
- **Skills** — read SKILL.md files when creating specific file types
  (presentations, documents, etc.)
- **Subagents / parallel work** — if the platform supports it, delegate
  independent tasks (e.g., build the API while designing the UI).

**Rule:** If you're unsure about an API or pattern, LOOK IT UP first via
Context7 or web search. Do not guess and debug later.

---

## Design Philosophy

- **Design-first:** Before writing ANY code, plan: data shape → API
  endpoints → component tree → state management. 30 seconds of planning
  saves 5 minutes of refactoring.
- **xEngineer mindset:** Think about the user, not just the task. What
  does the empty state feel like? What happens on slow networks? What if
  they double-click submit?
- **Ship quality:** The grader will run the app for 30 seconds. They'll
  see: empty state → create an item → maybe search → maybe delete. Make
  those moments feel polished.

---

## File Structure Template

```
app/
├── layout.tsx          ← metadata, fonts, global providers
├── page.tsx            ← main page (data fetching + UI)
├── api/
│   └── [resource]/
│       ├── route.ts    ← GET (list) + POST (create)
│       └── [id]/
│           └── route.ts ← GET (single) + PATCH + DELETE
├── components/
│   ├── [Resource]List.tsx
│   ├── [Resource]Card.tsx
│   ├── [Resource]Form.tsx
│   └── SearchBar.tsx
lib/
├── store.ts            ← in-memory data store
└── utils.ts            ← shared helpers
types/
└── index.ts            ← all interfaces and types
```

---

## Time Budget (40 minutes)

| Phase | Minutes | What to do                                       |
| ----- | ------- | ------------------------------------------------ |
| 1     | 0–8     | Scaffold: types + store + API routes + basic page |
| 2     | 8–22    | Frontend: search, pagination, form UX, styling    |
| 3     | 22–30   | Harden: edge cases, error states, validation      |
| 4     | 30–35   | Polish: empty states, hover, transitions, meta    |
| 5     | 35–40   | Extra touch / bonus feature / final test          |

---

## In-Memory Store Pattern

```typescript
// lib/store.ts
import { Item } from '@/types';

let items: Item[] = [
  // seed data here
];
let nextId = items.length + 1;

export const store = {
  getAll: () => items,
  getById: (id: string) => items.find(i => i.id === id),
  create: (data: Omit<Item, 'id' | 'createdAt'>) => {
    const item: Item = {
      ...data,
      id: String(nextId++),
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    return item;
  },
  update: (id: string, data: Partial<Omit<Item, 'id'>>) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data };
    return items[idx];
  },
  delete: (id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    return true;
  },
};
```

> Adapt the `Item` type and seed data to match the task requirements.