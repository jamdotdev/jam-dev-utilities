import {
  createRegex,
  parseRegexPattern,
  formatRegexWithFlags,
  testRegexPattern,
  commonPatterns,
} from "./regex-tester.utils";

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

describe("parseRegexPattern", () => {
  test("should parse pattern with slashes and flags", () => {
    const result = parseRegexPattern("/test/gi");
    expect(result.pattern).toBe("test");
    expect(result.flags.global).toBe(true);
    expect(result.flags.ignoreCase).toBe(true);
    expect(result.flags.multiline).toBe(false);
  });

  test("should parse pattern without slashes", () => {
    const result = parseRegexPattern("test");
    expect(result.pattern).toBe("test");
    expect(result.flags.global).toBe(false);
    expect(result.flags.ignoreCase).toBe(false);
  });

  test("should parse pattern with slashes but no flags", () => {
    const result = parseRegexPattern("/test/");
    expect(result.pattern).toBe("test");
    expect(result.flags.global).toBe(false);
  });

  test("should parse all flags correctly", () => {
    const result = parseRegexPattern("/test/gimsuy");
    expect(result.flags.global).toBe(true);
    expect(result.flags.ignoreCase).toBe(true);
    expect(result.flags.multiline).toBe(true);
    expect(result.flags.dotAll).toBe(true);
    expect(result.flags.unicode).toBe(true);
    expect(result.flags.sticky).toBe(true);
  });
});

describe("formatRegexWithFlags", () => {
  test("should format pattern with flags", () => {
    const flags = {
      global: true,
      ignoreCase: true,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = formatRegexWithFlags("test", flags);
    expect(result).toBe("/test/gi");
  });

  test("should format pattern without flags", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = formatRegexWithFlags("test", flags);
    expect(result).toBe("test");
  });

  test("should format pattern with all flags", () => {
    const flags = {
      global: true,
      ignoreCase: true,
      multiline: true,
      dotAll: true,
      unicode: true,
      sticky: true,
    };
    const result = formatRegexWithFlags("test", flags);
    expect(result).toBe("/test/gimsuy");
  });
});

describe("testRegexPattern", () => {
  test("should find single match", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("test", "this is a test string", flags);

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe("test");
    expect(result.matches[0].index).toBe(10);
    expect(result.matches[0].length).toBe(4);
  });

  test("should find multiple matches with global flag", () => {
    const flags = {
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("test", "test test test", flags);

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(3);
    expect(result.matches.length).toBe(3);
  });

  test("should handle case insensitive matching", () => {
    const flags = {
      global: false,
      ignoreCase: true,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("test", "TEST", flags);

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe("TEST");
  });

  test("should handle capture groups", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("(\\w+)@(\\w+)", "user@example", flags);

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].groups).toEqual(["user", "example"]);
  });

  test("should handle invalid regex pattern", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("[invalid", "test string", flags);

    expect(result.isValid).toBe(false);
    expect(result.totalMatches).toBe(0);
    expect(result.error).toBeDefined();
  });

  test("should handle no matches", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern("xyz", "test string", flags);

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(0);
    expect(result.matches).toEqual([]);
  });
});

describe("commonPatterns", () => {
  test("should contain email pattern", () => {
    expect(commonPatterns.email).toBeDefined();
    expect(commonPatterns.email.pattern).toBeDefined();
    expect(commonPatterns.email.description).toBe("Email address");
    expect(commonPatterns.email.example).toBe("user@example.com");
  });

  test("should contain phone pattern", () => {
    expect(commonPatterns.phone).toBeDefined();
    expect(commonPatterns.phone.description).toBe("Phone number");
  });

  test("should contain url pattern", () => {
    expect(commonPatterns.url).toBeDefined();
    expect(commonPatterns.url.description).toBe("URL");
  });

  test("email pattern should work with test function", () => {
    const flags = {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    };
    const result = testRegexPattern(
      commonPatterns.email.pattern,
      "Contact us at support@jam.dev",
      flags
    );

    expect(result.isValid).toBe(true);
    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe("support@jam.dev");
  });
});
