import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import Ajv from "ajv";
import CallToActionGrid from "@/components/CallToActionGrid";

export default function JsonSchemaValidator() {
  const [schema, setSchema] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [result, setResult] = useState<string | null>("");
  const [resultColor, setResultColor] = useState<string>("");

  const handleValidation = useCallback(() => {
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(JSON.parse(schema));
      const valid = validate(JSON.parse(jsonData));

      if (valid) {
        setResult("JSON data is valid against the schema");
        setResultColor("bg-green-100 text-green-800"); // Green color for success
      } else {
        setResult(
          `JSON data is invalid:\n${validate.errors
            ?.map((error) => `${error.dataPath} ${error.message}`)
            .join("\n")}`
        );
        setResultColor("bg-red-100 text-red-800"); // Red color for failure
      }
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
        setResultColor("bg-red-100 text-red-800"); // Red color for error
      }
    }
  }, [schema, jsonData]);

  useEffect(() => {
    if (schema && jsonData) {
      handleValidation();
    } else {
      setResult(""); // Keep the result box empty if fields are not filled
      setResultColor(""); // No color if fields are empty
    }
  }, [schema, jsonData, handleValidation]);

  const handleReset = () => {
    setSchema("");
    setJsonData("");
    setResult(""); // Clear the result
    setResultColor(""); // Clear the result color
  };

  return (
    <main>
      <Meta
        title="JSON Schema Validator by Jam.dev | Free, Open Source & Ad-free"
        description="Validate your JSON data against a schema with Jam's free online JSON Schema Validator."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JSON Schema Validator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>JSON Schema</Label>
            <Textarea
              rows={6}
              placeholder="Enter JSON schema here"
              onChange={(event) => setSchema(event.target.value)}
              className="mb-6"
              value={schema}
            />

            <Label>JSON Data</Label>
            <div>
              <Textarea
                rows={6}
                placeholder="Enter JSON data here"
                onChange={(event) => setJsonData(event.target.value)}
                className="mb-6"
                value={jsonData}
              />
            </div>

            <div>
              <Label>Result</Label>
              <div
                className={`w-full rounded-lg border border-input px-3 py-2 text-sm ring-offset-background ${resultColor}`}
              >
                <div>{result}</div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}

const Divider = () => {
  return <div className="bg-border h-[1px] my-2"></div>;
};
