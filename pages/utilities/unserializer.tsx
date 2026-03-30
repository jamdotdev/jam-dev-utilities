import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "../../components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import UnserializerSEO from "@/components/seo/UnserializerSEO";
import Meta from "@/components/Meta";
import {
  formatPrintR,
  formatVarDump,
  unserialize,
} from "@/components/utils/unserializer.utils";

type OutputMode = "print_r" | "var_dump";

const SAMPLE_INPUT =
  'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';

export default function Unserializer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<OutputMode>("print_r");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const runUnserialize = useCallback(
    (nextInput: string, nextMode: OutputMode) => {
      if (nextInput.trim() === "") {
        setOutput("");
        setError("");
        return;
      }

      try {
        const parsed = unserialize(nextInput);
        const formatted =
          nextMode === "print_r" ? formatPrintR(parsed) : formatVarDump(parsed);
        setOutput(formatted);
        setError("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid input";
        setOutput("");
        setError(message);
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);
      runUnserialize(value, mode);
    },
    [mode, runUnserialize]
  );

  const handleModeChange = useCallback(
    (nextMode: OutputMode) => {
      setMode(nextMode);
      runUnserialize(input, nextMode);
    },
    [input, runUnserialize]
  );

  const loadExample = useCallback(() => {
    setInput(SAMPLE_INPUT);
    runUnserialize(SAMPLE_INPUT, mode);
  }, [mode, runUnserialize]);

  const clearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  return (
    <main>
      <Meta
        title="Unserializer | Free, Open Source & Ad-free"
        description="Parse serialized strings and format them as print_r() or var_dump() output. Great for inspecting WordPress options, metadata, and transient values."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Unserializer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">Serialized Input</Label>
              <Button size="sm" variant="outline" onClick={loadExample}>
                Load Example
              </Button>
            </div>

            <Textarea
              rows={6}
              placeholder='Paste serialized string (e.g. a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";})'
              onChange={handleInputChange}
              className="mb-4"
              value={input}
            />

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                variant={mode === "print_r" ? "default" : "outline"}
                onClick={() => handleModeChange("print_r")}
              >
                print_r()
              </Button>
              <Button
                variant={mode === "var_dump" ? "default" : "outline"}
                onClick={() => handleModeChange("var_dump")}
              >
                var_dump()
              </Button>
              <Button variant="ghost" onClick={clearAll}>
                Clear
              </Button>
            </div>

            <Label>
              Output ({mode === "print_r" ? "print_r()" : "var_dump()"})
            </Label>
            <Textarea
              value={error ? `Error: ${error}` : output}
              rows={8}
              readOnly
              className={`mb-4 font-mono ${error ? "text-red-500" : ""}`}
            />

            <Button
              variant="outline"
              onClick={() => handleCopy(output)}
              disabled={!output || !!error}
            >
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="aminurislamarnob" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <UnserializerSEO />
      </section>
    </main>
  );
}
