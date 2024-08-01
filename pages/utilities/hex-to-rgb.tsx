import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ds/CardComponent";
import { Label } from "../../components/ds/LabelComponent";
import Header from "../../components/Header";
import { CMDK } from "../../components/CMDK";
import {
  convertToHex,
  convertToRGB,
  isRGBValueValid,
  isValidHex,
  RGBValues,
} from "../../components/hex-to-rgb-utils";
import { Input } from "../../components/ds/InputComponent";

const DEFAULT_RGB: RGBValues = { r: "0", g: "0", b: "0" };

export default function HEXtoRGB() {
  const [hex, setHex] = useState("");
  const [rgb, setRgb] = useState<RGBValues>(DEFAULT_RGB);

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const invalidHexChars = /[^#0-9A-F]/gi;
    let value = event.target.value.trim().toUpperCase();

    if (value && !value.startsWith("#")) {
      value = "#" + value;
    }

    value = value.replace(invalidHexChars, "");
    if (value === "") {
      setRgb(DEFAULT_RGB);
    }

    setHex(value);

    if (isValidHex(value)) {
      const rgb = convertToRGB(value);
      setRgb(rgb);
    }
  };

  const handleRGBChange = (
    key: keyof RGBValues,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    let value = event.currentTarget.value;

    if (value === "" || isRGBValueValid(parseInt(value))) {
      setRgb((rgb: RGBValues) => {
        // If the input value is an empty string (i.e., the user deleted all characters),
        // convertToHex will update the corresponding hex color component to '00'.
        // This ensures that deleting the value from the input field does not cause errors
        const newRgb = { ...rgb, [key]: value };
        const newHex = convertToHex(newRgb.r, newRgb.g, newRgb.b);
        setHex(newHex);

        return newRgb;
      });
    }
  };

  return (
    <main>
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="HEX to RGB Converter"
          description="Convert HEX to RGB and vice versa."
          logoSrc="/logo.png"
        />
      </section>

      <section className="container max-w-2xl">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>HEX Value</Label>
            <div className="flex items-center mb-6">
              <Input
                placeholder="#000000"
                onChange={handleHexChange}
                className="h-8 text-sm mr-4"
                value={hex}
                maxLength={7}
              />
              <div
                className="w-8 h-8 border rounded-full block flex-none"
                style={{
                  backgroundColor: isValidHex(hex) ? hex : "#000000",
                }}
              ></div>
            </div>
            <Divider />

            <div className="grid grid-cols-3 gap-4">
              {(["r", "g", "b"] as (keyof RGBValues)[]).map((colorKey) => {
                const colorNameMap: { [key in keyof RGBValues]: string } = {
                  r: "Red",
                  g: "Green",
                  b: "Blue",
                };

                return (
                  <div className="mb-4" key={colorKey}>
                    <Label className="min-w-12 block mr-1">
                      {colorNameMap[colorKey]}
                    </Label>
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={rgb[colorKey]}
                      onChange={(event) => handleRGBChange(colorKey, event)}
                      onFocus={(e) => e.currentTarget.select()}
                      placeholder="0"
                      min="0"
                      max="255"
                    />
                  </div>
                );
              })}
            </div>

            <Divider />
          </div>
        </Card>
      </section>
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-muted my-8"></div>;
};
