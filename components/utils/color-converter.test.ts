import {
  isValidHex,
  isRGBValueValid,
  convertToRGB,
  convertToHex,
  toCss,
  toIOS,
  toAndroidColor,
  RGBValues,
  convertToHSL,
  convertToCMYK,
  convertCMYKtoRGB,
  CMYKValues,
} from "./color-converter.utils";

describe("color-converter.utils", () => {
  test("isValidHex should validate hex strings correctly", () => {
    expect(isValidHex("#ffffff")).toBe(true);
    expect(isValidHex("ffffff")).toBe(true);
    expect(isValidHex("#fff")).toBe(false);
    expect(isValidHex("zzz")).toBe(false);
    expect(isValidHex("#gggggg")).toBe(false);
  });

  test("isRGBValueValid should validate RGB values correctly", () => {
    expect(isRGBValueValid(255)).toBe(true);
    expect(isRGBValueValid(0)).toBe(true);
    expect(isRGBValueValid(-1)).toBe(false);
    expect(isRGBValueValid(256)).toBe(false);
  });

  test("convertToRGB should convert valid HEX value to RGB", () => {
    expect(convertToRGB("#ffffff")).toEqual({ r: "255", g: "255", b: "255" });
    expect(convertToRGB("#000000")).toEqual({ r: "0", g: "0", b: "0" });
    expect(convertToRGB("#ff5733")).toEqual({ r: "255", g: "87", b: "51" });
  });

  test("convertToHex should convert valid RGB values to HEX correctly", () => {
    expect(convertToHex("255", "255", "255")).toBe("#ffffff");
    expect(convertToHex("0", "0", "0")).toBe("#000000");
  });

  test("toCss should convert RGB values to CSS rgba string", () => {
    const rgb: RGBValues = { r: "255", g: "255", b: "255" };
    expect(toCss(rgb)).toBe("rgba(255, 255, 255, 1)");
  });

  test("toIOS should convert RGB values to iOS UIColor string", () => {
    const rgb: RGBValues = { r: "255", g: "255", b: "255" };
    expect(toIOS(rgb, "swift")).toBe(
      "UIColor(red: 1.00, green: 1.00, blue: 1.00, alpha: 1.00)"
    );
    expect(toIOS(rgb, "c")).toBe(
      "[UIColor colorWithRed: 1.00 green: 1.00 blue: 1.00 alpha: 1.0]"
    );
  });

  test("toAndroidColor should convert RGB values to Android Color string", () => {
    const rgb: RGBValues = { r: "255", g: "255", b: "255" };
    expect(toAndroidColor(rgb)).toBe("Color.rgb(255, 255, 255)");
  });

  test("convertToHSL should convert RGB values to HSL correctly", () => {
    const rgb: RGBValues = { r: "255", g: "0", b: "0" };
    expect(convertToHSL(rgb)).toEqual({ h: "0", s: "100", l: "50" });
  });

  test("convertToCMYK should convert RGB values to CMYK correctly", () => {
    const rgb: RGBValues = { r: "255", g: "0", b: "0" };
    expect(convertToCMYK(rgb)).toEqual({ c: "0", m: "100", y: "100", k: "0" });
  });

  test("convertCMYKtoRGB should convert CMYK values to RGB correctly", () => {
    const cmyk: CMYKValues = { c: "0", m: "100", y: "100", k: "0" };
    expect(convertCMYKtoRGB(cmyk)).toEqual({ r: "255", g: "0", b: "0" });
  });

});
