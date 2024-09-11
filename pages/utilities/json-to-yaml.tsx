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
import Meta from "@/components/Meta";
import JsonToYamlSEO from "@/components/seo/JsonToYaml";

export default function JSONtoYAML() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const jsonObject = JSON.parse(value.trim());
        const yamlOutput = yaml.dump(jsonObject);
        setOutput(yamlOutput);
      } catch {
        setOutput("Invalid input");
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="JSON to YAML by Jam.dev | Free, Open Source & Ad-free"
        description="Convert JSON to YAML format quickly and easily with Jam's free online JSON to YAML converter. Just paste your JSON data and get the YAML result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JSON to YAML"
          description="Free, Open Source & Ad-free"
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
            <Label>YAML</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <JsonToYamlSEO />
      </section>
    </main>
  );
}
