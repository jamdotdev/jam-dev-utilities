import { useCallback, useState } from "react";
import { Textarea } from "../../components/ds/TextareaComponent";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ds/CardComponent";
import { Button } from "../../components/ds/ButtonComponent";
import { Label } from "../../components/ds/LabelComponent";
import Header from "../../components/Header";

export default function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [buttonText, setButtonText] = useState("Copy");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const json = convertCSVtoJSON(value);
        setOutput(json);
      } catch (error) {
        setOutput("Invalid CSV input");
      }
    },
    []
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setButtonText("Copied!");
      setTimeout(() => setButtonText("Copy"), 1200);
    });
  }, [output]);

  return (
    <main>
      <Header />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSV to JSON"
          description="Fast, free, open source, ad-free tools."
          logoSrc="/logo.png"
        />
      </section>

      <section className="container max-w-2xl">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>CSV</Label>
            <Textarea
              rows={6}
              placeholder="Paste CSV here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>JSON</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={handleCopy}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}

const convertCSVtoJSON = (csv: string): string => {
  try {
    const lines = csv.split("\n");
    const result: { [key: string]: string }[] = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const object: { [key: string]: string } = {};
      const currentline = lines[i].split(",");

      if (currentline.length !== headers.length) {
        throw new Error("Invalid CSV format");
      }

      for (let j = 0; j < headers.length; j++) {
        object[headers[j]] = currentline[j];
      }

      result.push(object);
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Error converting CSV to JSON:", error);
    throw error;
  }
};
