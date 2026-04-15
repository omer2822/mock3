import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command:
        "npm run build -w @live-poll/api && node -e \"import('./apps/api/dist/server.js'); setInterval(() => {}, 1 << 30)\"",
      url: "http://127.0.0.1:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "npm run dev -w @live-poll/web -- --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 120_000
    }
  ]
});
