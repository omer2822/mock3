import nodeConfig from "@live-poll/config/eslint/node";

export default [
  {
    ignores: ["dist/**"]
  },
  ...nodeConfig
];
