import { useCallback, useState } from "react";
import { Textarea } from "../../components/ds/TextareaComponent";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ds/CardComponent";
import { Button } from "../../components/ds/ButtonComponent";
import { Label } from "../../components/ds/LabelComponent";
import Header from "../../components/Header";
import { useCopyToClipboard } from "../../components/hooks/useCopyToClipboard";
import yaml from "js-yaml";
import { CMDK } from "../../components/CDMK";

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
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="YAML to JSON"
          description="Fast, free, open source, ad-free tools."
          logoSrc="/logo.png"
        />
      </section>

      <section className="container max-w-2xl">
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
    </main>
  );
}
