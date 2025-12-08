import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import RegexHighlightText from "@/components/RegexHighlightText";
import {
  createRegex,
  parseFlags,
  buildPatternWithFlags,
  getPatternBody,
  RegexFlags,
  PRESET_PATTERNS,
} from "@/components/utils/regex-tester.utils";
import {
  HistoryEntry,
  getHistory,
  addToHistory,
} from "@/components/utils/regex-history.utils";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import RegexFlagToggle from "@/components/regex/RegexFlagToggle";
import RegexPresetPatterns from "@/components/regex/RegexPresetPatterns";
import RegexPatternExplainer from "@/components/regex/RegexPatternExplainer";
import RegexMatchStats from "@/components/regex/RegexMatchStats";
import RegexCheatSheet from "@/components/regex/RegexCheatSheet";
import RegexCaptureGroupVisualizer from "@/components/regex/RegexCaptureGroupVisualizer";
import RegexHistory from "@/components/regex/RegexHistory";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";

interface SessionSource {
  type: "preset" | "manual";
  presetName?: string;
  initialPattern?: string;
  initialTestString?: string;
  modified: boolean;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<string | null>("Please fill out");
  const [matches, setMatches] = useState<string[] | null>(null);
  const [flags, setFlags] = useState<RegexFlags>({
    g: false,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionSource, setSessionSource] = useState<SessionSource | null>(
    null
  );
  const [showCaptureGroups, setShowCaptureGroups] = useState(false);
  const patternInputRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedKeyRef = useRef<string>("");

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleFlagChange = useCallback(
    (flag: keyof RegexFlags) => {
      const newFlags = { ...flags, [flag]: !flags[flag] };
      setFlags(newFlags);

      const patternBody = getPatternBody(pattern) || "";
      if (patternBody) {
        const newPattern = buildPatternWithFlags(patternBody, newFlags);
        setPattern(newPattern);
      }
    },
    [flags, pattern]
  );

  const handlePatternChange = useCallback(
    (newPattern: string) => {
      setPattern(newPattern);
      const parsedFlags = parseFlags(newPattern);
      setFlags(parsedFlags);

      // Mark as modified if we came from a preset
      if (sessionSource?.type === "preset" && !sessionSource.modified) {
        if (newPattern !== sessionSource.initialPattern) {
          setSessionSource({ ...sessionSource, modified: true });
        }
      } else if (!sessionSource) {
        // Manual entry - mark as manual source
        setSessionSource({ type: "manual", modified: true });
      }
    },
    [sessionSource]
  );

  const handlePresetSelect = useCallback(
    (presetPattern: string, presetTestString: string) => {
      setPattern(presetPattern);
      setTestString(presetTestString);
      const parsedFlags = parseFlags(presetPattern);
      setFlags(parsedFlags);

      // Find preset name
      const preset = PRESET_PATTERNS.find((p) => p.pattern === presetPattern);
      setSessionSource({
        type: "preset",
        presetName: preset?.name,
        initialPattern: presetPattern,
        initialTestString: presetTestString,
        modified: false,
      });
    },
    []
  );

  const handleCheatSheetInsert = useCallback(
    (syntax: string) => {
      const patternBody = getPatternBody(pattern) || "";
      const newPatternBody = patternBody + syntax;
      const newPattern = buildPatternWithFlags(newPatternBody, flags);
      setPattern(newPattern);
      patternInputRef.current?.focus();
    },
    [pattern, flags]
  );

  const handleTestStringChange = useCallback(
    (newTestString: string) => {
      setTestString(newTestString);

      // Mark as modified if we came from a preset
      if (sessionSource?.type === "preset" && !sessionSource.modified) {
        if (newTestString !== sessionSource.initialTestString) {
          setSessionSource({ ...sessionSource, modified: true });
        }
      } else if (!sessionSource && newTestString) {
        // Manual entry - mark as manual source
        setSessionSource({ type: "manual", modified: true });
      }
    },
    [sessionSource]
  );

  const handleClear = useCallback(() => {
    setPattern("");
    setTestString("");
    setResult("");
    setMatches(null);
    setFlags({
      g: false,
      i: false,
      m: false,
      s: false,
      u: false,
      y: false,
    });
    setSessionSource(null);
    lastSavedKeyRef.current = "";
  }, []);

  const handleTest = useCallback(() => {
    const startTime = performance.now();
    try {
      const regex = createRegex(pattern);
      let newMatches: string[] = [];

      if (regex.flags.includes("g")) {
        newMatches = Array.from(testString.matchAll(regex)).map((m) => m[0]);
      } else {
        const match = testString.match(regex);
        if (match) {
          newMatches = [match[0]];
        }
      }

      const execTimeMs = performance.now() - startTime;
      const suffix = newMatches.length > 1 ? "matches" : "match";

      if (newMatches.length > 0) {
        setResult(`Match found: ${newMatches.length} ${suffix}`);
        setMatches(newMatches);
      } else {
        setResult("No match found");
        setMatches(null);
      }

      // Save to history if pattern is modified (not just clicking presets)
      const shouldSave =
        sessionSource?.type === "manual" ||
        (sessionSource?.type === "preset" && sessionSource.modified);

      if (shouldSave && pattern && testString) {
        const flagString = Object.entries(flags)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join("");
        const saveKey = `${pattern}\0${testString}\0${flagString}`;

        if (saveKey !== lastSavedKeyRef.current) {
          lastSavedKeyRef.current = saveKey;
          const updated = addToHistory({
            pattern,
            testString,
            flags: flagString,
            favorite: false,
            matchCount: newMatches.length,
            execTimeMs,
          });
          setHistory(updated);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(error.message);
      }
      setMatches(null);
    }
  }, [pattern, testString, sessionSource, flags]);

  const handleHistoryRestore = useCallback((entry: HistoryEntry) => {
    setPattern(entry.pattern);
    setTestString(entry.testString);
    const parsedFlags = parseFlags(entry.pattern);
    setFlags(parsedFlags);
    setSessionSource({ type: "manual", modified: true });
  }, []);

  useEffect(() => {
    if (pattern && testString) {
      handleTest();
    } else {
      setResult("");
      setMatches(null);
    }
  }, [pattern, testString, handleTest]);

  return (
    <main>
      <Meta
        title="Regex Tester & Playground | Free, Open Source & Ad-free"
        description="Interactive regex playground with pattern explanation, capture group visualization, and preset patterns. Test your regular expressions quickly and easily with Jam's free online Regex Tester."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="Regex Playground"
          description="Interactive regex tester with pattern explanation, history, and more."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">
                Quick Start - Preset Patterns
              </Label>
              <RegexPresetPatterns
                onSelect={handlePresetSelect}
                selectedPattern={pattern}
              />
            </div>

            <Divider />

            <div>
              <Label className="mb-2 block">Regex Pattern</Label>
              <Textarea
                ref={patternInputRef}
                rows={1}
                placeholder="Enter regex pattern here (e.g., /pattern/g)"
                onChange={(event) => handlePatternChange(event.target.value)}
                className="mb-3 min-h-0 font-mono"
                value={pattern}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Flags:</span>
                <RegexFlagToggle
                  flags={flags}
                  onFlagChange={handleFlagChange}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Test String</Label>
              <Textarea
                rows={4}
                placeholder="Enter test string here"
                onChange={(event) => handleTestStringChange(event.target.value)}
                value={testString}
              />
            </div>

            <div>
              <Label className="mb-2 block">Result</Label>
              <div className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background">
                <div
                  className={
                    result?.startsWith("Match found")
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : result?.startsWith("No match")
                        ? "text-orange-600 dark:text-orange-400"
                        : result && !result.includes("fill out")
                          ? "text-red-600 dark:text-red-400"
                          : ""
                  }
                >
                  {result === ""
                    ? "Please fill out all required fields"
                    : result}
                </div>
                {matches && (
                  <>
                    <Divider />
                    <RegexHighlightText text={testString} matches={matches} />
                  </>
                )}
              </div>
            </div>

            {/* Collapsible Capture Groups Section */}
            {pattern && (
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setShowCaptureGroups(!showCaptureGroups)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 transition-transform ${showCaptureGroups ? "rotate-90" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Capture Groups
                </button>
                {showCaptureGroups && (
                  <div className="mt-3">
                    <RegexCaptureGroupVisualizer
                      pattern={pattern}
                      testString={testString}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="container max-w-4xl mb-6">
        <Tabs defaultValue="explanation" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="explanation">Pattern Explanation</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="explanation">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexPatternExplainer pattern={pattern} />
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexMatchStats pattern={pattern} testString={testString} />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexHistory
                history={history}
                onHistoryChange={setHistory}
                onRestore={handleHistoryRestore}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="container max-w-4xl mb-6">
        <RegexCheatSheet onInsert={handleCheatSheetInsert} />
      </section>

      <GitHubContribution username="shashankshet" />
      <CallToActionGrid />
    </main>
  );
}

const Divider = () => {
  return <div className="bg-border h-[1px] my-2"></div>;
};
