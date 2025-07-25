import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import {
  convertToHex,
  convertToRGB,
  isRGBValueValid,
  isValidHex,
  RGBValues,
  toAndroidColor,
  toCss,
  toIOS,
} from "@/components/utils/hex-to-rgb.utils";
import { Input } from "@/components/ds/InputComponent";
import CodeSnippetRow from "@/components/CodeSnippetRow";
import HexToRgbSEO from "@/components/seo/HexToRgbSEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { cn } from "@/lib/utils";
import RgbToHexSEO from "@/components/seo/RgbToHexSEO";
import { DividerComponent } from "../../components/ds/DividerComponent";

const DEFAULT_RGB: RGBValues = { r: "0", g: "0", b: "0" };

interface HEXtoRGBProps {
  title: string;
  invertOrder: boolean;
}

export default function HEXtoRGB(props: HEXtoRGBProps) {
  const [hex, setHex] = useState("");
  const [rgb, setRgb] = useState<RGBValues>(DEFAULT_RGB);
  const pageTitle = props.invertOrder
    ? "RGB to HEX Converter"
    : "HEX to RGB Converter";

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
    const value = event.currentTarget.value;

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
      <Meta
        title={
          props.title ??
          "HEX to RGB converter | CSS Color Converter | Free & Open Source"
        }
        description="Easily convert HEX to RGB and RGB to HEX with Jam's free color converter tool. Perfect for quick color code conversions—just paste the value and copy the resulting code."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title={pageTitle}
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <div
              className={cn("flex flex-col", {
                "flex-col-reverse": props.invertOrder,
              })}
            >
              <div>
                <Label>HEX Value</Label>
                <div className={cn("flex items-center")}>
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
              </div>

              <DividerComponent margin="large" />

              <div className="grid grid-cols-3 gap-4">
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
            </div>

            <DividerComponent margin="large" />

            <CodeSnippetRow
              label="CSS"
              rgb={rgb}
              convertFunction={(rgb) => toCss(rgb)}
            />
            <CodeSnippetRow
              label="Obj C"
              rgb={rgb}
              convertFunction={(rgb) => toIOS(rgb, "c")}
            />
            <CodeSnippetRow
              label="Swift"
              rgb={rgb}
              convertFunction={(rgb) => toIOS(rgb, "swift")}
            />
            <CodeSnippetRow
              label="Android"
              rgb={rgb}
              convertFunction={(rgb) => toAndroidColor(rgb)}
            />
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        {props.invertOrder ? <RgbToHexSEO /> : <HexToRgbSEO />}
      </section>
    </main>
  );
}
