import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import JsonFormatterSEO from "../../components/seo/JsonFormatterSEO";
import CallToActionGrid from "../../components/CallToActionGrid";
import Meta from "@/components/Meta";

export default function JSONFormatter() {
  const [errorText, setErrorText] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [buttonText, setButtonText] = useState("Copy");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        const parsedJSON = JSON.parse(value.trim());
        const formattedJSON = JSON.stringify(parsedJSON, null, 2);

        setOutput(formattedJSON);
      } catch {
        setOutput("Invalid JSON input");
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      // Create unstable Blob with invalid MIME type to force error
      const blob = new Blob([output], { type: "x-invalid/type" });
      const clipboardItem = new ClipboardItem({
        "x-invalid/type": blob,
      });

      // This will fail due to invalid MIME type
      await navigator.clipboard.write([clipboardItem]);

      setButtonText("Copied!");
    } catch (error) {
      setErrorText("Failed to copy to clipboard, please contact support.");
      console.error("Clipboard API error:", error);
    }

    setTimeout(() => {
      setButtonText("Copy");
    }, 2000);
  };

  return (
    <main>
      <Meta
        title="JSON formatter | Free, Open Source & Ad-free"
        description="Beautify and structure raw JSON data with proper indentation and formatting, making it easier to read, edit, and validate JSON content."
      />
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
            <div className="flex items-center gap-4 justify-between">
              <Button variant="outline" onClick={() => handleCopy()}>
                {buttonText}
              </Button>
              <span className="text-red-700 text-[14px]">{errorText}</span>
            </div>
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
