import { useState, useCallback } from "react";
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
import { minifyJS } from "@/components/utils/minify-js.utils";
import { minifyCSS } from "@/components/utils/minify-css.utils";
import GitHubContribution from "@/components/GitHubContribution";

export default function MinifyJSAndCSS() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<"js" | "css">("js");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const minified =
          language === "js" ? await minifyJS(value) : minifyCSS(value);
        setOutput(minified);
      } catch (errorMessage: unknown) {
        setOutput((errorMessage as Error).message);
      }
    },
    [language]
  );

  return (
    <main>
      <Meta
        title="JS and CSS Minifier | Free, Open Source & Ad-free"
        description="Minify JavaScript and CSS files quickly and easily with Jam's free online minifier. Just paste your code and get the minified result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JS & CSS Minifier"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Select Language</Label>
            <div className="mb-4">
              <Button
                variant={language === "js" ? "default" : "outline"}
                onClick={() => setLanguage("js")}
              >
                JavaScript
              </Button>
              <Button
                variant={language === "css" ? "default" : "outline"}
                onClick={() => setLanguage("css")}
              >
                CSS
              </Button>
            </div>

            <Label>Input Code</Label>
            <Textarea
              rows={6}
              placeholder={`Paste ${language.toUpperCase()} code here`}
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">Minified Output</Label>
            </div>

            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="ayshrj" />
      <CallToActionGrid />
    </main>
  );
}
