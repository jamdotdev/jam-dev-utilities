import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import XmlToJsonSEO from "@/components/seo/XmlToJsonSEO";
import Meta from "../../components/Meta";
import { xmlToJson } from "@/lib/xmlToJson";

export default function XMLtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      if (!value.trim()) {
        setOutput("");
        return;
      }

      try {
        const jsonObject = xmlToJson(value.trim());
        const output = JSON.stringify(jsonObject, null, 2);
        setOutput(output);
      } catch {
        setOutput("Invalid XML input");
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="XML to JSON Converter | Free, Open Source & Ad-free"
        description="Convert XML to JSON format quickly and easily with Jam's free online XML to JSON converter. Just paste your XML data and get the JSON result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="XML to JSON"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>XML</Label>
            <Textarea
              rows={8}
              placeholder="Paste XML here"
              onChange={handleChange}
              className="mb-6 font-mono text-sm"
              value={input}
            />
            <Label>JSON</Label>
            <Textarea
              value={output}
              rows={8}
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
        <XmlToJsonSEO />
      </section>
    </main>
  );
}
