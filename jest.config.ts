import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  roots: ["<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|cmdk|@radix-ui)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePathIgnorePatterns: ["<rootDir>/build"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
};

const createJestConfigWithDefaults = createJestConfig(customJestConfig);

export default async () => {
  const config = await createJestConfigWithDefaults();
  config.transformIgnorePatterns = customJestConfig.transformIgnorePatterns;
  return config;
};
