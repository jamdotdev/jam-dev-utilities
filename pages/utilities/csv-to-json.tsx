import { useCallback, useState, useRef } from "react";
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
import Meta from "@/components/Meta";
import { convertCSVtoJSON } from "@/components/utils/csv-to-json.utils";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";

export default function CSVtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();
  const [lowercase, setLowercase] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const json = convertCSVtoJSON(value.trim(), lowercase);
        setOutput(json);
      } catch (errorMessage: unknown) {
        setOutput(errorMessage as string);
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

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("text/") && !file.name.endsWith(".csv")) {
        setOutput("Please upload a CSV file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);

        try {
          const json = convertCSVtoJSON(content, lowercase);
          setOutput(json);
        } catch (errorMessage: unknown) {
          setOutput(errorMessage as string);
        }
      };
      reader.readAsText(file);
    },
    [lowercase]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const file = e.clipboardData.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <main>
      <Meta
        title="CSV to JSON Converter | Free, Open Source & Ad-free"
        description="Convert CSV files to JSON format quickly and easily with Jam's free online CSV to JSON converter. Upload your CSV file or paste its content and get the JSON result. That's it."
      />
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
            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">CSV</Label>
              <Button
                variant="outline"
                onClick={triggerFileInput}
                type="button"
                size="sm"
                className="gap-2"
              >
                <UploadIcon className="w-[16px]" /> Upload CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            <div
              className="relative"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Textarea
                rows={6}
                placeholder="Paste or drag and drop a CSV file"
                onInput={handleChange}
                onPaste={handlePaste}
                className={cn("mb-6", {
                  "border-dashed": isDragging,
                  "bg-white": isDragging,
                  "border-gray-300": isDragging,
                })}
                value={input}
              />

              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-sm bg-white p-2 rounded-md shadow">
                    Drop it like it's hot 🔥
                  </p>
                </div>
              )}
            </div>

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
