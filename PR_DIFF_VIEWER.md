## Summary
- Add new Diff Viewer utility with Monaco DiffEditor supporting text/code, JSON, YAML, and config diffs.
- Normalize structured inputs before diffing and expose inline/side-by-side, language, and ignore-whitespace controls.
- Include unified diff output, diff stats, and register the tool in the utilities list.

## Test Plan
- Open `/utilities/diff-viewer` and paste sample inputs for each mode.
- Toggle inline/side-by-side and ignore-whitespace; verify diff updates.
- Use the language selector for code mode; confirm highlighting.
- Click “Copy unified diff” and paste to confirm output.

## Screenshots
- N/A
