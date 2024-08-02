import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import QueryParamsToJsonSEO from "@/components/seo/QueryParamsToJsonSEO";
import CallToActionGrid from "@/components/CallToActionGrid";

export default function QueryParamsToJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const output = convertQueryParamsToJSON(value.trim());
        setOutput(output);
      } catch (error) {
        setOutput("Invalid input, please provide valid query parameters");
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
          title="Query Params to JSON"
          description="Free, Open Source & Ad-free"
          logoSrc="https://jam.dev/page-icon.png"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Query Parameters</Label>
            <Textarea
              rows={6}
              placeholder="Paste here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>JSON Output</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <QueryParamsToJsonSEO />
      </section>
    </main>
  );
}

const convertQueryParamsToJSON = (input: string): string => {
  let inputString = input;

  if (!input.includes("://")) {
    inputString = input.startsWith("?")
      ? `https://example.com${input}`
      : `https://example.com?${input}`;
  }

  const url = new URL(inputString);
  const intermediateResult: { [key: string]: string | string[] } = {};

  url.searchParams.forEach((value, key) => {
    if (intermediateResult[key]) {
      if (Array.isArray(intermediateResult[key])) {
        intermediateResult[key].push(value);
      } else {
        intermediateResult[key] = [intermediateResult[key], value];
      }
    } else {
      intermediateResult[key] = value;
    }
  });

  const sortedKeys = Object.keys(intermediateResult).sort();
  const result: { [key: string]: string | string[] } = {};

  sortedKeys.forEach((key) => {
    result[key] = intermediateResult[key];
  });

  return JSON.stringify(result, null, 2);
};
