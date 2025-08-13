import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Label } from "@/components/ds/LabelComponent";
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

      {/* Modern SaaS-style toolbar */}
      <section className="container max-w-6xl mb-8">
        <div className="bg-white border-b border-gray-100 -mx-4 px-4 py-6">
          <div className="flex flex-col space-y-6">
            {/* Flags Section */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Regex Flags
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => updateFlag("global", !flags.global)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.global
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.global ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    g
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Global</span>
                    <span className="text-xs text-gray-500">Find all matches</span>
                  </div>
                </button>
                
                <button
                  onClick={() => updateFlag("ignoreCase", !flags.ignoreCase)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.ignoreCase
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.ignoreCase ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    i
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Ignore Case</span>
                    <span className="text-xs text-gray-500">Case insensitive</span>
                  </div>
                </button>
                
                <button
                  onClick={() => updateFlag("multiline", !flags.multiline)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.multiline
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.multiline ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    m
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Multiline</span>
                    <span className="text-xs text-gray-500">^ and $ match line breaks</span>
                  </div>
                </button>
                
                <button
                  onClick={() => updateFlag("dotAll", !flags.dotAll)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.dotAll
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.dotAll ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    s
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Dot All</span>
                    <span className="text-xs text-gray-500">. matches newlines</span>
                  </div>
                </button>
                
                <button
                  onClick={() => updateFlag("unicode", !flags.unicode)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.unicode
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.unicode ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    u
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Unicode</span>
                    <span className="text-xs text-gray-500">Full Unicode matching</span>
                  </div>
                </button>
                
                <button
                  onClick={() => updateFlag("sticky", !flags.sticky)}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    flags.sticky
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold ${
                    flags.sticky ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    y
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Sticky</span>
                    <span className="text-xs text-gray-500">Match at lastIndex</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Quick Patterns Section */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Quick Patterns
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(commonPatterns).map(([key, patternInfo]) => (
                  <button
                    key={key}
                    onClick={() => insertCommonPattern(patternInfo)}
                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200"
                  >
                    {patternInfo.description}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-6xl mb-8">
        {/* Modern SaaS-style content layout */}
        <div className="space-y-8">
          {/* Pattern Input - Enhanced Modern Design */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Regular Expression Pattern</h2>
              </div>
              
              <Textarea
                rows={4}
                placeholder="Enter your regex pattern (e.g., (\w+)@([\w.-]+))"
                onChange={(event) => handlePatternChange(event.target.value)}
                className="font-mono text-base resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                value={pattern}
              />

              {/* Effective Pattern Display */}
              {pattern && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Compiled Pattern</span>
                  </div>
                  <code className="text-gray-900 font-mono text-base block">
                    {displayPattern}
                  </code>
                </div>
              )}

              {/* Error Display */}
              {!result.isValid && result.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-red-800">Invalid Pattern</span>
                  </div>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test String & Results - Enhanced Modern Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Test String Input */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Test String</h2>
                </div>
                
                <Textarea
                  rows={10}
                  placeholder="Enter text to test your pattern against"
                  onChange={(event) => setTestString(event.target.value)}
                  className="font-mono text-base resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                  value={testString}
                />
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Results</h2>
                  </div>
                  {result.isValid && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {result.totalMatches} {result.totalMatches === 1 ? "match" : "matches"}
                    </div>
                  )}
                </div>

                <div className="min-h-[280px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 font-mono text-sm overflow-auto">
                  {!pattern.trim() || !testString.trim() ? (
                    <div className="text-gray-500 flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <p>Enter a pattern and test string to see matches</p>
                      </div>
                    </div>
                  ) : !result.isValid ? (
                    <div className="text-red-600 flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-red-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p>Fix the pattern errors above</p>
                      </div>
                    </div>
                  ) : result.totalMatches === 0 ? (
                    <div className="text-orange-600 flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-orange-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p>No matches found</p>
                      </div>
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
                  <div className="space-y-3 mt-6 max-h-40 overflow-y-auto">
                    {result.matches.map((match, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                            {index + 1}
                          </div>
                          <span className="font-mono font-medium text-gray-900">"{match.match}"</span>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          Position {match.index}-{match.index + match.length - 1}
                          {match.groups.length > 0 && (
                            <div className="mt-1">
                              <span className="font-medium">Groups: </span>
                              {match.groups.map((group, i) => (
                                <span key={i} className="inline-block bg-white border border-gray-200 rounded px-2 py-1 mr-2 text-xs font-mono">
                                  ${i + 1}: "{group}"
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Replace Mode - Enhanced Modern Design */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Replace Mode</h2>
                  </div>
                  <TabsList className="grid w-48 grid-cols-2">
                    <TabsTrigger value="test" className="text-sm">Test Only</TabsTrigger>
                    <TabsTrigger value="replace" className="text-sm">Find & Replace</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="test" className="text-gray-600">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Testing mode is active above. Switch to "Find & Replace" to try replacement functionality.</span>
                  </div>
                </TabsContent>

                <TabsContent value="replace" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-900 mb-3 block">Replace With</Label>
                      <Textarea
                        rows={4}
                        placeholder="Replacement string (use $1, $2 for groups)"
                        onChange={(event) => setReplaceString(event.target.value)}
                        className="font-mono text-sm resize-none border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                        value={replaceString}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-900 mb-3 block">Replace Result</Label>
                      <div className="h-24 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono overflow-auto">
                        {!pattern.trim() || !testString.trim() ? (
                          <div className="text-gray-500 flex items-center justify-center h-full">
                            Enter pattern and test string
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">{performReplace()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <GitHubContribution username="shashankshet" />
      <CallToActionGrid />
    </main>
  );
}
