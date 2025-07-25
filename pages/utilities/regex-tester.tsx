import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import RegexHighlightText from "@/components/RegexHighlightText";
import { createRegex } from "@/components/utils/regex-tester.utils";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import { DividerComponent } from "../../components/ds/DividerComponent";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<string | null>("Please fill out");
  const [matches, setMatches] = useState<string[] | null>(null);

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
        title="Regex Tester | Free, Open Source & Ad-free"
        description="Test your regular expressions quickly and easily with Jam's free online Regex Tester. Paste your regex and test string to see if they match."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Regex Tester"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Regex Pattern</Label>
            <Textarea
              rows={1}
              placeholder="Enter regex pattern here (e.g., /pattern/g)"
              onChange={(event) => setPattern(event.target.value)}
              className="mb-6 min-h-0"
              value={pattern}
            />

            <Label>Test String</Label>
            <div>
              <Textarea
                rows={4}
                placeholder="Enter test string here"
                onChange={(event) => setTestString(event.target.value)}
                className="mb-6"
                value={testString}
              />
            </div>

            <div>
              <Label>Result</Label>
              <div className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm ring-offset-background">
                <div>
                  {result === ""
                    ? "Please fill out all required fields"
                    : result}
                </div>
                {matches && (
                  <>
                    <DividerComponent margin="small" />
                    <RegexHighlightText text={testString} matches={matches} />
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="shashankshet" />
      <CallToActionGrid />
    </main>
  );
}
