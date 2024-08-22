import { useState } from "react";
import CallToActionGrid from "@/components/CallToActionGrid";
import { CMDK } from "@/components/CMDK";
import { Card } from "@/components/ds/CardComponent";
import Header from "@/components/Header";
import Meta from "@/components/Meta";
import PageHeader from "@/components/PageHeader";
import { Label } from "@/components/ds/LabelComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import {
  pxToRem,
  remToPx,
  pxToEm,
  emToPx,
  pxToVw,
  vwToPx,
  pxToVh,
  vhToPx,
  pxToVmin,
  vminToPx,
  pxToVmax,
  vmaxToPx,
} from "@/components/utils/css-units-converter.utils";

export default function CSSUnitsConverter() {
  const [htmlInput, setHtmlInput] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [output, setOutput] = useState("");

  const { buttonText, handleCopy } = useCopyToClipboard();

  const convertUnits = () => {
    const value = parseFloat(htmlInput);
    const containerWidthValue = parseFloat(cssInput);
    if (isNaN(value) || (needsContainerInput && isNaN(containerWidthValue))) {
      window.alert("Please provide valid values");
      return;
    }

    let convertedValue: string | number = "Invalid conversion";
    switch (fromUnit) {
      case "px":
        if (toUnit === "rem") convertedValue = pxToRem(value);
        else if (toUnit === "em") convertedValue = pxToEm(value);
        else if (toUnit === "vw" && containerWidthValue !== null)
          convertedValue = pxToVw(value, containerWidthValue);
        else if (toUnit === "vh" && containerWidthValue !== null)
          convertedValue = pxToVh(value, containerWidthValue);
        else if (toUnit === "vmin" && containerWidthValue !== null)
          convertedValue = pxToVmin(
            value,
            containerWidthValue,
            containerWidthValue
          );
        else if (toUnit === "vmax" && containerWidthValue !== null)
          convertedValue = pxToVmax(
            value,
            containerWidthValue,
            containerWidthValue
          );
        break;
      case "rem":
        if (toUnit === "px") convertedValue = remToPx(value);
        break;
      case "em":
        if (toUnit === "px") convertedValue = emToPx(value);
        break;
      case "vw":
        if (toUnit === "px" && containerWidthValue !== null)
          convertedValue = vwToPx(value, containerWidthValue);
        break;
      case "vh":
        if (toUnit === "px" && containerWidthValue !== null)
          convertedValue = vhToPx(value, containerWidthValue);
        break;
      case "vmin":
        if (toUnit === "px" && containerWidthValue !== null)
          convertedValue = vminToPx(
            value,
            containerWidthValue,
            containerWidthValue
          );
        break;
      case "vmax":
        if (toUnit === "px" && containerWidthValue !== null)
          convertedValue = vmaxToPx(
            value,
            containerWidthValue,
            containerWidthValue
          );
        break;
      default:
        convertedValue = "Invalid conversion";
    }

    if (typeof convertedValue === "number") {
      convertedValue = convertedValue.toFixed(3);
    }
    setOutput(convertedValue.toString());
  };

  const needsContainerInput =
    ["vw", "vh", "vmin", "vmax"].includes(fromUnit) ||
    ["vw", "vh", "vmin", "vmax"].includes(toUnit);

  return (
    <main>
      <Meta
        title="CSS units converter by Jam.dev | Free, Open Source & Ad-free"
        description="Convert your css units values to other options"
      />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSS Units Converter"
          description="Convert your css units values to other options"
        />
      </section>
      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Input Value</Label>
            <Textarea
              className="mb-6"
              rows={3}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
            />
            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label>From Unit</Label>
                <Combobox
                  data={unitOptions}
                  onSelect={(value) => setFromUnit(value)}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Label>To Unit</Label>
                <Combobox
                  data={unitOptions}
                  onSelect={(value) => setToUnit(value)}
                />
              </div>
            </div>
            {needsContainerInput && (
              <div className="mb-6">
                <Label>Container Width (px)</Label>
                <Textarea
                  className="mb-6"
                  rows={1}
                  value={cssInput}
                  onChange={(e) => setCssInput(e.target.value)}
                />
              </div>
            )}

            <Label>Result</Label>
            <Textarea value={output} rows={3} readOnly className="mb-4" />

            <Button variant="outline" onClick={convertUnits}>
              Convert
            </Button>

            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}

const unitOptions = [
  { value: "px", label: "Pixels (px)" },
  { value: "rem", label: "Rems (rem)" },
  { value: "em", label: "Ems (em)" },
  { value: "vw", label: "Viewport Width (vw)" },
  { value: "vh", label: "Viewport Height (vh)" },
  { value: "vmin", label: "Viewport Min (vmin)" },
  { value: "vmax", label: "Viewport Max (vmax)" },
];


// TODO create a func mapper - ref useState names - create test file