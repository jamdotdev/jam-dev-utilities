import { useCallback, useState } from "react";
import CallToActionGrid from "@/components/CallToActionGrid";
import { CMDK } from "@/components/CMDK";
import { Card } from "@/components/ds/CardComponent";
import Header from "@/components/Header";
import Meta from "@/components/Meta";
import PageHeader from "@/components/PageHeader";
import { Label } from "@/components/ds/LabelComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import {
  pxToRem,
  remToPx,
  pxToVw,
  vwToPx,
  pxToVh,
  vhToPx,
  pxToVmin,
  vminToPx,
  pxToVmax,
  vmaxToPx,
} from "@/components/utils/css-units-converter.utils";
import { Input } from "@/components/ds/InputComponent";
import GitHubContribution from "@/components/GitHubContribution";
import { ArrowLeftRight } from "lucide-react";

type ConvertionFunction = (value: number, ...args: number[]) => number;
type ConversionKey =
  | "px-rem"
  | "rem-px"
  | "px-vw"
  | "vw-px"
  | "px-vh"
  | "vh-px"
  | "px-vmin"
  | "vmin-px"
  | "px-vmax"
  | "vmax-px";

export default function CSSUnitsConverter() {
  const [htmlInput, setHtmlInput] = useState("");
  const [unit, setUnit] = useState({ from: "px", to: "rem" });
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const needsContainerInput =
    ["vw", "vh", "vmin", "vmax"].includes(unit.from) ||
    ["vw", "vh", "vmin", "vmax"].includes(unit.to);

  const convertUnits = useCallback(() => {
    const value = parseFloat(htmlInput);
    const containerWidthValue = parseFloat(widthInput);
    const containerHeightValue = parseFloat(heightInput);

    if (isNaN(value) || (needsContainerInput && isNaN(containerWidthValue))) {
      setOutput("Invalid values.");
      return;
    }

    const conversionKey = `${unit.from}-${unit.to}` as ConversionKey;
    const conversionFunction = conversionFunctionMapper[conversionKey];

    if (!(conversionKey in conversionFunctionMapper)) {
      setOutput("Invalid conversion");
      return;
    }

    let convertedValue: string | number = "Invalid conversion";

    if (conversionFunction) {
      if (["px-vw", "vw-px"].includes(conversionKey)) {
        convertedValue = conversionFunction(value, containerWidthValue);
      } else if (["px-vh", "vh-px"].includes(conversionKey)) {
        convertedValue = conversionFunction(value, containerHeightValue);
      } else if (["px-vmin", "vmin-px"].includes(conversionKey)) {
        convertedValue = conversionFunction(
          value,
          containerWidthValue,
          containerHeightValue
        );
      } else if (["px-vmax", "vmax-px"].includes(conversionKey)) {
        convertedValue = conversionFunction(
          value,
          containerWidthValue,
          containerHeightValue
        );
      } else {
        convertedValue = conversionFunction(value);
      }

      setOutput(convertedValue.toString());
    }
  }, [
    unit.from,
    heightInput,
    htmlInput,
    needsContainerInput,
    unit.to,
    widthInput,
  ]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setHtmlInput(inputValue);
      if (inputValue.trim() === "") {
        setOutput("");
      }
    },
    []
  );

  const switchValues = useCallback(() => {
    setUnit((prev) => ({
      from: prev.to,
      to: prev.from,
    }));
  }, []);

  return (
    <main>
      <Meta
        title="CSS units converter | Free, Open Source & Ad-free"
        description="Easily convert px to rem with our simple CSS unit converter"
      />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSS Units Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>
      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Input Value</Label>
            <Input
              className="mb-6"
              value={htmlInput}
              onChange={handleInputChange}
            />
            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label>From Unit</Label>
                <Combobox
                  data={unitOptions}
                  value={unit.from}
                  onSelect={(value) => setUnit({from: value , to: unit.to})}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button variant="outline" onClick={switchValues}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-1 flex-col">
                <Label>To Unit</Label>
                <Combobox
                  data={unitOptions}
                  value={unit.to}
                  onSelect={(value) => setUnit({from: unit.from , to: value})}
                />
              </div>
            </div>
            {needsContainerInput && (
              <div className="mb-6 flex gap-4">
                <div className="flex flex-1 flex-col">
                  <Label>Container Width (px)</Label>
                  <Input
                    type="number"
                    className="h-[32px]"
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value)}
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <Label>Container Height (px)</Label>
                  <Input
                    type="number"
                    className="h-[32px]"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Label>Result</Label>
            <Input value={output} readOnly className="mb-4" />
            <div className="flex flex-1 justify-between">
              <Button onClick={() => convertUnits()}>Convert</Button>

              <Button variant="outline" onClick={() => handleCopy(output)}>
                {buttonText}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="franciscoaiolfi" />
      <CallToActionGrid />
    </main>
  );
}

const unitOptions = [
  { value: "px", label: "Pixels (px)" },
  { value: "rem", label: "Rems (rem)" },
  { value: "vw", label: "Viewport Width (vw)" },
  { value: "vh", label: "Viewport Height (vh)" },
  { value: "vmin", label: "Viewport Min (vmin)" },
  { value: "vmax", label: "Viewport Max (vmax)" },
];

const conversionFunctionMapper: Record<ConversionKey, ConvertionFunction> = {
  "px-rem": pxToRem,
  "rem-px": remToPx,
  "px-vw": pxToVw,
  "vw-px": vwToPx,
  "px-vh": pxToVh,
  "vh-px": vhToPx,
  "px-vmin": pxToVmin,
  "vmin-px": vminToPx,
  "px-vmax": pxToVmax,
  "vmax-px": vmaxToPx,
};
