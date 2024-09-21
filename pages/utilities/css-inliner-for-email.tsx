import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { convertCSSToInline } from "@/components/utils/css-to-inline.utils";
import { CMDK } from "@/components/CMDK";
import GitHubContribution from "@/components/GitHubContribution";

export default function CSSInlinerForEmail() {
  const [htmlInput, setHtmlInput] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  function isValidHTML(html: string): boolean {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const hasTags = doc.body?.children.length > 0;
    const hasParsingErrors = doc.querySelectorAll("parsererror").length > 0;

    return hasTags && !hasParsingErrors;
  }

  const handleHtmlChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHtmlInput(event.currentTarget.value);
    },
    []
  );

  const handleCssChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCssInput(event.currentTarget.value);
    },
    []
  );

  const handleConvert = useCallback(() => {
    const trimmedHtml = htmlInput.trim();
    const trimmedCss = cssInput.trim();

    const conditions = [
      {
        condition: !trimmedHtml || !trimmedCss,
        message: "Please provide both HTML and CSS inputs.",
      },
      {
        condition: !isValidHTML(trimmedHtml),
        message: "Invalid HTML input. Please check your HTML.",
      },
    ];

    const errorMessage =
      conditions.find((value) => value.condition)?.message ?? "";

    try {
      const inlinedHtml = convertCSSToInline(htmlInput, cssInput);
      setOutput(errorMessage || inlinedHtml);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(error.message);
      } else {
        setOutput(errorMessage);
      }
    }
  }, [htmlInput, cssInput]);

  return (
    <main>
      <Meta
        title="CSS Inliner for Email | Free, Open Source & Ad-free"
        description="Convert CSS styles to inline styles directly in your HTML with Jam's free CSS Inliner for Email. Just paste your HTML and CSS, and get the inlined HTML result."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSS Inliner for Email"
          description="Convert your CSS to inline styles quickly and easily."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>HTML</Label>
            <Textarea
              rows={6}
              placeholder="Paste HTML here"
              onChange={handleHtmlChange}
              className="mb-6"
              value={htmlInput}
            />

            <Label>CSS</Label>
            <Textarea
              rows={6}
              placeholder="Paste CSS here"
              onChange={handleCssChange}
              className="mb-4"
              value={cssInput}
            />

            <Button onClick={handleConvert} className="mb-6">
              Convert to Inline
            </Button>

            <Label>Inlined HTML</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution contributors={[{ username: "EduardoDePatta" }]} />
      <CallToActionGrid />
    </main>
  );
}
