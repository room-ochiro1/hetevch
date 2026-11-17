import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Project rule: no source file may exceed 160 lines (see /CLAUDE.md).
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "max-lines": ["error", { max: 160, skipBlankLines: false, skipComments: false }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
