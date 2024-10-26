import { diffLines, Change } from "diff";

export type DiffResult = {
  text: string;
  type: "added" | "removed" | "unchanged";
};

export function calculateDiff(oldText: string, newText: string): DiffResult[] {
  try {
    const normalizedOldText =
      oldText === "" ? "" : oldText.endsWith("\n") ? oldText : oldText + "\n";
    const normalizedNewText =
      newText === "" ? "" : newText.endsWith("\n") ? newText : newText + "\n";

    const diff: Change[] = diffLines(normalizedOldText, normalizedNewText);

    return diff
      .map((part) => {
        const lineType: DiffResult["type"] = part.added
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
  } catch (error) {
    throw new Error("Failed to calculate text differences.");
  }
}
