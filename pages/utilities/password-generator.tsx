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
import PasswordGeneratorSEO from "@/components/seo/PasswordGeneratorSEO";
import GitHubContribution from "@/components/GitHubContribution";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState<number>(16);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const { buttonText, handleCopy } = useCopyToClipboard();
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  const generatePassword = useCallback(() => {
    const builder = new PasswordBuilder(
      includeLowercase,
      includeUppercase,
      includeNumbers,
      includeSymbols,
      length
    )
    setPassword(builder.Build());
  }, [includeLowercase, includeUppercase, includeNumbers, includeSymbols, length]);

  const strengthInfo = useMemo(() => {
    const types = [includeLowercase, includeUppercase, includeNumbers, includeSymbols].filter(Boolean).length;

    if (length >= 20 && types >= 3) {
      return { label: "Very Strong", className: "text-green-600 font-semibold" };
    }
    if (length >= 12 && types >= 3) {
      return { label: "Strong", className: "text-green-500" };
    }
    if (length >= 10 && types >= 2) {
      return { label: "Medium", className: "text-yellow-500" };
    }
    return { label: "Weak", className: "text-red-500" };
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols]);

  return (
    <main>
      <Meta
        title="Password Generator | Free, Open Source & Ad-free"
        description="Generate strong and secure passwords instantly with Jam's free online Password Generator. Choose your preferences or use all options by default — uppercase letters, lowercase letters, numbers, and special characters — and get a reliable password in one click. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Password Generator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 rounded-xl">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="mb-0">Options</Label>
              <div className="text-xs text-muted-foreground">Select the desired options</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <Checkbox checked={includeLowercase} onCheckedChange={() => setIncludeLowercase(v => !v)} />
                <span className="text-sm">Lowercase letters</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox checked={includeUppercase} onCheckedChange={() => setIncludeUppercase(v => !v)} />
                <span className="text-sm">Uppercase letters</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox checked={includeNumbers} onCheckedChange={() => setIncludeNumbers(v => !v)} />
                <span className="text-sm">Numbers</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox checked={includeSymbols} onCheckedChange={() => setIncludeSymbols(v => !v)} />
                <span className="text-sm">Special Characteres</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Label className="mb-0">Length</Label>
              <Input
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className='w-24'
              />
              <div className="ml-auto text-sm">Strength: <strong className={strengthInfo.className}>{strengthInfo.label}</strong></div>
            </div>

            <div>
              <div className="mb-2 flex justify-between items-center">
                <Label className="mb-0">Password</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generatePassword}>Generate</Button>
                </div>
              </div>

              <Textarea
                value={password}
                readOnly
                rows={2}
                ref={outputRef}
                className="mb-4"
                placeholder="Click 'Generate' to create a secure password."
              />

              <div className="flex gap-2 justify-between">
                <Button variant="outline" onClick={() => handleCopy(password)}>{buttonText}</Button>
                <Button variant="outline" onClick={() => setPassword("")}>Clear</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="sousadiego11" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <PasswordGeneratorSEO />
      </section>
    </main>
  );
}
