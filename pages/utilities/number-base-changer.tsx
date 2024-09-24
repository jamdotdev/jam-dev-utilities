import { useCallback, useEffect, useState } from "react";
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
import { Combobox } from "@/components/ds/ComboboxComponent";
import NumberBaseChangerSEO from "@/components/seo/NumberBaseChangerSEO";
import { ArrowLeftRight } from "lucide-react";

export default function NumberBaseChanger() {
  const [base, setBase] = useState({ from: 10, to: 2 });
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);
    },
    []
  );

  const switchValues = useCallback(() => {
    setBase((prev) => ({
      from: prev.to,
      to: prev.from,
    }));
  }, []);

  useEffect(() => {
    setOutput(convertBase(input, base.from, base.to));
  }, [input, base.from, base.to]);

  return (
    <main>
      <Meta
        title="Number Base Changer | Free, Open Source & Ad-free"
        description="Easily convert numbers between different bases (binary, decimal, hexadecimal) with our free online Number Base Changer. Perfect for developers and mathematicians looking for quick base conversions"
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Number Base Changer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Number</Label>
            <Textarea
              className="mb-6"
              value={input}
              onChange={handleChange}
              rows={3}
            />

            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label>From</Label>
                <Combobox
                  data={data}
                  value={base.from.toString()}
                  onSelect={(value) => switchValues}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button variant="outline" onClick={switchValues}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-1 flex-col">
                <Label>To</Label>
                <Combobox
                  data={data}
                  value={base.to.toString()}
                  onSelect={(value) => switchValues}
                />
              </div>
            </div>

            <Label>Result</Label>
            <Textarea value={output} rows={3} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl mb-6">
        <NumberBaseChangerSEO />
      </section>
    </main>
  );
}

const convertBase = (num: string, fromBase: number, toBase: number) => {
  if (!num) {
    return "";
  }

  const parsedNum = parseInt(num, fromBase);
  if (isNaN(parsedNum)) {
    return "Invalid number";
  }

  return parsedNum.toString(toBase);
};

const data = [
  {
    value: "2",
    label: "Binary (2)",
  },
  {
    value: "8",
    label: "Octal (8)",
  },
  {
    value: "10",
    label: "Decimal (10)",
  },
  {
    value: "16",
    label: "Hexadecimal (16)",
  },
];
