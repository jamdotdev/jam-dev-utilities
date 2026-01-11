import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  roots: ["<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePathIgnorePatterns: ["<rootDir>/build"],
  testMatch: [
    "**/__tests__/**/*.(spec|test).+(ts|tsx|js)",
    "**/*.(spec|test).+(ts|tsx|js)",
  ],
};

export default createJestConfig(customJestConfig);
