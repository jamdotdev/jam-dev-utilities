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

      <section className="container max-w-6xl mb-6">
        {/* Main Interactive Area */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Pattern & Configuration */}
          <div className="space-y-4">
            {/* Pattern Input - Primary Action */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <Label className="text-lg font-semibold text-primary">1. Pattern</Label>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Enter your regex pattern (e.g., (\w+)@([\w.-]+))"
                  onChange={(event) => handlePatternChange(event.target.value)}
                  className="font-mono text-base border-primary/30 focus:border-primary focus:ring-primary/20"
                  value={pattern}
                />

                {/* Effective Pattern Display */}
                {pattern && (
                  <div className="bg-white/60 border border-primary/20 rounded-lg p-3">
                    <div className="text-sm font-medium text-primary/80 mb-1">Effective Pattern:</div>
                    <code className="text-primary font-mono font-medium text-base">
                      {displayPattern}
                    </code>
                  </div>
                )}

                {/* Error Display */}
                {!result.isValid && result.error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <div className="text-destructive font-semibold">⚠️ Invalid Pattern</div>
                    <div className="text-sm text-destructive/80 mt-1">{result.error}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Test String Input - Secondary Action */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Label className="text-lg font-semibold text-blue-700">2. Test String</Label>
                </div>
                <Textarea
                  rows={4}
                  placeholder="Enter text to test your pattern against"
                  onChange={(event) => setTestString(event.target.value)}
                  className="font-mono text-base border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                  value={testString}
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Live Results */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6 hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Label className="text-lg font-semibold text-green-700">3. Live Results</Label>
                </div>
                {result.isValid && (
                  <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm font-medium text-green-700">
                    {result.totalMatches} {result.totalMatches === 1 ? "match" : "matches"}
                  </div>
                )}
              </div>

              <div className="min-h-[200px] rounded-lg border-2 border-green-200 bg-white/70 px-4 py-3 font-mono text-sm">
                {!pattern.trim() || !testString.trim() ? (
                  <div className="text-muted-foreground flex items-center justify-center h-full">
                    Enter a pattern and test string to see matches
                  </div>
                ) : !result.isValid ? (
                  <div className="text-destructive flex items-center justify-center h-full">
                    Fix the pattern errors above
                  </div>
                ) : result.totalMatches === 0 ? (
                  <div className="text-orange-600 flex items-center justify-center h-full">
                    No matches found - try adjusting your pattern
                  </div>
                ) : (
                  <RegexHighlightText
                    text={testString}
                    matches={result.matches.map((m) => m.match)}
                  />
                )}
              </div>

              {/* Match Details - Compact */}
              {result.isValid && result.matches.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.matches.map((match, index) => (
                    <div key={index} className="bg-white/60 border border-green-200 rounded-lg p-3 text-xs">
                      <div className="font-semibold text-green-800 mb-1">
                        Match {index + 1}: "{match.match}"
                      </div>
                      <div className="text-green-600">
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

        {/* Configuration Panel - Tertiary Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Flags */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <Label className="text-base font-semibold mb-3 block text-slate-700">⚙️ Flags</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={flags.global ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("global", !flags.global)}
                className={`h-9 transition-all ${flags.global ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">g</code> Global
              </Button>
              <Button
                variant={flags.ignoreCase ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("ignoreCase", !flags.ignoreCase)}
                className={`h-9 transition-all ${flags.ignoreCase ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">i</code> Ignore Case
              </Button>
              <Button
                variant={flags.multiline ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("multiline", !flags.multiline)}
                className={`h-9 transition-all ${flags.multiline ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">m</code> Multiline
              </Button>
              <Button
                variant={flags.dotAll ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("dotAll", !flags.dotAll)}
                className={`h-9 transition-all ${flags.dotAll ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">s</code> Dot All
              </Button>
              <Button
                variant={flags.unicode ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("unicode", !flags.unicode)}
                className={`h-9 transition-all ${flags.unicode ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">u</code> Unicode
              </Button>
              <Button
                variant={flags.sticky ? "default" : "outline"}
                size="sm"
                onClick={() => updateFlag("sticky", !flags.sticky)}
                className={`h-9 transition-all ${flags.sticky ? 'bg-primary shadow-md scale-105' : 'hover:scale-105'}`}
              >
                <code className="mr-1 font-bold">y</code> Sticky
              </Button>
            </div>
          </Card>

          {/* Common Patterns */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <Label className="text-base font-semibold mb-3 block text-amber-700">🎯 Quick Patterns</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(commonPatterns).map(([key, patternInfo]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => insertCommonPattern(patternInfo)}
                  className="text-left justify-start text-xs hover:bg-amber-100 hover:border-amber-300 transition-all hover:scale-105"
                >
                  {patternInfo.description}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Replace Mode - Optional Advanced Feature */}
        <Card className="p-6 bg-purple-50 border-purple-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center gap-4 mb-4">
              <Label className="text-base font-semibold text-purple-700">🔄 Advanced: Replace Mode</Label>
              <TabsList className="grid w-48 grid-cols-2">
                <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
                <TabsTrigger value="replace" className="text-xs">Replace</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="test" className="text-sm text-purple-600">
              Testing mode is active above. Switch to "Replace" to try find-and-replace functionality.
            </TabsContent>

            <TabsContent value="replace" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-purple-700">Replace With</Label>
                  <Textarea
                    rows={2}
                    placeholder="Replacement string (use $1, $2 for groups)"
                    onChange={(event) => setReplaceString(event.target.value)}
                    className="font-mono text-sm border-purple-200 focus:border-purple-400"
                    value={replaceString}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-purple-700">Replace Result</Label>
                  <div className="h-16 rounded-lg border border-purple-200 bg-white/70 px-3 py-2 text-sm font-mono overflow-auto">
                    {!pattern.trim() || !testString.trim() ? (
                      <div className="text-muted-foreground">Enter pattern and test string</div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{performReplace()}</div>
                    )}
                  </div>
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
