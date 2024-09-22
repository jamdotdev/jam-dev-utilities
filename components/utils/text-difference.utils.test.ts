import { calculateDiff } from "./text-difference.utils";

describe("diff.utils", () => {
  it("should detect line additions, deletions, and unchanged lines", () => {
    const oldText = "Line one\nLine to be removed\nLine three";
    const newText = "Line one\nLine three\nLine four";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "Line one", type: "unchanged" },
      { text: "Line to be removed", type: "removed" },
      { text: "Line three", type: "removed" },
      { text: "Line three", type: "added" },
      { text: "Line four", type: "added" },
    ]);
  });

  it("should detect completely new lines", () => {
    const oldText = "";
    const newText = "New line one\nNew line two";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "New line one", type: "added" },
      { text: "New line two", type: "added" },
    ]);
  });

  it("should detect completely removed lines", () => {
    const oldText = "Old line one\nOld line two";
    const newText = "";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "Old line one", type: "removed" },
      { text: "Old line two", type: "removed" },
    ]);
  });

  it("should handle identical texts", () => {
    const oldText = "Same line one\nSame line two";
    const newText = "Same line one\nSame line two";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "Same line one", type: "unchanged" },
      { text: "Same line two", type: "unchanged" },
    ]);
  });

  it("should handle mixed changes", () => {
    const oldText = "Line one\nLine two\nLine three\nLine four";
    const newText = "Line one\nLine 2\nLine three\nLine four\nLine five";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "Line one", type: "unchanged" },
      { text: "Line two", type: "removed" },
      { text: "Line 2", type: "added" },
      { text: "Line three", type: "unchanged" },
      { text: "Line four", type: "removed" },
      { text: "Line four", type: "added" },
      { text: "Line five", type: "added" },
    ]);
  });

  it("should detect line changes as removals and additions", () => {
    const oldText = "Hello world";
    const newText = "Hello brave new world";
    const result = calculateDiff(oldText, newText);
    expect(result).toEqual([
      { text: "Hello world", type: "removed" },
      { text: "Hello brave new world", type: "added" },
    ]);
  });
});
