import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import {
  convertToHex,
  convertToRGB,
  convertToHSL,
  convertToCMYK,
  isRGBValueValid,
  isValidHex,
  RGBValues,
  HSLValues,
  CMYKValues,
  toAndroidColor,
  toCss,
  toIOS,
  convertCMYKtoRGB,
} from "@/components/utils/color-converter.utils";
import { Input } from "@/components/ds/InputComponent";
import CodeSnippetRow from "@/components/CodeSnippetRow";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import ColorConverterSEO from "@/components/seo/ColorConverterSEO";

const DEFAULT_RGB: RGBValues = { r: "0", g: "0", b: "0" };
const DEFAULT_HSL: HSLValues = { h: "0", s: "0", l: "0" };
const DEFAULT_CMYK: CMYKValues = { c: "0", m: "0", y: "0", k: "100" };

export default function ColorConverter() {
  const [hex, setHex] = useState("#000000");
  const [rgb, setRgb] = useState<RGBValues>(DEFAULT_RGB);
  const [hsl, setHsl] = useState<HSLValues>(DEFAULT_HSL);
  const [cmyk, setCmyk] = useState<CMYKValues>(DEFAULT_CMYK);

  const colorPickerRef = useRef<HTMLInputElement>(null);

  const handleColorPickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = event.target.value;
    updateAllFormats(newHex);
  };

  const openColorPicker = () => {
    colorPickerRef.current?.click();
  };

  const updateAllFormats = (newHex: string) => {
    setHex(newHex);
    const newRgb = convertToRGB(newHex);
    setRgb(newRgb);
    setHsl(convertToHSL(newRgb));
    setCmyk(convertToCMYK(newRgb));
  };

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const invalidHexChars = /[^#0-9A-F]/gi;
    let value = event.target.value.trim().toUpperCase();

    if (value && !value.startsWith("#")) {
      value = "#" + value;
    }

    value = value.replace(invalidHexChars, "");
    if (value === "") {
      setRgb(DEFAULT_RGB);
      setHsl(DEFAULT_HSL);
      setCmyk(DEFAULT_CMYK);
    }

    setHex(value);

    if (isValidHex(value)) {
      updateAllFormats(value);
    }
  };

  const handleRGBChange = (
    key: keyof RGBValues,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    const value = event.currentTarget.value;

    if (value === "" || isRGBValueValid(parseInt(value))) {
      setRgb((rgb: RGBValues) => {
        const newRgb = { ...rgb, [key]: value };
        const newHex = convertToHex(newRgb.r, newRgb.g, newRgb.b);
        updateAllFormats(newHex);
        return newRgb;
      });
    }
  };

  const handleHSLChange = (
    key: keyof HSLValues,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    const value = event.currentTarget.value;
    setHsl((hsl: HSLValues) => {
      const newHsl = { ...hsl, [key]: value };
      const newRgb = convertToRGB(convertToHex(newHsl.h, newHsl.s, newHsl.l));
      const newHex = convertToHex(newRgb.r, newRgb.g, newRgb.b);
      updateAllFormats(newHex);
      return newHsl;
    });
  };

  const handleCMYKChange = (
    key: keyof CMYKValues,
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    const value = event.currentTarget.value;
    setCmyk((cmyk: CMYKValues) => {
      const newCmyk = { ...cmyk, [key]: value };
      const newRgb = convertCMYKtoRGB(newCmyk);
      const newHex = convertToHex(newRgb.r, newRgb.g, newRgb.b);
      updateAllFormats(newHex);
      return newCmyk;
    });
  };

  return (
    <main>
      <Meta
        title="Color Converter by Jam.dev | HEX, RGB, HSL, CMYK | Free & Open Source"
        description="Easily convert between HEX, RGB, HSL, and CMYK color formats with Jam's free color converter tool. Perfect for quick color code conversions—just paste the value and copy the resulting codes."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Color Converter"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
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
                className="w-8 h-8 border rounded-full block flex-none cursor-pointer"
                style={{
                  backgroundColor: isValidHex(hex) ? hex : "#000000",
                }}
                onClick={openColorPicker}
              ></div>
              <input
                ref={colorPickerRef}
                type="color"
                value={hex}
                onChange={handleColorPickerChange}
                className="hidden"
              />
            </div>
            <Divider />

            <div className="grid grid-cols-3 gap-4 mb-6">
              {(["r", "g", "b"] as (keyof RGBValues)[]).map((colorKey) => {
                const colorNameMap: { [key in keyof RGBValues]: string } = {
                  r: "Red",
                  g: "Green",
                  b: "Blue",
                };

                return (
                  <div key={colorKey}>
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              {(["h", "s", "l"] as (keyof HSLValues)[]).map((key) => (
                <div key={key}>
                  <Label className="min-w-12 block mr-1">
                    {key.toUpperCase()}
                  </Label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    value={hsl[key]}
                    onChange={(event) => handleHSLChange(key, event)}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder="0"
                    min={key === "h" ? "0" : "0"}
                    max={key === "h" ? "360" : "100"}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {(["c", "m", "y", "k"] as (keyof CMYKValues)[]).map((key) => (
                <div key={key}>
                  <Label className="min-w-12 block mr-1">
                    {key.toUpperCase()}
                  </Label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    value={cmyk[key]}
                    onChange={(event) => handleCMYKChange(key, event)}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>

            <Divider />

            <CodeSnippetRow<RGBValues>
              label="CSS"
              value={rgb}
              convertFunction={(value) => toCss(value)}
            />
            <CodeSnippetRow<RGBValues>
              label="Obj C"
              value={rgb}
              convertFunction={(value) => toIOS(value, "c")}
            />
            <CodeSnippetRow<RGBValues>
              label="Swift"
              value={rgb}
              convertFunction={(value) => toIOS(value, "swift")}
            />
            <CodeSnippetRow<RGBValues>
              label="Android"
              value={rgb}
              convertFunction={(value) => toAndroidColor(value)}
            />
            <CodeSnippetRow<HSLValues>
              label="HSL"
              value={hsl}
              convertFunction={(value) => `hsl(${value.h}, ${value.s}%, ${value.l}%)`}
            />
            <CodeSnippetRow<CMYKValues>
              label="CMYK"
              value={cmyk}
              convertFunction={(value) => `cmyk(${value.c}%, ${value.m}%, ${value.y}%, ${value.k}%)`}
            />
          </div>
        </Card>
      </section>

      <CallToActionGrid />
      <section className="container max-w-2xl">
        <ColorConverterSEO />
      </section>

    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-muted my-8"></div>;
};