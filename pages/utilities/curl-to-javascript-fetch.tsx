import { useCallback, useMemo, useState } from "react";
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

export default function CurlToJavascript() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();
  // This is a minor optimization because the `curlconverter` package
  // includes necessary .wasm files that are loaded asynchronously.
  const toJavaScript = useMemo(() => {
    let converter: (input: string) => string;

    import("curlconverter").then((module) => {
      converter = module.toJavaScript;
    });

    return (input: string) => converter?.(input);
  }, []);

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const fetchCode = toJavaScript(value.trim());
        setOutput(fetchCode);
      } catch {
        setOutput("Invalid cURL command");
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="cURL to JavaScript Fetch Converter by Jam.dev | Free, Open Source & Ad-free"
        description="Convert cURL commands to JavaScript fetch code quickly and easily with Jam's free online converter. Just paste your cURL command and get the fetch code. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="cURL to JavaScript Fetch"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>cURL Command</Label>
            <Textarea
              rows={6}
              placeholder="Paste cURL command here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <Label>JavaScript Fetch</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>
      <CallToActionGrid />
    </main>
  );
}
