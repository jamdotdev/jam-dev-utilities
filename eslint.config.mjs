import js from "@eslint/js";
import typescriptEslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "public/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
