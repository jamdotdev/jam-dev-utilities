import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { convertJSONtoTSV } from "@/components/utils/json-to-tsv.utils";
import JsonToTsvSEO from "@/components/seo/JsonToTsvSEO";

export default function JSONtoTSV() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const tsv = convertJSONtoTSV(value.trim());
        setOutput(tsv);
      } catch (errorMessage: unknown) {
        setOutput(errorMessage as string);
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="JSON to TSV Converter | Free, Open Source & Ad-free"
        description="Convert JSON files to TSV format quickly and easily with Jam's free online JSON to TSV converter. Just paste your JSON file and get the TSV result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JSON to TSV Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>JSON</Label>
            <Textarea
              rows={6}
              placeholder="Paste JSON here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">TSV</Label>
            </div>

            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <JsonToTsvSEO />
      </section>
    </main>
  );
}
