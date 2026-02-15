import CallToActionGrid from "@/components/CallToActionGrid";
import { CMDK } from "@/components/CMDK";
import { Button } from "@/components/ds/ButtonComponent";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import Meta from "@/components/Meta";
import PageHeader from "@/components/PageHeader";
import JsonlValidatorSEO from "@/components/seo/JsonlValidatorSEO";
import type { JsonlParseError } from "@/components/utils/jsonl-validator.utils";
import {
  parseJsonLines,
  toJsonArrayString,
} from "@/components/utils/jsonl-validator.utils";
import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  UIEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

const EXAMPLE_JSONL = [
  '{"timestamp":"2025-02-15T14:10:00Z","level":"info","event":"build_started"}',
  '{"timestamp":"2025-02-15T14:11:12Z","level":"warn","event":"cache_miss","service":"api"}',
  '{"timestamp":"2025-02-15T14:12:41Z","level":"error","event":"timeout","service":"search","duration_ms":3200}',
].join("\n");
const LINE_HEIGHT_PX = 24;
const MAX_ISSUES_SHOWN = 20;

export default function JsonlValidator() {
  const [input, setInput] = useState("");
  const [activeIssueLine, setActiveIssueLine] = useState<number | null>(null);
  const { buttonText, handleCopy } = useCopyToClipboard();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => parseJsonLines(input), [input]);
  const hasErrors = result.invalidLines > 0;
  const output = useMemo(() => {
    if (result.validLines === 0) {
      return "";
    }

    return toJsonArrayString(result.records);
  }, [result.validLines, result.records]);

  const topKeys = useMemo(() => {
    return Object.entries(result.keyFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [result.keyFrequency]);

  const lineNumbers = useMemo(() => {
    const lineCount = Math.max(1, input.split(/\r?\n/).length);
    return Array.from({ length: lineCount }, (_, index) => index + 1);
  }, [input]);

  const errorByLine = useMemo(() => {
    const map = new Map<number, JsonlParseError>();

    result.errors.forEach((error) => {
      if (!map.has(error.lineNumber)) {
        map.set(error.lineNumber, error);
      }
    });

    return map;
  }, [result.errors]);

  const liveSummary = useMemo(() => {
    if (input.trim() === "") {
      return "";
    }

    if (hasErrors) {
      return `${result.invalidLines} invalid rows found. Use the issues list to jump to exact lines.`;
    }

    return `${result.validLines} valid rows. No invalid lines found.`;
  }, [hasErrors, input, result.invalidLines, result.validLines]);

  const handleJumpToIssue = useCallback(
    (lineNumber: number, columnNumber?: number) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const lines = textarea.value.split("\n");
      if (lines.length === 0) {
        return;
      }

      const safeLine = Math.min(Math.max(1, lineNumber), lines.length);
      const safeColumn = Math.max(1, columnNumber ?? 1);

      let caretOffset = 0;
      for (let lineIndex = 0; lineIndex < safeLine - 1; lineIndex++) {
        caretOffset += lines[lineIndex].length + 1;
      }

      const lineContent = lines[safeLine - 1] ?? "";
      const clampedColumn = Math.min(safeColumn - 1, lineContent.length);
      const caretPosition = caretOffset + clampedColumn;

      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);

      const targetScrollTop = Math.max(0, (safeLine - 2) * LINE_HEIGHT_PX);
      textarea.scrollTop = targetScrollTop;
      if (gutterRef.current) {
        gutterRef.current.scrollTop = targetScrollTop;
      }

      setActiveIssueLine(safeLine);
    },
    []
  );

  const handleInputScroll = useCallback(
    (event: UIEvent<HTMLTextAreaElement>) => {
      if (gutterRef.current) {
        gutterRef.current.scrollTop = event.currentTarget.scrollTop;
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.currentTarget.value);
      if (activeIssueLine !== null) {
        setActiveIssueLine(null);
      }
    },
    [activeIssueLine]
  );

  const handleLoadExample = useCallback(() => {
    setInput(EXAMPLE_JSONL);
    setActiveIssueLine(null);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setActiveIssueLine(null);
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <main>
      <Meta
        title="JSONL Validator for AI Logs & Event Streams | Free Tool"
        description="Validate AI dataset rows, observability logs, and event stream payloads with line-level error jumps and clean JSON export."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="JSONL Validator"
          description="Validate JSONL for AI datasets, logs, and event streams."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <Label>JSONL Input</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleLoadExample}>
                  Load Example
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              {liveSummary}
            </p>

            <div className="mb-6 rounded-lg border border-input bg-muted overflow-hidden">
              <div className="grid grid-cols-[56px_1fr]">
                <div
                  className="border-r border-input bg-muted/80"
                  aria-hidden="true"
                >
                  <div ref={gutterRef} className="h-72 overflow-hidden py-2">
                    {lineNumbers.map((lineNumber) => {
                      const error = errorByLine.get(lineNumber);
                      const isActive = activeIssueLine === lineNumber;

                      return (
                        <div
                          key={lineNumber}
                          className={cn(
                            "h-6 px-2 flex items-center justify-end gap-1 text-xs font-mono",
                            error
                              ? "bg-destructive/10 text-destructive"
                              : "text-muted-foreground",
                            isActive
                              ? "ring-1 ring-inset ring-destructive/60"
                              : ""
                          )}
                        >
                          <span className="inline-block min-w-[8px] text-right">
                            {error ? "!" : ""}
                          </span>
                          <span>{lineNumber}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  rows={12}
                  wrap="off"
                  spellCheck={false}
                  placeholder='{"id":1,"event":"start"}'
                  onChange={handleInputChange}
                  onScroll={handleInputScroll}
                  className="h-72 resize-none rounded-none border-0 bg-transparent font-mono leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={input}
                  aria-invalid={hasErrors}
                  aria-describedby={hasErrors ? "jsonl-issues" : undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <MetricCard label="Lines" value={result.totalLines} />
              <MetricCard label="Valid" value={result.validLines} />
              <MetricCard label="Invalid" value={result.invalidLines} />
              <MetricCard label="Empty" value={result.emptyLines} />
            </div>

            {hasErrors && (
              <div
                id="jsonl-issues"
                className="rounded-xl border border-input bg-muted/40 p-3 mb-6"
              >
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full bg-destructive/80"
                  />
                  Invalid rows found. Select an issue to jump to the exact line.
                </p>
                <ul className="mt-3 space-y-2">
                  {result.errors.slice(0, MAX_ISSUES_SHOWN).map((error) => (
                    <li key={`${error.lineNumber}-${error.message}`}>
                      <button
                        type="button"
                        onClick={() =>
                          handleJumpToIssue(
                            error.lineNumber,
                            error.columnNumber
                          )
                        }
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          activeIssueLine === error.lineNumber
                            ? "border-foreground/30 bg-muted/70"
                            : "border-input bg-background/80 hover:bg-muted/80 hover:border-foreground/20"
                        )}
                      >
                        <p className="text-sm font-medium text-foreground mb-1.5">
                          <span className="mr-2 inline-flex rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                            Issue
                          </span>
                          Line {error.lineNumber}
                          {error.columnNumber
                            ? `, column ${error.columnNumber}`
                            : ""}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {formatLinePreview(error.lineContent)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {error.message}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
                {result.invalidLines > MAX_ISSUES_SHOWN && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing first {MAX_ISSUES_SHOWN} issues.
                  </p>
                )}
              </div>
            )}

            {topKeys.length > 0 && (
              <div className="rounded-lg border border-input bg-muted/50 p-3 mb-6">
                <p className="text-sm font-medium mb-2">Top keys</p>
                <div className="flex flex-wrap gap-2">
                  {topKeys.map(([key, count]) => (
                    <span
                      key={key}
                      className="text-xs rounded-full bg-background border border-input px-2 py-1"
                    >
                      {key}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Divider />

            <Label>Valid JSON Array Output</Label>
            <Textarea
              value={output}
              rows={10}
              readOnly
              className="mb-4 font-mono"
              placeholder="Valid JSONL rows will appear here as a JSON array."
            />

            <Button
              variant="outline"
              onClick={() => handleCopy(output)}
              disabled={!output}
            >
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-4xl">
        <JsonlValidatorSEO />
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-input bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="my-6 border-t border-input"
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

function formatLinePreview(lineContent: string) {
  const value = lineContent.trim();
  if (value === "") {
    return "(empty line)";
  }

  if (value.length <= 88) {
    return value;
  }

  return `${value.slice(0, 85)}...`;
}
