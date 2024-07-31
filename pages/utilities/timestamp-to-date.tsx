import { useCallback, useState } from "react";
import { Textarea } from "../../components/ds/TextareaComponent";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ds/CardComponent";
import { Button } from "../../components/ds/ButtonComponent";
import { Label } from "../../components/ds/LabelComponent";
import Header from "../../components/Header";
import { CMDK } from "../../components/CDMK";
import { useCopyToClipboard } from "../../components/hooks/useCopyToClipboard";

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
      } catch (error) {
        setOutput("Invalid input, please provide a valid timestamp");
      }
    },
    []
  );

  return (
    <main>
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Timestamp to Date Converter"
          description="Fast, free, open source, ad-free tools."
          logoSrc="/logo.png"
        />
      </section>

      <section className="container max-w-2xl">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Timestamp</Label>
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
    </main>
  );
}

function formatOutput(timestamp: string) {
  const date = new Date(parseInt(timestamp, 10));
  const gmtDate = formatDate(date, "UTC");
  const localDate = formatDate(date);
  const labelWidth = 22;

  return (
    "Greenwich Mean Time:".padEnd(labelWidth) +
    `${gmtDate}\n` +
    "Your time zone:".padEnd(labelWidth) +
    `${localDate}`
  );
}

function formatDate(date: Date, timeZone: string = "local") {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timeZone === "local" ? undefined : timeZone,
    timeZoneName: "short",
  };

  return date.toLocaleString("en-US", options);
}
