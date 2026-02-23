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
import TsvToJsonSEO from "@/components/seo/TsvToJsonSEO";
import Meta from "@/components/Meta";
import { convertTSVtoJSON } from "@/components/utils/tsv-to-json.utils";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";

export default function TSVtoJSON() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();
  const [lowercase, setLowercase] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const SAMPLE_DATA = `Name\tAge\tCountry
John\t25\tUSA
Alice\t30\tCanada
Bob\t35\tUK`;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setOutput("");
        return;
      }

      try {
        const json = convertTSVtoJSON(value.trim(), lowercase);
        setOutput(json);
      } catch (errorMessage: unknown) {
        setOutput(errorMessage as string);
      }
    },
    [lowercase]
  );

  const handleFillSampleData = useCallback(() => {
    setInput(SAMPLE_DATA);
    handleChange({
      currentTarget: { value: SAMPLE_DATA },
    } as React.ChangeEvent<HTMLTextAreaElement>);
  }, []);

  const toggleLowercase = useCallback(() => {
    setLowercase((prevValue) => {
      const nextValue = !prevValue;

      if (input === "") {
        setOutput("");
        return nextValue;
      }

      try {
        const json = convertTSVtoJSON(input, nextValue);
        setOutput(json);
      } catch {
        setOutput("Invalid TSV input");
      }

      return nextValue;
    });
  }, [input]);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("text/") && !file.name.endsWith(".tsv")) {
        setOutput("Please upload a TSV file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);

        try {
          const json = convertTSVtoJSON(content, lowercase);
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
        title="TSV to JSON Converter | Free, Open Source & Ad-free"
        description="Convert TSV files to JSON format quickly and easily with Jam's free online TSV to JSON converter. Upload your TSV file or paste its content and get the JSON result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="TSV to JSON Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">TSV</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleFillSampleData}
                >
                  Fill Sample Data
                </Button>
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  type="button"
                  size="sm"
                  className="gap-2"
                >
                  <UploadIcon className="w-[16px]" /> Upload TSV
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".tsv"
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
                placeholder="Paste or drag and drop a TSV file"
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
            <div className="flex gap-2 justify-between">
              <Button variant="outline" onClick={() => handleCopy(output)}>
                {buttonText}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInput("");
                  setOutput("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <TsvToJsonSEO />
      </section>
    </main>
  );
}
