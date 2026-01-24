import React, { useMemo, useState } from "react";
import { DiffEditor, type BeforeMount } from "@monaco-editor/react";
import yaml from "js-yaml";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import Header from "@/components/Header";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ds/TabsComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";

type DiffMode = "text" | "json" | "yaml" | "config";
type ViewMode = "side-by-side" | "inline";

const diffModes: { value: DiffMode; label: string }[] = [
  { value: "text", label: "Text/Code" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "config", label: "Config" },
];

const languageOptions = [
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "shell", label: "Shell" },
];

const DEFAULT_LANGUAGE = "javascript";

const normalizeWhitespaceForDiff = (value: string) => {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .join("\n");
};

const sortObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
};

const normalizeConfig = (value: string) => {
  const lines = value.split(/\r?\n/);
  let section = "";
  const entries: { key: string; value: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) {
      continue;
    }

    const sectionMatch = trimmed.match(/^\[(.+)]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const valuePart = trimmed.slice(separatorIndex + 1).trim();
    const fullKey = section ? `${section}.${key}` : key;
    entries.push({ key: fullKey, value: valuePart });
  }

  return entries
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((entry) => `${entry.key}=${entry.value}`)
    .join("\n");
};

const normalizeInput = (value: string, mode: DiffMode) => {
  if (mode === "text") {
    return { value, error: "" };
  }

  try {
    if (mode === "json") {
      const parsed = JSON.parse(value);
      const normalized = sortObject(parsed);
      return { value: JSON.stringify(normalized, null, 2), error: "" };
    }

    if (mode === "yaml") {
      const parsed = yaml.load(value);
      const normalized = sortObject(parsed);
      return {
        value: yaml.dump(normalized, { sortKeys: true, lineWidth: -1 }),
        error: "",
      };
    }

    return { value: normalizeConfig(value), error: "" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to parse input.";
    return { value, error: message };
  }
};

type DiffEntry = { type: "equal" | "add" | "remove"; line: string };

const splitLines = (value: string) => value.split(/\r?\n/);

const buildDiffEntries = (original: string, modified: string): DiffEntry[] => {
  const originalLines = splitLines(original);
  const modifiedLines = splitLines(modified);
  const rows = originalLines.length;
  const cols = modifiedLines.length;
  const table = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0)
  );

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      if (originalLines[i] === modifiedLines[j]) {
        table[i][j] = table[i + 1][j + 1] + 1;
      } else {
        table[i][j] = Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
  }

  const entries: DiffEntry[] = [];
  let i = 0;
  let j = 0;

  while (i < rows && j < cols) {
    if (originalLines[i] === modifiedLines[j]) {
      entries.push({ type: "equal", line: originalLines[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      entries.push({ type: "remove", line: originalLines[i] });
      i += 1;
    } else {
      entries.push({ type: "add", line: modifiedLines[j] });
      j += 1;
    }
  }

  while (i < rows) {
    entries.push({ type: "remove", line: originalLines[i] });
    i += 1;
  }

  while (j < cols) {
    entries.push({ type: "add", line: modifiedLines[j] });
    j += 1;
  }

  return entries;
};

const buildUnifiedDiff = (
  original: string,
  modified: string,
  contextLines = 3
) => {
  const entries = buildDiffEntries(original, modified);
  const changeIndices = entries
    .map((entry, index) => (entry.type === "equal" ? -1 : index))
    .filter((index) => index !== -1);

  if (changeIndices.length === 0) {
    return "";
  }

  const ranges: Array<{ start: number; end: number }> = [];
  let currentStart = Math.max(0, changeIndices[0] - contextLines);
  let currentEnd = Math.min(entries.length, changeIndices[0] + contextLines + 1);

  for (let i = 1; i < changeIndices.length; i += 1) {
    const nextChange = changeIndices[i];
    if (nextChange < currentEnd) {
      currentEnd = Math.min(entries.length, nextChange + contextLines + 1);
    } else {
      ranges.push({ start: currentStart, end: currentEnd });
      currentStart = Math.max(0, nextChange - contextLines);
      currentEnd = Math.min(entries.length, nextChange + contextLines + 1);
    }
  }
  ranges.push({ start: currentStart, end: currentEnd });

  const positions: Array<{ originalLine: number; modifiedLine: number }> = [];
  let originalLine = 1;
  let modifiedLine = 1;

  entries.forEach((entry) => {
    positions.push({ originalLine, modifiedLine });
    if (entry.type !== "add") {
      originalLine += 1;
    }
    if (entry.type !== "remove") {
      modifiedLine += 1;
    }
  });

  const diffLines = ["--- Original", "+++ Modified"];

  for (const range of ranges) {
    const startPosition = positions[range.start];
    const rangeEntries = entries.slice(range.start, range.end);
    const originalCount = rangeEntries.filter((entry) => entry.type !== "add")
      .length;
    const modifiedCount = rangeEntries.filter((entry) => entry.type !== "remove")
      .length;

    diffLines.push(
      `@@ -${startPosition.originalLine},${originalCount} +${startPosition.modifiedLine},${modifiedCount} @@`
    );

    rangeEntries.forEach((entry) => {
      const prefix =
        entry.type === "add" ? "+" : entry.type === "remove" ? "-" : " ";
      diffLines.push(`${prefix}${entry.line}`);
    });
  }

  return diffLines.join("\n");
};

export default function DiffViewer() {
  const [diffMode, setDiffMode] = useState<DiffMode>("text");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [originalInput, setOriginalInput] = useState("");
  const [modifiedInput, setModifiedInput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard("Copy unified diff");

  const { normalizedOriginal, normalizedModified, originalError, modifiedError } =
    useMemo(() => {
      const original = normalizeInput(originalInput, diffMode);
      const modified = normalizeInput(modifiedInput, diffMode);
      return {
        normalizedOriginal: original.value,
        normalizedModified: modified.value,
        originalError: original.error,
        modifiedError: modified.error,
      };
    }, [originalInput, modifiedInput, diffMode]);

  const diffSourceOriginal = useMemo(
    () =>
      ignoreWhitespace
        ? normalizeWhitespaceForDiff(normalizedOriginal)
        : normalizedOriginal,
    [ignoreWhitespace, normalizedOriginal]
  );

  const diffSourceModified = useMemo(
    () =>
      ignoreWhitespace
        ? normalizeWhitespaceForDiff(normalizedModified)
        : normalizedModified,
    [ignoreWhitespace, normalizedModified]
  );

  const { addedLines, removedLines } = useMemo(() => {
    const entries = buildDiffEntries(diffSourceOriginal, diffSourceModified);
    return entries.reduce(
      (acc, entry) => {
        if (entry.type === "add") {
          acc.addedLines += 1;
        }
        if (entry.type === "remove") {
          acc.removedLines += 1;
        }
        return acc;
      },
      { addedLines: 0, removedLines: 0 }
    );
  }, [diffSourceOriginal, diffSourceModified]);

  const unifiedDiff = useMemo(
    () => buildUnifiedDiff(diffSourceOriginal, diffSourceModified, 3),
    [diffSourceOriginal, diffSourceModified]
  );

  const hasDiff = diffSourceOriginal !== diffSourceModified;
  const showLanguageSelector = diffMode === "text";
  const editorLanguage =
    diffMode === "text"
      ? language
      : diffMode === "json"
        ? "json"
        : diffMode === "yaml"
          ? "yaml"
          : "ini";

  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("customTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#e4e4e7",
        "editor.lineHighlightBackground": "#18181b",
        "editor.selectionBackground": "#3f3f46",
        "editorCursor.foreground": "#e4e4e7",
        "editorWhitespace.foreground": "#3f3f46",
      },
    });
  };

  return (
    <main>
      <Meta
        title="Diff Viewer | Free, Open Source & Ad-free"
        description="Compare text, code, JSON, YAML, and config files with an inline or side-by-side diff viewer."
      />
      <Header />
      <CMDK />

      <section className="max-w-2xl mx-auto mb-12">
        <PageHeader
          title="Diff Viewer"
          description="Compare text, code, JSON, YAML, and config files."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col gap-6 p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs value={diffMode} onValueChange={(value) => setDiffMode(value as DiffMode)}>
              <TabsList>
                {diffModes.map((mode) => (
                  <TabsTrigger key={mode.value} value={mode.value}>
                    {mode.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList>
                <TabsTrigger value="side-by-side">Side-by-side</TabsTrigger>
                <TabsTrigger value="inline">Inline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="diff-original">Original</Label>
              <Textarea
                id="diff-original"
                value={originalInput}
                onChange={(event) => setOriginalInput(event.target.value)}
                placeholder="Paste the original content..."
                className="min-h-[160px]"
              />
              {originalError && (
                <p className="mt-2 text-xs text-red-500">{originalError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="diff-modified">Modified</Label>
              <Textarea
                id="diff-modified"
                value={modifiedInput}
                onChange={(event) => setModifiedInput(event.target.value)}
                placeholder="Paste the modified content..."
                className="min-h-[160px]"
              />
              {modifiedError && (
                <p className="mt-2 text-xs text-red-500">{modifiedError}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="diff-ignore-whitespace"
                checked={ignoreWhitespace}
                onCheckedChange={(value) => setIgnoreWhitespace(Boolean(value))}
              />
              <Label htmlFor="diff-ignore-whitespace" className="mb-0">
                Ignore whitespace
              </Label>
            </div>
            {showLanguageSelector && (
              <div className="flex items-center gap-2">
                <Label className="mb-0">Language</Label>
                <Combobox
                  data={languageOptions}
                  value={language}
                  onSelect={setLanguage}
                />
              </div>
            )}
          </div>

          <div className="rounded-lg overflow-hidden border border-border">
            <DiffEditor
              height="420px"
              original={normalizedOriginal}
              modified={normalizedModified}
              language={editorLanguage}
              theme="customTheme"
              beforeMount={beforeMount}
              options={{
                readOnly: true,
                renderSideBySide: viewMode === "side-by-side",
                ignoreTrimWhitespace: ignoreWhitespace,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                renderOverviewRuler: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {addedLines} added · {removedLines} removed
            </div>
            <Button
              variant="outline"
              onClick={() => handleCopy(unifiedDiff)}
              disabled={!hasDiff}
            >
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}
