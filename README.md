# Live Poll Dashboard

A small full-stack monorepo for a live poll dashboard.

## Stack

- React + Vite frontend
- Express backend
- npm workspaces monorepo
- TypeScript + ESLint

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run Dev

Start both frontend and backend together:

```bash
npm run dev
```

Apps will be available at:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

Useful workspace scripts:

```bash
# frontend only
npm run dev:web

# backend only
npm run dev:api
```

## Verify

```bash
# frontend tests
npm run test -w @live-poll/web

# lint all workspaces
npm run lint

# build all workspaces
npm run build
```

## Project Structure

```text
apps/
  api/   Express API
  web/   React + Vite app
packages/
  config/ shared TS and ESLint config
```

## Notes

- The frontend calls the backend through the Vite proxy in development.
- Poll APIs are served under `/api/polls`.
