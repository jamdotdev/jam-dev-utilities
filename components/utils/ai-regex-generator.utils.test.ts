import {
  buildRegexPrompt,
  getDefaultModel,
  parseRegexResponse,
} from "./ai-regex-generator.utils";

describe("buildRegexPrompt", () => {
  test("includes description and optional fields", () => {
    const prompt = buildRegexPrompt({
      description: "Match email addresses",
      sampleText: "test@example.com",
      expectedMatches: "test@example.com",
    });

    expect(prompt.system).toContain("regex patterns");
    expect(prompt.user).toContain("Match email addresses");
    expect(prompt.user).toContain("Sample text:");
    expect(prompt.user).toContain("Expected matches:");
    expect(prompt.user).toContain('"pattern"');
  });
});

describe("parseRegexResponse", () => {
  test("parses valid JSON response", () => {
    const result = parseRegexResponse(
      JSON.stringify({
        pattern: "\\d+",
        flags: "g",
        regex: "/\\d+/g",
        explanation: "Matches digits",
        examples: [{ text: "123", matches: ["123"] }],
        warnings: [],
      })
    );

    expect(result.regex).toBe("/\\d+/g");
    expect(result.pattern).toBe("\\d+");
    expect(result.flags).toBe("g");
    expect(result.explanation).toContain("digits");
    expect(result.examples).toHaveLength(1);
  });

  test("parses fenced JSON response", () => {
    const result = parseRegexResponse(
      "```json\n" +
        JSON.stringify({
          pattern: "[a-z]+",
          flags: "i",
          regex: "/[a-z]+/i",
          explanation: "Matches letters",
          examples: [],
          warnings: [],
        }) +
        "\n```"
    );

    expect(result.regex).toBe("/[a-z]+/i");
    expect(result.pattern).toBe("[a-z]+");
  });

  test("falls back to regex extraction when JSON is invalid", () => {
    const result = parseRegexResponse(
      "Try using /[A-Z]{2,}/g to match uppercase strings."
    );

    expect(result.regex).toBe("/[A-Z]{2,}/g");
    expect(result.warnings[0]).toContain("could not be parsed");
  });
});

describe("getDefaultModel", () => {
  test("returns provider defaults", () => {
    expect(getDefaultModel("openai")).toBe("gpt-4o-mini");
    expect(getDefaultModel("anthropic")).toBe("claude-3-haiku-20240307");
  });
});
