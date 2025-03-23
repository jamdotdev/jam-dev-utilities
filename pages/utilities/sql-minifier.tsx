import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "../../components/CallToActionGrid";
import Meta from "@/components/Meta";
import SQLMinifierSEO from "@/components/seo/SQLMinifierSEO";

export default function SQLMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        let sql = value;
        sql = sql.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, "");
        sql = sql.replace(/\s+/g, " ").trim();

        setOutput(sql);
      } catch {
        setOutput("Invalid SQL input");
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="SQL Minifier | Free, Open Source & Ad-free"
        description="Minify SQL by removing comments, extra spaces, and formatting for cleaner, optimized queries."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="SQL Minifier"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>SQL</Label>
            <Textarea
              rows={6}
              placeholder="Paste SQL here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>Minified SQL</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <SQLMinifierSEO />
      </section>
    </main>
  );
}
