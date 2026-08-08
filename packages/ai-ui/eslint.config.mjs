import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // Vendor-heavy AI Elements package: typecheck is the gate for now.
    // Tighten these ignores as files are cleaned up.
    ignores: ["src/components/ai-elements/**"],
  },
];
