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
import { convertJSONtoXML } from "@/components/utils/json-to-xml.utils";
import { convertXMLtoJSON } from "@/components/utils/xml-to-json.utils";
import GitHubContribution from "@/components/GitHubContribution";

type ConversionType = "jsonToXml" | "xmlToJson";

export default function Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [conversionType, setConversionType] =
    useState<ConversionType>("jsonToXml");
  const [error, setError] = useState<string | null>(null);
  const { buttonText, handleCopy } = useCopyToClipboard();

  const performConversion = useCallback(
    async (currentInput: string, currentConversionType: ConversionType) => {
      if (currentInput.trim() === "") {
        setOutput("");
        setError(null);
        return;
      }

      try {
        let result: string;
        if (currentConversionType === "jsonToXml") {
          const xml = convertJSONtoXML(currentInput.trim());
          result = xml;
        } else {
          const json = await convertXMLtoJSON(currentInput.trim());
          result = JSON.stringify(json, null, 2);
        }
        setOutput(result);
        setError(null);
      } catch (errorMessage: unknown) {
        const message =
          typeof errorMessage === "string"
            ? errorMessage
            : errorMessage instanceof Error
              ? errorMessage.message
              : "An unknown error occurred during conversion.";
        setError(message);
        setOutput("");
      }
    },
    []
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);
      performConversion(value, conversionType);
    },
    [conversionType, performConversion]
  );

  const handleConversionTypeSwitch = useCallback(() => {
    // Determine the new conversion type
    const newConversionType: ConversionType =
      conversionType === "jsonToXml" ? "xmlToJson" : "jsonToXml";

    // Swap input and output only if there's no error
    if (!error) {
      const newInput = output;
      setInput(newInput);
      performConversion(newInput, newConversionType);
    } else {
      // If there's an error, just switch the conversion type without swapping
      setInput("");
      setOutput("");
      setError(null);
    }

    setConversionType(newConversionType);
  }, [conversionType, output, performConversion, error]);

  return (
    <main>
      <Meta
        title="Converter | Free, Open Source & Ad-free"
        description="Convert between JSON and XML formats quickly and easily with our free online converter. Choose your conversion type and get the result instantly."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JSON ↔ XML Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Select Conversion Type</Label>
            <div className="mb-4 flex space-x-2">
              <Button
                variant={conversionType === "jsonToXml" ? "default" : "outline"}
                onClick={handleConversionTypeSwitch}
              >
                JSON to XML
              </Button>
              <Button
                variant={conversionType === "xmlToJson" ? "default" : "outline"}
                onClick={handleConversionTypeSwitch}
              >
                XML to JSON
              </Button>
            </div>

            <Label>
              {conversionType === "jsonToXml" ? "JSON Input" : "XML Input"}
            </Label>
            <Textarea
              rows={6}
              placeholder={
                conversionType === "jsonToXml"
                  ? "Paste JSON here"
                  : "Paste XML here"
              }
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <div className="flex justify-between items-center mb-2">
              <Label>
                {conversionType === "jsonToXml" ? "XML Output" : "JSON Output"}
              </Label>
              {/* Optionally, you can add a swap button here if you want to allow swapping without clicking conversion type buttons */}
            </div>

            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button
              variant="outline"
              onClick={() => handleCopy(output)}
              disabled={!output}
            >
              {buttonText}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </Card>
      </section>

      <GitHubContribution username="ayshrj" />
      <CallToActionGrid />
    </main>
  );
}
