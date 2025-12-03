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
} from "@/components/utils/regex-tester.utils";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import RegexFlagToggle from "@/components/regex/RegexFlagToggle";
import RegexPresetPatterns from "@/components/regex/RegexPresetPatterns";
import RegexPatternExplainer from "@/components/regex/RegexPatternExplainer";
import RegexMatchStats from "@/components/regex/RegexMatchStats";
import RegexCheatSheet from "@/components/regex/RegexCheatSheet";
import RegexCaptureGroupVisualizer from "@/components/regex/RegexCaptureGroupVisualizer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";

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
  const patternInputRef = useRef<HTMLTextAreaElement>(null);

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

  const handlePatternChange = useCallback((newPattern: string) => {
    setPattern(newPattern);
    const parsedFlags = parseFlags(newPattern);
    setFlags(parsedFlags);
  }, []);

  const handlePresetSelect = useCallback(
    (presetPattern: string, presetTestString: string) => {
      setPattern(presetPattern);
      setTestString(presetTestString);
      const parsedFlags = parseFlags(presetPattern);
      setFlags(parsedFlags);
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
  }, []);

  const handleTest = useCallback(() => {
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

      const suffix = newMatches.length > 1 ? "matches" : "match";

      if (newMatches.length > 0) {
        setResult(`Match found: ${newMatches.length} ${suffix}`);
        setMatches(newMatches);
      } else {
        setResult("No match found");
        setMatches(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(error.message);
      }
      setMatches(null);
    }
  }, [pattern, testString]);

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

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Regex Playground"
          description="Interactive regex tester with pattern explanation, capture groups, and more."
        />
      </section>

      <section className="container max-w-2xl mb-6">
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
                onChange={(event) => setTestString(event.target.value)}
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

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="container max-w-2xl mb-6">
        <Tabs defaultValue="explanation" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="explanation">Pattern Explanation</TabsTrigger>
            <TabsTrigger value="groups">Capture Groups</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="explanation">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexPatternExplainer pattern={pattern} />
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexCaptureGroupVisualizer
                pattern={pattern}
                testString={testString}
              />
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
              <RegexMatchStats pattern={pattern} testString={testString} />
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section className="container max-w-2xl mb-6">
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
