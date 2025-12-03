import { createRegex, escapeRegexPattern } from "./regex-tester.utils";

describe("escapeRegexPattern", () => {
  test("should escape special regex characters", () => {
    expect(escapeRegexPattern("hello.world")).toBe("hello\\.world");
    expect(escapeRegexPattern("a*b+c?")).toBe("a\\*b\\+c\\?");
    expect(escapeRegexPattern("(test)")).toBe("\\(test\\)");
    expect(escapeRegexPattern("[abc]")).toBe("\\[abc\\]");
    expect(escapeRegexPattern("a{1,2}")).toBe("a\\{1,2\\}");
    expect(escapeRegexPattern("a|b")).toBe("a\\|b");
    expect(escapeRegexPattern("^start$end")).toBe("\\^start\\$end");
    expect(escapeRegexPattern("back\\slash")).toBe("back\\\\slash");
  });

  test("should return plain text unchanged", () => {
    expect(escapeRegexPattern("hello world")).toBe("hello world");
    expect(escapeRegexPattern("abc123")).toBe("abc123");
  });

  test("should handle empty string", () => {
    expect(escapeRegexPattern("")).toBe("");
  });
});

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
