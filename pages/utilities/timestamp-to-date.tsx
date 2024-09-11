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
          "Invalid timestamp format.\nPlease use milliseconds (11-13 digits) or seconds (1-10 digits)."
        );
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="Timestamp to Date Converter | Free, Open Source & Ad-free"
        description="Convert Unix timestamps to human-readable dates quickly and easily with Jam's free online Timestamp to Date converter. Perfect for developers, data analysts, and anyone working with time data."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Timestamp to Date Converter"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Timestamp (milliseconds or seconds)</Label>
            <Textarea
              rows={6}
              placeholder="Paste here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>Date</Label>
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
