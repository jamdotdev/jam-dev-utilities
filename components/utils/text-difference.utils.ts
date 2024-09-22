import { diffLines } from "diff";

export function calculateDiff(oldText: string, newText: string) {
  const diff = diffLines(oldText, newText);
  return diff
    .map((part) => {
      const lineType = part.added
        ? "added"
        : part.removed
          ? "removed"
          : "unchanged";
      const lines = part.value.split("\n").map((line) => ({
        text: line,
        type: lineType,
      }));
      // Remove the last empty line if present
      if (lines[lines.length - 1]?.text === "") {
        lines.pop();
      }
      return lines;
    })
    .flat();
}
