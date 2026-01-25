import {
  extractVariables,
  resolveTemplate,
  calculateWeightedScore,
  getScoreColorClass,
  getScoreBgClass,
  getModelById,
  getProviderById,
  getProviderForModel,
  JudgeEvaluationSchema,
  ScoreBreakdownSchema,
  DEFAULT_CRITERIA_WEIGHTS,
} from "./ai-eval-schemas";

describe("extractVariables", () => {
  it("extracts single variable", () => {
    const result = extractVariables("Hello {{name}}!");
    expect(result).toEqual(["name"]);
  });

  it("extracts multiple variables", () => {
    const result = extractVariables("{{greeting}} {{name}}, how are you?");
    expect(result).toEqual(["greeting", "name"]);
  });

  it("extracts duplicate variables only once", () => {
    const result = extractVariables("{{name}} and {{name}} again");
    expect(result).toEqual(["name"]);
  });

  it("returns empty array when no variables", () => {
    const result = extractVariables("Hello world!");
    expect(result).toEqual([]);
  });

  it("handles variables with underscores", () => {
    const result = extractVariables("{{first_name}} {{last_name}}");
    expect(result).toEqual(["first_name", "last_name"]);
  });

  it("handles variables with numbers", () => {
    const result = extractVariables("{{var1}} {{var2}}");
    expect(result).toEqual(["var1", "var2"]);
  });
});

describe("resolveTemplate", () => {
  it("resolves single variable", () => {
    const result = resolveTemplate("Hello {{name}}!", { name: "World" });
    expect(result).toBe("Hello World!");
  });

  it("resolves multiple variables", () => {
    const result = resolveTemplate("{{greeting}} {{name}}!", {
      greeting: "Hi",
      name: "Alice",
    });
    expect(result).toBe("Hi Alice!");
  });

  it("keeps unreplaced variables as-is", () => {
    const result = resolveTemplate("Hello {{name}} and {{other}}!", {
      name: "World",
    });
    expect(result).toBe("Hello World and {{other}}!");
  });

  it("handles empty variables object", () => {
    const result = resolveTemplate("Hello {{name}}!", {});
    expect(result).toBe("Hello {{name}}!");
  });

  it("handles template without variables", () => {
    const result = resolveTemplate("Hello World!", { name: "Test" });
    expect(result).toBe("Hello World!");
  });
});

describe("calculateWeightedScore", () => {
  it("calculates weighted score correctly", () => {
    const scores = {
      accuracy: 8,
      relevance: 9,
      clarity: 7,
      completeness: 8,
      conciseness: 6,
    };

    const weights = {
      accuracy: 0.2,
      relevance: 0.2,
      clarity: 0.2,
      completeness: 0.2,
      conciseness: 0.2,
    };

    const result = calculateWeightedScore(scores, weights);
    // (8*0.2 + 9*0.2 + 7*0.2 + 8*0.2 + 6*0.2) = 7.6
    expect(result).toBe(7.6);
  });

  it("handles uneven weights", () => {
    const scores = {
      accuracy: 10,
      relevance: 5,
      clarity: 5,
      completeness: 5,
      conciseness: 5,
    };

    const weights = {
      accuracy: 0.5,
      relevance: 0.125,
      clarity: 0.125,
      completeness: 0.125,
      conciseness: 0.125,
    };

    const result = calculateWeightedScore(scores, weights);
    // (10*0.5 + 5*0.125 + 5*0.125 + 5*0.125 + 5*0.125) = 7.5
    expect(result).toBe(7.5);
  });

  it("uses default weights", () => {
    const scores = {
      accuracy: 8,
      relevance: 8,
      clarity: 8,
      completeness: 8,
      conciseness: 8,
    };

    const result = calculateWeightedScore(scores, DEFAULT_CRITERIA_WEIGHTS);
    expect(result).toBe(8);
  });
});

describe("getScoreColorClass", () => {
  it("returns green for high scores (8-10)", () => {
    expect(getScoreColorClass(8)).toContain("green");
    expect(getScoreColorClass(9)).toContain("green");
    expect(getScoreColorClass(10)).toContain("green");
  });

  it("returns yellow for medium scores (5-7)", () => {
    expect(getScoreColorClass(5)).toContain("yellow");
    expect(getScoreColorClass(6)).toContain("yellow");
    expect(getScoreColorClass(7)).toContain("yellow");
  });

  it("returns red for low scores (1-4)", () => {
    expect(getScoreColorClass(1)).toContain("red");
    expect(getScoreColorClass(4)).toContain("red");
  });
});

describe("getScoreBgClass", () => {
  it("returns green background for high scores", () => {
    expect(getScoreBgClass(8)).toContain("green");
  });

  it("returns yellow background for medium scores", () => {
    expect(getScoreBgClass(6)).toContain("yellow");
  });

  it("returns red background for low scores", () => {
    expect(getScoreBgClass(3)).toContain("red");
  });
});

describe("getModelById", () => {
  it("finds OpenAI model", () => {
    const model = getModelById("gpt-4o");
    expect(model).toBeDefined();
    expect(model?.name).toBe("GPT-4o");
    expect(model?.providerId).toBe("openai");
  });

  it("finds Anthropic model", () => {
    const model = getModelById("claude-3-5-sonnet-20241022");
    expect(model).toBeDefined();
    expect(model?.name).toBe("Claude 3.5 Sonnet");
    expect(model?.providerId).toBe("anthropic");
  });

  it("finds Google model", () => {
    const model = getModelById("gemini-2.0-flash-exp");
    expect(model).toBeDefined();
    expect(model?.name).toBe("Gemini 2.0 Flash");
    expect(model?.providerId).toBe("google");
  });

  it("returns undefined for unknown model", () => {
    const model = getModelById("unknown-model");
    expect(model).toBeUndefined();
  });
});

describe("getProviderById", () => {
  it("finds OpenAI provider", () => {
    const provider = getProviderById("openai");
    expect(provider).toBeDefined();
    expect(provider?.name).toBe("OpenAI");
  });

  it("finds Anthropic provider", () => {
    const provider = getProviderById("anthropic");
    expect(provider).toBeDefined();
    expect(provider?.name).toBe("Anthropic");
  });

  it("finds Google provider", () => {
    const provider = getProviderById("google");
    expect(provider).toBeDefined();
    expect(provider?.name).toBe("Google AI");
  });
});

describe("getProviderForModel", () => {
  it("returns correct provider for model", () => {
    const provider = getProviderForModel("gpt-4o");
    expect(provider?.id).toBe("openai");
  });

  it("returns undefined for unknown model", () => {
    const provider = getProviderForModel("unknown");
    expect(provider).toBeUndefined();
  });
});

describe("Zod Schemas", () => {
  describe("ScoreBreakdownSchema", () => {
    it("validates valid scores", () => {
      const valid = {
        accuracy: 8,
        relevance: 7,
        clarity: 9,
        completeness: 6,
        conciseness: 8,
      };

      const result = ScoreBreakdownSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects scores below 1", () => {
      const invalid = {
        accuracy: 0,
        relevance: 7,
        clarity: 9,
        completeness: 6,
        conciseness: 8,
      };

      const result = ScoreBreakdownSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects scores above 10", () => {
      const invalid = {
        accuracy: 11,
        relevance: 7,
        clarity: 9,
        completeness: 6,
        conciseness: 8,
      };

      const result = ScoreBreakdownSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects missing fields", () => {
      const invalid = {
        accuracy: 8,
        relevance: 7,
      };

      const result = ScoreBreakdownSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("JudgeEvaluationSchema", () => {
    it("validates valid evaluation", () => {
      const valid = {
        scores: {
          accuracy: 8,
          relevance: 7,
          clarity: 9,
          completeness: 6,
          conciseness: 8,
        },
        overallScore: 7.6,
        reasoning: "Good response overall.",
      };

      const result = JudgeEvaluationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("validates evaluation with winner", () => {
      const valid = {
        scores: {
          accuracy: 8,
          relevance: 7,
          clarity: 9,
          completeness: 6,
          conciseness: 8,
        },
        overallScore: 7.6,
        reasoning: "Good response overall.",
        winner: "A",
      };

      const result = JudgeEvaluationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid winner value", () => {
      const invalid = {
        scores: {
          accuracy: 8,
          relevance: 7,
          clarity: 9,
          completeness: 6,
          conciseness: 8,
        },
        overallScore: 7.6,
        reasoning: "Good response overall.",
        winner: "C",
      };

      const result = JudgeEvaluationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects reasoning over 1000 chars", () => {
      const invalid = {
        scores: {
          accuracy: 8,
          relevance: 7,
          clarity: 9,
          completeness: 6,
          conciseness: 8,
        },
        overallScore: 7.6,
        reasoning: "a".repeat(1001),
      };

      const result = JudgeEvaluationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
