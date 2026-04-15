import express from "express";

import { healthRouter } from "./routes/health.js";
import { pollsRouter } from "./routes/polls.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use("/api/health", healthRouter);
  app.use("/api/polls", pollsRouter);

  return app;
}
