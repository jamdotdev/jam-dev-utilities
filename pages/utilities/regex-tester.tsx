import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";

const createRegex = (pattern: string): RegExp => {
  if (!pattern) {
    throw new Error("Pattern cannot be empty");
  }

  if (pattern.startsWith("/") && pattern.lastIndexOf("/") !== 0) {
    const lastSlashIndex = pattern.lastIndexOf("/");
    const patternBody = pattern.slice(1, lastSlashIndex);
    const flags = pattern.slice(lastSlashIndex + 1);

    if (!/^[gimsuy]*$/.test(flags)) {
      throw new Error("Invalid regex flags");
    }

    return new RegExp(patternBody, flags);
  } else {
    return new RegExp(pattern);
  }
};

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

  const handlePatternChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPattern(event.currentTarget.value);
    },
    []
  );

  const handleTestStringChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTestString(event.currentTarget.value);
    },
    []
  );

  const handleTest = useCallback(() => {
    try {
      const regex = createRegex(pattern);
      const matches = testString.match(regex);

      if (matches) {
        setResult(matches.join("\n"));
        setMatchStatus("Match found");
      } else {
        setResult("");
        setMatchStatus("No match found");
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(error.message);
        setMatchStatus(null);
      }
    }
  }, [pattern, testString]);

  const handleClear = () => {
    setPattern("");
    setTestString("");
    setResult(null);
    setMatchStatus(null);
  };

  return (
    <main>
      <Meta
        title="Regex Tester by Jam.dev | Free, Open Source & Ad-free"
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
              rows={4}
              placeholder="Enter regex pattern here (e.g., /pattern/g)"
              onChange={handlePatternChange}
              className="mb-6"
              value={pattern}
            />

            <Label>Test String</Label>
            <Textarea
              rows={4}
              placeholder="Enter test string here"
              onChange={handleTestStringChange}
              className="mb-6"
              value={testString}
            />

            <Button onClick={handleTest} className="mb-4">
              Test Regex
            </Button>

            <Label>
              Result
              {matchStatus && (
                <span
                  style={{
                    color: matchStatus === "Match found" ? "green" : "red",
                    marginLeft: "10px",
                  }}
                >
                  {matchStatus}
                </span>
              )}
            </Label>
            <Textarea value={result ?? ""} rows={2} readOnly className="mb-4" />

            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
