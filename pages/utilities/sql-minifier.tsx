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
import {
  minifySQL,
  validateSQLInput,
} from "@/components/utils/sql-minifier.utils";
import GitHubContribution from "@/components/GitHubContribution";

export default function SQLMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);
      setError("");

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      const validation = validateSQLInput(value);
      if (!validation.isValid) {
        setError(validation.error || "Invalid input");
        setOutput("");
        return;
      }

      try {
        const minified = minifySQL(value);
        setOutput(minified);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to minify SQL";
        setError(errorMessage);
        setOutput("");
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
            <Textarea
              value={error ? `Error: ${error}` : output}
              rows={6}
              readOnly
              className={`mb-4 ${error ? "text-red-500" : ""}`}
            />
            <Button
              variant="outline"
              onClick={() => handleCopy(output)}
              disabled={!output || !!error}
            >
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="prasang-s" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <SQLMinifierSEO />
      </section>
    </main>
  );
}
