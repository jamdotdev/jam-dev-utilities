import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import JsonFormatterSEO from "../../components/seo/JsonFormatterSEO";
import CallToActionGrid from "../../components/CallToActionGrid";

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const parsedJSON = JSON.parse(value.trim());
        const formattedJSON = JSON.stringify(parsedJSON, null, 2);

        setOutput(formattedJSON);
      } catch (e) {
        console.error("Invalid JSON: ", e);
        setOutput("Invalid JSON input");
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
          title="JSON formatter"
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
            <Label>Formatted JSON</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <JsonFormatterSEO />
      </section>
    </main>
  );
}
