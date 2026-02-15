import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import JsonToTypescriptSEO from "@/components/seo/JsonToTypescriptSEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { jsonToTypeScript } from "@/components/utils/json-to-typescript.utils";

export default function JsonToTypescript() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const convert = useCallback(
    (json: string, name: string) => {
      if (!json.trim()) {
        setOutput("");
        return;
      }

      try {
        setOutput(jsonToTypeScript(json, name || "Root"));
      } catch {
        setOutput("Invalid JSON — check your input and try again.");
      }
    },
    []
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);
      convert(value, rootName);
    },
    [convert, rootName]
  );

  const handleRootNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget;
      setRootName(value);
      convert(input, value);
    },
    [convert, input]
  );

  return (
    <main>
      <Meta
        title="JSON to TypeScript Types | Free, Open Source & Ad-free"
        description="Instantly generate TypeScript interfaces and types from JSON. Paste any API response or JSON structure and get clean, ready-to-use TypeScript types. Free, open source, and ad-free."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JSON to TypeScript"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>JSON</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  Root name
                </Label>
                <Input
                  value={rootName}
                  onChange={handleRootNameChange}
                  className="h-7 w-32 text-xs"
                  placeholder="Root"
                />
              </div>
            </div>
            <Textarea
              rows={8}
              placeholder="Paste JSON here"
              onChange={handleChange}
              className="mb-6 font-mono text-sm"
              value={input}
            />
            <Label>TypeScript</Label>
            <Textarea
              value={output}
              rows={10}
              readOnly
              className="mb-4 font-mono text-sm"
            />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <JsonToTypescriptSEO />
      </section>
    </main>
  );
}
