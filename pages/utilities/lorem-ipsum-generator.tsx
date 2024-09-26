import { useCallback, useEffect, useState } from "react";
import { loremIpsum } from "lorem-ipsum";
import CallToActionGrid from "@/components/CallToActionGrid";
import { CMDK } from "@/components/CMDK";
import { Button } from "@/components/ds/ButtonComponent";
import { Card } from "@/components/ds/CardComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Input } from "@/components/ds/InputComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import GitHubContribution from "@/components/GitHubContribution";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import Meta from "@/components/Meta";
import LoremIpsumGeneratorSEO from "@/components/seo/LoremIpsumGeneratorSEO";

const generationOptions = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
];

declare type LoremUnit = "words" | "sentences" | "paragraphs";

export default function LoremIpsumGenerator() {
  const [inputAmount, setInputAmount] = useState(1);
  const [output, setOutput] = useState("");
  const [generationUnit, setGenerationUnit] = useState<LoremUnit>("paragraphs");
  const [asHTML, setAsHTML] = useState(false);
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = parseInt(event.currentTarget.value);
    if (value > 0 && value < 100) setInputAmount(value);
  };

  const generateText = useCallback(() => {
    const text = loremIpsum({
      count: inputAmount,
      format: asHTML ? "html" : "plain",
      paragraphLowerBound: 3,
      paragraphUpperBound: 6,
      random: Math.random,
      sentenceLowerBound: 7,
      sentenceUpperBound: 14,
      suffix: "\n\n",
      units: generationUnit,
    });
    setOutput(text);
  }, [inputAmount, generationUnit, asHTML]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  return (
    <main>
      <Meta
        title="Lorem Ipsum Generator | Free, Open Source & Ad-free"
        description="Easily generate random Lorem Ipsum text for your design projects. Perfect for placeholder content and layout previews"
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Lorem Ipsum Generator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="flex mb-2 w-full gap-4">
            <div className="flex-1">
              <Label className="mb-2">Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                className="h-8 text-sm"
                value={inputAmount}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col justify-end">
              <Combobox
                data={generationOptions}
                value={generationUnit}
                onSelect={(value: LoremUnit) => setGenerationUnit(value)}
              />
            </div>
          </div>

          <div className="flex items-center mb-6 mt-2 gap-2">
            <Checkbox
              id="as-html"
              checked={asHTML}
              onCheckedChange={() => setAsHTML(!asHTML)}
              className="mr-1"
            />
            <Label htmlFor="as-html" className="mb-0 hover:cursor-pointer">
              As HTML
            </Label>
          </div>

          <Divider />

          <Label>Result</Label>
          <Textarea value={output} rows={9} readOnly className="mb-4" />
          <div className="flex flex-1 justify-between">
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
            <Button variant="default" onClick={() => generateText()}>
              Refresh
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="sprechblase" />
      <CallToActionGrid />

      <section className="container max-w-2xl mb-6">
        <LoremIpsumGeneratorSEO />
      </section>
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-muted my-6"></div>;
};
