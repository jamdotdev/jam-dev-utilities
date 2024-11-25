import { calculateDiff, DiffResult } from "./text-difference.utils";

describe("text-difference.utils", () => {
  it("should detect line additions, deletions, and unchanged lines", () => {
    const oldText = "Line one\nLine to be removed\nLine three";
    const newText = "Line one\nLine three\nLine four";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Line one", type: "unchanged" },
      { text: "Line to be removed", type: "removed" },
      { text: "Line three", type: "unchanged" },
      { text: "Line four", type: "added" },
    ];
    expect(result).toEqual(expected);
  });

  it("should detect completely new lines", () => {
    const oldText = "";
    const newText = "New line one\nNew line two";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "New line one", type: "added" },
      { text: "New line two", type: "added" },
    ];
    expect(result).toEqual(expected);
  });

  it("should detect completely removed lines", () => {
    const oldText = "Old line one\nOld line two";
    const newText = "";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Old line one", type: "removed" },
      { text: "Old line two", type: "removed" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle identical texts", () => {
    const oldText = "Same line one\nSame line two";
    const newText = "Same line one\nSame line two";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Same line one", type: "unchanged" },
      { text: "Same line two", type: "unchanged" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle mixed changes", () => {
    const oldText = "Line one\nLine two\nLine three\nLine four";
    const newText = "Line one\nLine 2\nLine three\nLine four\nLine five";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Line one", type: "unchanged" },
      { text: "Line two", type: "removed" },
      { text: "Line 2", type: "added" },
      { text: "Line three", type: "unchanged" },
      { text: "Line four", type: "unchanged" },
      { text: "Line five", type: "added" },
    ];
    expect(result).toEqual(expected);
  });

  it("should detect line changes as removals and additions", () => {
    const oldText = "Hello world";
    const newText = "Hello brave new world";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Hello world", type: "removed" },
      { text: "Hello brave new world", type: "added" },
    ];
    expect(result).toEqual(expected);
  });

  it("should ignore the last empty line if present", () => {
    const oldText = "Line one\nLine two\n";
    const newText = "Line one\nLine two\nLine three\n";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Line one", type: "unchanged" },
      { text: "Line two", type: "unchanged" },
      { text: "Line three", type: "added" },
    ];
    expect(result).toEqual(expected);
  });

  it("should throw an error when inputs are not strings", () => {
    // @ts-expect-error Testing with invalid inputs
    expect(() => calculateDiff(null, "Valid string")).toThrow(
      "Failed to calculate text differences."
    );

    // @ts-expect-error Testing with invalid inputs
    expect(() => calculateDiff("Valid string", undefined)).toThrow(
      "Failed to calculate text differences."
    );
  });

  it("should handle inputs with only whitespace", () => {
    const oldText = "   \n\t\n";
    const newText = "   \n\t\n";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "   ", type: "unchanged" },
      { text: "\t", type: "unchanged" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle large texts efficiently", () => {
    const oldText = Array.from(
      { length: 1000 },
      (_, i) => `Line ${i + 1}`
    ).join("\n");
    const newText = Array.from(
      { length: 1000 },
      (_, i) => `Line ${i + 1}`
    ).join("\n");
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = Array.from({ length: 1000 }, (_, i) => ({
      text: `Line ${i + 1}`,
      type: "unchanged" as const,
    }));
    expect(result).toEqual(expected);
  });

  it("should handle texts without trailing newline correctly", () => {
    const oldText = "Line one\nLine two";
    const newText = "Line one\nLine two\nLine three";
    const result = calculateDiff(oldText, newText);
    const expected: DiffResult[] = [
      { text: "Line one", type: "unchanged" },
      { text: "Line two", type: "unchanged" },
      { text: "Line three", type: "added" },
    ];
    expect(result).toEqual(expected);
  });
});
