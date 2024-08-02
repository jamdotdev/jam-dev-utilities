import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import CsvToJsonSEO from "@/components/seo/CsvToJsonSEO";

export default function CSVtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();
  const [lowercase, setLowercase] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value.trim();
      setInput(value);

      if (value === "") {
        setOutput("");
        return;
      }

      try {
        const json = convertCSVtoJSON(value, lowercase);
        setOutput(json);
      } catch {
        setOutput("Invalid CSV input");
      }
    },
    [lowercase]
  );

  const toggleLowercase = useCallback(() => {
    setLowercase((prevValue) => {
      const nextValue = !prevValue;

      if (input === "") {
        setOutput("");
        return nextValue;
      }

      try {
        const json = convertCSVtoJSON(input, nextValue);
        setOutput(json);
      } catch {
        setOutput("Invalid CSV input");
      }

      return nextValue;
    });
  }, [input]);

  return (
    <main>
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSV to JSON Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
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

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">JSON</Label>
              <div className="flex items-center">
                <Checkbox
                  id="lowercase"
                  onCheckedChange={toggleLowercase}
                  className="mr-1"
                />
                <label
                  htmlFor="lowercase"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  lowercase keys
                </label>
              </div>
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
        <CsvToJsonSEO />
      </section>
    </main>
  );
}

const convertCSVtoJSON = (csv: string, lowercase: boolean): string => {
  try {
    const lines = csv.split("\n");
    const result: { [key: string]: string }[] = [];
    const headers = lines[0].split(",").map((header) => {
      return lowercase ? header.trim().toLowerCase() : header.trim();
    });

    for (let i = 1; i < lines.length; i++) {
      const object: { [key: string]: string } = {};
      const currentline = lines[i].split(",");

      if (currentline.length !== headers.length) {
        throw new Error("Invalid CSV format");
      }

      for (let j = 0; j < headers.length; j++) {
        object[headers[j]] = currentline[j].trim();
      }

      result.push(object);
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Error converting CSV to JSON:", error);
    throw error;
  }
};
