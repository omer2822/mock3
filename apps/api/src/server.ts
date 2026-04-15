import { createApp } from "./app.js";

const port = 3001;
const app = createApp();

app.listen(port, () => {
  process.stdout.write(`API listening on http://localhost:${port}\n`);
});
