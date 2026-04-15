import globals from "globals";

import { baseConfig } from "./base.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
];
