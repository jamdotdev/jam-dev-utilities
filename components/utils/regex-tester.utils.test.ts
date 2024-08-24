import { createRegex } from "./regex-tester.utils";

describe("createRegex", () => {
  test("should create regex from simple pattern without flags and delimiters", () => {
    const regex = createRegex("test");
    expect(regex).toEqual(/test/);
  });

  test("should create regex from pattern enclosed in slashes without flags", () => {
    const regex = createRegex("/test/");
    expect(regex).toEqual(/test/);
  });

  test("should create regex from pattern enclosed in slashes with valid flags", () => {
    const regex = createRegex("/test/g");
    expect(regex).toEqual(/test/g);
  });

  test("should throw error for empty string", () => {
    expect(() => createRegex("")).toThrow("Pattern must be a non-empty string");
  });

  test("should throw error for pattern with missing leading slash", () => {
    expect(() => createRegex("test/g")).toThrow(/regex delimiters/);
  });

  test("should throw error for non-string input", () => {
    expect(() => createRegex(123 as unknown as string)).toThrow(
      "Pattern must be a non-empty string"
    );
  });

  test("should throw error for pattern with invalid flags", () => {
    expect(() => createRegex("/test/x")).toThrow("Invalid regex flags: x");
  });

  test("should throw error for pattern with duplicate flags", () => {
    expect(() => createRegex("/test/gg")).toThrow(
      "Duplicate flags are not allowed: gg"
    );
  });

  test("should throw error for pattern with missing closing slash", () => {
    expect(() => createRegex("/test")).toThrow(
      "Invalid regex: missing closing slash"
    );
  });

  test("should throw error for pattern with invalid regex syntax", () => {
    expect(() => createRegex("/[a-z/")).toThrow(
      "Invalid regular expression: /[a-z/: Unterminated character class"
    );
  });

  test("should create regex from pattern with special characters", () => {
    const regex = createRegex("/\\d+/");
    expect(regex).toEqual(/\d+/);
  });
});
