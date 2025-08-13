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
  // Set up a default working example to demonstrate functionality
  const [pattern, setPattern] = useState("(\\w+)@([\\w.-]+)");
  const [testString, setTestString] = useState("Contact me at john@example.com or admin@test.org for support");
  const [replaceString, setReplaceString] = useState("$1 [at] $2");
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
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

      {/* Clean toolbar for flags */}
      <section className="container max-w-6xl mb-6">
        <Card className="p-4 border border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">Regex Flags</Label>
              <div className="flex gap-2">
                <Button
                  variant={flags.global ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("global", !flags.global)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  g
                </Button>
                <Button
                  variant={flags.ignoreCase ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("ignoreCase", !flags.ignoreCase)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  i
                </Button>
                <Button
                  variant={flags.multiline ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("multiline", !flags.multiline)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  m
                </Button>
                <Button
                  variant={flags.dotAll ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("dotAll", !flags.dotAll)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  s
                </Button>
                <Button
                  variant={flags.unicode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("unicode", !flags.unicode)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  u
                </Button>
                <Button
                  variant={flags.sticky ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFlag("sticky", !flags.sticky)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  y
                </Button>
              </div>
            </div>
            
            {/* Common Patterns moved to toolbar */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Quick patterns:</Label>
              <div className="flex gap-1">
                {Object.entries(commonPatterns).slice(0, 4).map(([key, patternInfo]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertCommonPattern(patternInfo)}
                    className="h-8 px-2 text-xs hover:bg-gray-100"
                  >
                    {patternInfo.description}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="container max-w-6xl mb-6">
        {/* Clean main layout */}
        <div className="space-y-6">
          {/* Pattern Input */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-6">
              <Label className="text-base font-medium text-gray-900 mb-3 block">Regular Expression Pattern</Label>
              <Textarea
                rows={3}
                placeholder="Enter your regex pattern (e.g., (\w+)@([\w.-]+))"
                onChange={(event) => handlePatternChange(event.target.value)}
                className="font-mono text-base resize-none"
                value={pattern}
              />

              {/* Effective Pattern Display */}
              {pattern && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Effective Pattern:</div>
                  <code className="text-gray-900 font-mono text-base">
                    {displayPattern}
                  </code>
                </div>
              )}

              {/* Error Display */}
              {!result.isValid && result.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-900 font-medium">Invalid Pattern</div>
                  <div className="text-sm text-red-700 mt-1">{result.error}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Test String & Results in a clean grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Test String Input */}
            <Card className="border border-gray-200 bg-white">
              <div className="p-6">
                <Label className="text-base font-medium text-gray-900 mb-3 block">Test String</Label>
                <Textarea
                  rows={8}
                  placeholder="Enter text to test your pattern against"
                  onChange={(event) => setTestString(event.target.value)}
                  className="font-mono text-base resize-none"
                  value={testString}
                />
              </div>
            </Card>

            {/* Results */}
            <Card className="border border-gray-200 bg-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium text-gray-900">Results</Label>
                  {result.isValid && (
                    <div className="px-2 py-1 bg-gray-100 rounded text-sm font-medium text-gray-700">
                      {result.totalMatches} {result.totalMatches === 1 ? "match" : "matches"}
                    </div>
                  )}
                </div>

                <div className="min-h-[200px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm">
                  {!pattern.trim() || !testString.trim() ? (
                    <div className="text-gray-500 flex items-center justify-center h-full">
                      Enter a pattern and test string to see matches
                    </div>
                  ) : !result.isValid ? (
                    <div className="text-red-600 flex items-center justify-center h-full">
                      Fix the pattern errors above
                    </div>
                  ) : result.totalMatches === 0 ? (
                    <div className="text-orange-600 flex items-center justify-center h-full">
                      No matches found
                    </div>
                  ) : (
                    <RegexHighlightText
                      text={testString}
                      matches={result.matches.map((m) => m.match)}
                    />
                  )}
                </div>

                {/* Match Details */}
                {result.isValid && result.matches.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-32 overflow-y-auto">
                    {result.matches.map((match, index) => (
                      <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                        <div className="font-medium text-gray-900 mb-1">
                          Match {index + 1}: "{match.match}"
                        </div>
                        <div className="text-gray-600">
                          Position {match.index}-{match.index + match.length - 1}
                          {match.groups.length > 0 && (
                            <span className="ml-2">
                              Groups: {match.groups.map((group, i) => `$${i + 1}="${group}"`).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Replace Mode - Clean and minimal */}
          <Card className="border border-gray-200 bg-white">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center gap-4 mb-4">
                  <Label className="text-base font-medium text-gray-900">Replace Mode</Label>
                  <TabsList className="grid w-40 grid-cols-2">
                    <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
                    <TabsTrigger value="replace" className="text-xs">Replace</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="test" className="text-sm text-gray-600">
                  Testing mode is active above. Switch to "Replace" to try find-and-replace functionality.
                </TabsContent>

                <TabsContent value="replace" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Replace With</Label>
                      <Textarea
                        rows={3}
                        placeholder="Replacement string (use $1, $2 for groups)"
                        onChange={(event) => setReplaceString(event.target.value)}
                        className="font-mono text-sm resize-none"
                        value={replaceString}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Replace Result</Label>
                      <div className="h-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono overflow-auto">
                        {!pattern.trim() || !testString.trim() ? (
                          <div className="text-gray-500">Enter pattern and test string</div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">{performReplace()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </section>

      <GitHubContribution username="shashankshet" />
      <CallToActionGrid />
    </main>
  );
}
