import { useEffect, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import GitHubContribution from "@/components/GitHubContribution";
import { calculateDiff } from "@/components/utils/text-difference.utils";

type DiffResult = {
  text: string;
  type: string;
};

export default function TextDifference() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [diffResults, setDiffResults] = useState<DiffResult[]>([]);

  useEffect(() => {
    if (input1.trim() === "" && input2.trim() === "") {
      setDiffResults([]);
      return;
    }
    try {
      const results = calculateDiff(input1, input2);
      setDiffResults(results);
    } catch (errorMessage: unknown) {
      setDiffResults([]);
    }
  }, [input1, input2]);

  return (
    <main>
      <Meta
        title="Text Difference Checker | Free, Open Source & Ad-free"
        description="Compare two pieces of text and see the differences."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Text Difference Checker"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Text 1</Label>
            <Textarea
              rows={6}
              placeholder="Paste first text here"
              onChange={(e) => setInput1(e.currentTarget.value)}
              className="mb-6"
              value={input1}
            />

            <Label>Text 2</Label>
            <Textarea
              rows={6}
              placeholder="Paste second text here"
              onChange={(e) => setInput2(e.currentTarget.value)}
              className="mb-6"
              value={input2}
            />

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">Differences</Label>
            </div>

            <div className="output-diff mb-4">
              <pre className="p-4 overflow-auto font-mono text-sm">
                {diffResults.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start ${
                      line.type === "added"
                        ? "bg-primary text-primary-foreground"
                        : line.type === "removed"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-accent text-accent-foreground"
                    }`}
                  >
                    <span className="w-8 text-muted-foreground select-none text-right pr-2">
                      {index + 1}
                    </span>
                    <span className="whitespace-pre-wrap flex-1">
                      {line.text}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="ayshrj" />
      <CallToActionGrid />
    </main>
  );
}
