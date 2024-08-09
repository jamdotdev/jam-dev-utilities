import { envToToml } from "./env-to-toml.utils";

describe("envToToml", () => {
  it("should return an empty string for empty input", () => {
    const result = envToToml("");

    expect(result).toBe("");
  });

  it("should convert a single environment variable", () => {
    const envString = "KEY=value";
    const expectedOutput = `[context.production]
  environment = {KEY="value"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });

  it("should convert multiple environment variables", () => {
    const envString = "KEY1=value1\nKEY2=value2";
    const expectedOutput = `[context.production]
  environment = {KEY1="value1", KEY2="value2"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });

  it("should ignore comments", () => {
    const envString = "# This is a comment\nKEY=value";
    const expectedOutput = `[context.production]
  environment = {KEY="value"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });

  it("should ignore empty lines", () => {
    const envString = "\nKEY=value\n";
    const expectedOutput = `[context.production]
  environment = {KEY="value"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });

  it("should ignore both comments and empty lines", () => {
    const envString = "\n# Comment\nKEY1=value1\n\n# Comment\nKEY2=value2\n";
    const expectedOutput = `[context.production]
  environment = {KEY1="value1", KEY2="value2"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });

  it("should handle values with existing double quotes", () => {
    const envString = `NODE_VERSION="20.9.0"`;
    const expectedOutput = `[context.production]
  environment = {NODE_VERSION="20.9.0"}`;
    const result = envToToml(envString);

    expect(result).toBe(expectedOutput);
  });
});
