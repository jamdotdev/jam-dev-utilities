import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import yaml from "js-yaml";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import YamlToJsonSEO from "@/components/seo/YamlToJsonSEO";
import Meta from "../../components/Meta";

export default function YAMLtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const jsonObject = yaml.loadAll(value.trim());
        const output = JSON.stringify(jsonObject, null, 2);
        setOutput(output);
      } catch {
        setOutput("Invalid input");
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="YAML to JSON by Jam.dev | Free, Open Source & Ad-free"
        description="Convert YAML to JSON format quickly and easily with Jam's free online YAML to JSON converter. Just paste your YAML data and get the JSON result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="YAML to JSON"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>YAML</Label>
            <Textarea
              rows={6}
              placeholder="Paste YAML here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>JSON</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <YamlToJsonSEO />
      </section>
    </main>
  );
}
