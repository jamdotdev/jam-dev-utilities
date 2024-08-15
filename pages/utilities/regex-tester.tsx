import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const { buttonText, handleCopy } = useCopyToClipboard();

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
      const regex = new RegExp(pattern);
      const match = regex.test(testString);
      setResult(match ? "Match found" : "No match found");
    } catch (error) {
      setResult("Invalid regex pattern");
    }
  }, [pattern, testString]);

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
              placeholder="Enter regex pattern here"
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

            <Label>Result</Label>
            <Textarea value={result ?? ""} rows={2} readOnly className="mb-4" />

            {result && (
              <Button variant="outline" onClick={() => handleCopy(result)}>
                {buttonText}
              </Button>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
