import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import TimestampSEO from "@/components/seo/TimestampSEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { formatOutput } from "../../components/utils/timestamp-to-date.utils";

export default function TimestampToDate() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const output = formatOutput(value.trim());
        setOutput(output);
      } catch {
        setOutput(
          "Invalid input format.\nPlease enter a Unix timestamp (seconds/milliseconds) or ISO date string.\n\nExamples:\n• Unix timestamp: 1234567890\n• Unix timestamp (ms): 1234567890123\n• ISO date: 2009-02-13T23:31:30.123Z\n• Human readable: February 13, 2009 23:31:30 GMT"
        );
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="Epoch Converter | Unix Timestamp & Date Converter | Free, Open Source & Ad-free"
        description="Convert between Unix timestamps and human-readable dates bidirectionally. Supports seconds, milliseconds, and ISO date strings. Perfect for developers and data analysts."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Epoch Converter"
          description="Convert between Unix timestamps and dates"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Input (Unix timestamp or date string)</Label>
            <Textarea
              rows={6}
              placeholder="Examples:&#10;• Unix timestamp (seconds): 1234567890&#10;• Unix timestamp (ms): 1234567890123&#10;• ISO date: 2009-02-13T23:31:30.123Z&#10;• Human readable: February 13, 2009 23:31:30 GMT"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>Output</Label>
            <Textarea
              value={output}
              rows={6}
              readOnly
              className="mb-4 font-mono"
            />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <TimestampSEO />
      </section>
    </main>
  );
}
