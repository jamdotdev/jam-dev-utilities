import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Button } from "@/components/ds/ButtonComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import RegexHighlightText from "@/components/RegexHighlightText";
import {
  parseRegexPattern,
  formatRegexWithFlags,
  testRegexPattern,
  commonPatterns,
  type RegexFlags,
  type RegexTestResult,
} from "@/components/utils/regex-tester.utils";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [replaceString, setReplaceString] = useState("");
  const [flags, setFlags] = useState<RegexFlags>({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [result, setResult] = useState<RegexTestResult>({
    isValid: true,
    matches: [],
    totalMatches: 0,
  });
  const [activeTab, setActiveTab] = useState("test");

  const updateFlag = (flagName: keyof RegexFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [flagName]: value }));
  };

  const insertCommonPattern = (
    patternInfo: (typeof commonPatterns)[keyof typeof commonPatterns]
  ) => {
    setPattern(patternInfo.pattern);
    if (!testString) {
      setTestString(patternInfo.example);
    }
  };

  const handlePatternChange = (newPattern: string) => {
    setPattern(newPattern);

    // Try to parse flags from the pattern if it uses /pattern/flags format
    if (newPattern.startsWith("/")) {
      try {
        const parsed = parseRegexPattern(newPattern);
        setFlags(parsed.flags);
      } catch {
        // If parsing fails, keep current flags
      }
    }
  };

  const testRegex = useCallback(() => {
    if (!pattern.trim()) {
      setResult({
        isValid: true,
        matches: [],
        totalMatches: 0,
      });
      return;
    }

    const cleanPattern = pattern.startsWith("/")
      ? parseRegexPattern(pattern).pattern
      : pattern;
    const testResult = testRegexPattern(cleanPattern, testString, flags);
    setResult(testResult);
  }, [pattern, testString, flags]);

  const performReplace = useCallback(() => {
    if (!pattern.trim() || !replaceString) return "";

    try {
      const cleanPattern = pattern.startsWith("/")
        ? parseRegexPattern(pattern).pattern
        : pattern;
      const flagsString = Object.entries(flags)
        .filter(([, value]) => value)
        .map(([key]) => {
          switch (key) {
            case "global":
              return "g";
            case "ignoreCase":
              return "i";
            case "multiline":
              return "m";
            case "dotAll":
              return "s";
            case "unicode":
              return "u";
            case "sticky":
              return "y";
            default:
              return "";
          }
        })
        .join("");

      const regex = new RegExp(cleanPattern, flagsString);
      return testString.replace(regex, replaceString);
    } catch {
      return "Invalid regex pattern";
    }
  }, [pattern, testString, replaceString, flags]);

  useEffect(() => {
    testRegex();
  }, [testRegex]);

  const displayPattern = formatRegexWithFlags(
    pattern.startsWith("/") ? parseRegexPattern(pattern).pattern : pattern,
    flags
  );

  return (
    <main>
      <Meta
        title="Free Online Regex Tester Tool | Test Regular Expressions Live | Jam.dev"
        description="Free interactive regex tester with real-time validation, capture groups, flags selector, and common patterns. Test JavaScript regular expressions instantly with live match highlighting and detailed results."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="Regex Tester"
          description="Test regular expressions with real-time validation, interactive flags, match highlighting, capture groups, and common patterns. Perfect for developers, system administrators, and data analysts."
        />
      </section>

      <section className="container max-w-4xl mb-6 space-y-6">
        {/* Pattern Input Section */}
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Regex Pattern</Label>
              <Textarea
                rows={2}
                placeholder="Enter regex pattern here (e.g., /pattern/g or just pattern)"
                onChange={(event) => handlePatternChange(event.target.value)}
                className="mb-4 min-h-0 font-mono"
                value={pattern}
              />

              {/* Pattern Display */}
              {pattern && (
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">Effective pattern:</span>{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    {displayPattern}
                  </code>
                </div>
              )}

              {/* Error Display */}
              {!result.isValid && result.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                  <div className="text-destructive font-medium">
                    Invalid Pattern
                  </div>
                  <div className="text-sm text-destructive/80">
                    {result.error}
                  </div>
                </div>
              )}
            </div>

            {/* Flags Section */}
            <div>
              <Label className="text-base font-medium mb-3 block">Flags</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={flags.global ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("global", !flags.global)}
                  className="h-8"
                >
                  <code className="mr-1">g</code> Global
                </Button>
                <Button
                  variant={flags.ignoreCase ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("ignoreCase", !flags.ignoreCase)}
                  className="h-8"
                >
                  <code className="mr-1">i</code> Ignore Case
                </Button>
                <Button
                  variant={flags.multiline ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("multiline", !flags.multiline)}
                  className="h-8"
                >
                  <code className="mr-1">m</code> Multiline
                </Button>
                <Button
                  variant={flags.dotAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("dotAll", !flags.dotAll)}
                  className="h-8"
                >
                  <code className="mr-1">s</code> Dot All
                </Button>
                <Button
                  variant={flags.unicode ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("unicode", !flags.unicode)}
                  className="h-8"
                >
                  <code className="mr-1">u</code> Unicode
                </Button>
                <Button
                  variant={flags.sticky ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFlag("sticky", !flags.sticky)}
                  className="h-8"
                >
                  <code className="mr-1">y</code> Sticky
                </Button>
              </div>
            </div>

            {/* Common Patterns */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Common Patterns
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.entries(commonPatterns).map(([key, patternInfo]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertCommonPattern(patternInfo)}
                    className="text-left justify-start"
                  >
                    {patternInfo.description}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Test/Replace Tabs */}
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="replace">Replace</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Test String</Label>
                <Textarea
                  rows={4}
                  placeholder="Enter test string here"
                  onChange={(event) => setTestString(event.target.value)}
                  className="mb-4 font-mono"
                  value={testString}
                />
              </div>

              {/* Results Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Results</Label>
                  {result.isValid && (
                    <div className="text-sm text-muted-foreground">
                      {result.totalMatches}{" "}
                      {result.totalMatches === 1 ? "match" : "matches"} found
                    </div>
                  )}
                </div>

                <div className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background min-h-[100px]">
                  {!pattern.trim() || !testString.trim() ? (
                    <div className="text-muted-foreground">
                      Please enter both a pattern and test string
                    </div>
                  ) : !result.isValid ? (
                    <div className="text-destructive">
                      Pattern contains errors
                    </div>
                  ) : result.totalMatches === 0 ? (
                    <div className="text-muted-foreground">
                      No matches found
                    </div>
                  ) : (
                    <RegexHighlightText
                      text={testString}
                      matches={result.matches.map((m) => m.match)}
                    />
                  )}
                </div>
              </div>

              {/* Match Details */}
              {result.isValid && result.matches.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Match Details
                  </Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.matches.map((match, index) => (
                      <div
                        key={index}
                        className="bg-muted/50 rounded-lg p-3 border"
                      >
                        <div className="font-mono text-sm">
                          <div>
                            <span className="font-medium">
                              Match {index + 1}:
                            </span>{" "}
                            "{match.match}"
                          </div>
                          <div className="text-muted-foreground">
                            Position: {match.index} -{" "}
                            {match.index + match.length - 1} (Length:{" "}
                            {match.length})
                          </div>
                          {match.groups.length > 0 && (
                            <div className="text-muted-foreground">
                              Groups:{" "}
                              {match.groups
                                .map((group, i) => `$${i + 1}: "${group}"`)
                                .join(", ")}
                            </div>
                          )}
                          {Object.keys(match.namedGroups).length > 0 && (
                            <div className="text-muted-foreground">
                              Named Groups:{" "}
                              {Object.entries(match.namedGroups)
                                .map(([name, value]) => `${name}: "${value}"`)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="replace" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Test String</Label>
                <Textarea
                  rows={4}
                  placeholder="Enter test string here"
                  onChange={(event) => setTestString(event.target.value)}
                  className="mb-4 font-mono"
                  value={testString}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Replace With</Label>
                <Textarea
                  rows={2}
                  placeholder="Enter replacement string (use $1, $2 for groups)"
                  onChange={(event) => setReplaceString(event.target.value)}
                  className="mb-4 font-mono"
                  value={replaceString}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Replace Result</Label>
                <div className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background min-h-[100px]">
                  {!pattern.trim() || !testString.trim() ? (
                    <div className="text-muted-foreground">
                      Please enter pattern and test string
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono">
                      {performReplace()}
                    </pre>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </section>

      <GitHubContribution username="shashankshet" />
      <CallToActionGrid />
    </main>
  );
}
