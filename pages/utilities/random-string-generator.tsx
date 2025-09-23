import { useCallback, useState, useRef, useMemo } from "react";
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
import Meta from "@/components/Meta";
import { Input } from "@/components/ds/InputComponent";
import { PasswordBuilder } from "@/components/utils/password-generator.utils";
import RandomStringGeneratorSEO from "@/components/seo/RandomStringGeneratorSEO";
import GitHubContribution from "@/components/GitHubContribution";
import { cn } from "@/lib/utils";

export default function PasswordGenerator() {
  const [generatedString, setGeneratedString] = useState("");
  const [length, setLength] = useState<number>(16);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const { buttonText, handleCopy } = useCopyToClipboard();
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  const generateRandomString = useCallback(() => {
    const builder = new PasswordBuilder(
      includeLowercase,
      includeUppercase,
      includeNumbers,
      includeSymbols,
      length
    );
    setGeneratedString(builder.Build());
  }, [
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
    length,
  ]);

  const strengthInfo = useMemo(() => {
    const types = [
      includeLowercase,
      includeUppercase,
      includeNumbers,
      includeSymbols,
    ].filter(Boolean).length;

    if (length >= 20 && types >= 3) {
      return {
        label: "Very Strong",
        className: "bg-green-600",
      };
    }
    if (length >= 12 && types >= 3) {
      return { label: "Strong", className: "bg-green-500" };
    }
    if (length >= 10 && types >= 2) {
      return { label: "Medium", className: "bg-yellow-500" };
    }
    return { label: "Weak", className: "bg-red-500" };
  }, [
    length,
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
  ]);

  return (
    <main>
      <Meta
        title="Random String Generator | Free, Open Source & Ad-free"
        description="Generate cryptographically strong random strings with password-like structure instantly with Jam's free online Random String Generator. Choose your preferences or use all options by default — uppercase letters, lowercase letters, numbers, and special characters — and get a reliable random string in one click. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Random String Generator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 rounded-xl">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="mb-0">Select desired options:</Label>
            </div>

            <div className="h-[1px] bg-border"></div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeLowercase}
                  onCheckedChange={() => setIncludeLowercase((v) => !v)}
                />
                <span className="text-sm">Lowercase letters</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeUppercase}
                  onCheckedChange={() => setIncludeUppercase((v) => !v)}
                />
                <span className="text-sm ">Uppercase letters</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeNumbers}
                  onCheckedChange={() => setIncludeNumbers((v) => !v)}
                />
                <span className="text-sm">Numbers</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={includeSymbols}
                  onCheckedChange={() => setIncludeSymbols((v) => !v)}
                />
                <span className="text-sm">Special Characteres</span>
              </label>
            </div>

            <div className="h-[1px] flex bg-muted"></div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <Label className="mb-2">Length:</Label>
                <Input
                  type="number"
                  min={4}
                  max={128}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="h-8 w-full"
                />
              </div>

              <div className="text-sm">
                <Label className="mb-2">String complexity:</Label>

                <div className="bg-muted text-foreground h-8 rounded-md items-center flex px-3 font-medium gap-1.5">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      strengthInfo.className
                    )}
                  />
                  {strengthInfo.label}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-border"></div>

            <div className="flex flex-col">
              <Button onClick={generateRandomString}>Generate</Button>
            </div>

            <div className="h-[1px] bg-border"></div>

            <div>
              <div className="mb-2 flex justify-between items-center">
                <Label className="mb-0">Generated String</Label>
              </div>

              <Textarea
                value={generatedString}
                readOnly
                rows={2}
                ref={outputRef}
                className="mb-4"
                placeholder="Click 'Generate' to create a cryptographically strong random string."
              />

              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(generatedString)}
                >
                  {buttonText}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedString("")}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="sousadiego11" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <RandomStringGeneratorSEO />
      </section>
    </main>
  );
}
