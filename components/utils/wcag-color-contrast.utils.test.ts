import {
  hexToRgb,
  isValidHex,
  rgbToHex,
  normalizeHexForDisplay,
  normalizeHexInput,
  getRelativeLuminance,
  getContrastRatio,
  checkWCAGCompliance,
  calculateContrast,
  getContrastDescription,
  RGB,
} from "./wcag-color-contrast.utils";

describe("wcag-color-contrast.utils", () => {
  describe("hexToRgb", () => {
    test("should convert valid hex color to RGB", () => {
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb("#767676")).toEqual({ r: 118, g: 118, b: 118 });
    });

    test("should convert 3-digit hex color to RGB (expanded)", () => {
      expect(hexToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#00f")).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
    });

    test("should convert hex without # prefix", () => {
      expect(hexToRgb("000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("fff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    test("should return null for invalid hex colors", () => {
      expect(hexToRgb("#GGGGGG")).toBeNull();
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#12")).toBeNull();
      expect(hexToRgb("#1234567")).toBeNull();
      expect(hexToRgb("#123456789")).toBeNull();
    });

    test("should handle 4 and 5 digit hex colors (treated as 3 during typing)", () => {

      const result4 = hexToRgb("#fff0");
      expect(result4).not.toBeNull();
      expect(result4).toEqual({ r: 255, g: 255, b: 255 });


      const result5 = hexToRgb("#12345");
      expect(result5).not.toBeNull();
    });

    test("should return null for invalid lengths", () => {
      expect(hexToRgb("#12")).toBeNull();
      expect(hexToRgb("#1234567")).toBeNull();
      expect(hexToRgb("#12345678")).toBeNull();
    });
  });

  describe("isValidHex", () => {
    test("should validate correct hex colors", () => {
      expect(isValidHex("#000000")).toBe(true);
      expect(isValidHex("#FFFFFF")).toBe(true);
      expect(isValidHex("#ffffff")).toBe(true);
      expect(isValidHex("#FF5733")).toBe(true);
      expect(isValidHex("000000")).toBe(true);
      expect(isValidHex("FFFFFF")).toBe(true);
    });

    test("should validate 3-digit hex colors", () => {
      expect(isValidHex("#000")).toBe(true);
      expect(isValidHex("#fff")).toBe(true);
      expect(isValidHex("#FFF")).toBe(true);
      expect(isValidHex("#abc")).toBe(true);
      expect(isValidHex("000")).toBe(true);
      expect(isValidHex("fff")).toBe(true);
      expect(isValidHex("ABC")).toBe(true);
    });

    test("should validate 4 and 5 digit hex colors (accepted during typing)", () => {
      expect(isValidHex("#fff0")).toBe(true);
      expect(isValidHex("#12345")).toBe(true);
    });

    test("should reject invalid hex colors", () => {
      expect(isValidHex("#GGGGGG")).toBe(false);
      expect(isValidHex("invalid")).toBe(false);
      expect(isValidHex("#12")).toBe(false);
      expect(isValidHex("#1234567")).toBe(false);
      expect(isValidHex("#123456789")).toBe(false);
      expect(isValidHex("")).toBe(false);
    });
  });

  describe("rgbToHex", () => {
    test("should convert RGB to hex", () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF");
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00FF00");
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000FF");
      expect(rgbToHex({ r: 118, g: 118, b: 118 })).toBe("#767676");
    });

    test("should pad single digit values with zeros", () => {
      expect(rgbToHex({ r: 10, g: 5, b: 1 })).toBe("#0A0501");
      expect(rgbToHex({ r: 0, g: 15, b: 255 })).toBe("#000FFF");
    });

    test("should convert to uppercase", () => {
      expect(rgbToHex({ r: 170, g: 187, b: 204 })).toBe("#AABBCC");
    });
  });

  describe("normalizeHexForDisplay", () => {
    test("should normalize 3-digit hex to 6-digit", () => {
      expect(normalizeHexForDisplay("#000")).toBe("#000000");
      expect(normalizeHexForDisplay("#fff")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("#FFF")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("#abc")).toBe("#AABBCC");
      expect(normalizeHexForDisplay("#f00")).toBe("#FF0000");
    });

    test("should normalize 4 and 5 digit hex to 6-digit (using first 3)", () => {
      expect(normalizeHexForDisplay("#fff0")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("#12345")).toBe("#112233");
    });

    test("should return 6-digit hex as is (uppercase)", () => {
      expect(normalizeHexForDisplay("#000000")).toBe("#000000");
      expect(normalizeHexForDisplay("#ffffff")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("#FFFFFF")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("#FF5733")).toBe("#FF5733");
    });

    test("should work without # prefix", () => {
      expect(normalizeHexForDisplay("000")).toBe("#000000");
      expect(normalizeHexForDisplay("fff")).toBe("#FFFFFF");
      expect(normalizeHexForDisplay("FFFFFF")).toBe("#FFFFFF");
    });

    test("should return null for invalid hex", () => {
      expect(normalizeHexForDisplay("invalid")).toBeNull();
      expect(normalizeHexForDisplay("#GGGGGG")).toBeNull();
      expect(normalizeHexForDisplay("#12")).toBeNull();
      expect(normalizeHexForDisplay("#1234567")).toBeNull();
      expect(normalizeHexForDisplay("")).toBeNull();
    });
  });

  describe("normalizeHexInput", () => {
    test("should add # prefix if missing", () => {
      expect(normalizeHexInput("000000")).toBe("#000000");
      expect(normalizeHexInput("fff")).toBe("#FFF");
      expect(normalizeHexInput("FFFFFF")).toBe("#FFFFFF");
    });

    test("should keep # prefix if present", () => {
      expect(normalizeHexInput("#000000")).toBe("#000000");
      expect(normalizeHexInput("#fff")).toBe("#FFF");
      expect(normalizeHexInput("#FFFFFF")).toBe("#FFFFFF");
    });

    test("should convert to uppercase", () => {
      expect(normalizeHexInput("#ffffff")).toBe("#FFFFFF");
      expect(normalizeHexInput("#abc")).toBe("#ABC");
      expect(normalizeHexInput("abc")).toBe("#ABC");
    });

    test("should remove invalid characters", () => {
      expect(normalizeHexInput("#FF-33")).toBe("#FF33");
      expect(normalizeHexInput("FF 33")).toBe("#FF33");
      expect(normalizeHexInput("#123!@#456")).toBe("#123#45");
    });

    test("should trim whitespace", () => {
      expect(normalizeHexInput("  #fff  ")).toBe("#FFF");
      expect(normalizeHexInput("  fff  ")).toBe("#FFF");
    });

    test("should limit to 7 characters (# + 6 digits)", () => {
      expect(normalizeHexInput("#123456789")).toBe("#123456");
      expect(normalizeHexInput("123456789")).toBe("#123456");
    });

    test("should handle empty string", () => {
      expect(normalizeHexInput("")).toBe("");
      expect(normalizeHexInput("   ")).toBe("");
    });
  });

  describe("getRelativeLuminance", () => {
    test("should calculate luminance for black", () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const luminance = getRelativeLuminance(black);
      expect(luminance).toBeCloseTo(0, 5);
    });

    test("should calculate luminance for white", () => {
      const white: RGB = { r: 255, g: 255, b: 255 };
      const luminance = getRelativeLuminance(white);
      expect(luminance).toBeCloseTo(1, 5);
    });

    test("should calculate luminance for gray", () => {
      const gray: RGB = { r: 128, g: 128, b: 128 };
      const luminance = getRelativeLuminance(gray);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test("should calculate luminance for specific colors", () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const redLuminance = getRelativeLuminance(red);
      expect(redLuminance).toBeGreaterThan(0);
      expect(redLuminance).toBeLessThan(1);

      const green: RGB = { r: 0, g: 255, b: 0 };
      const greenLuminance = getRelativeLuminance(green);
      expect(greenLuminance).toBeGreaterThan(redLuminance);
    });
  });

  describe("getContrastRatio", () => {
    test("should calculate maximum contrast (black on white)", () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const ratio = getContrastRatio({ color1: black, color2: white });
      expect(ratio).toBeCloseTo(21, 1);
    });

    test("should calculate minimum contrast (same colors)", () => {
      const gray: RGB = { r: 128, g: 128, b: 128 };
      const ratio = getContrastRatio({ color1: gray, color2: gray });
      expect(ratio).toBeCloseTo(1, 2);
    });

    test("should calculate contrast for #767676 on #FFFFFF", () => {
      const gray: RGB = { r: 118, g: 118, b: 118 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const ratio = getContrastRatio({ color1: gray, color2: white });
      expect(ratio).toBeCloseTo(4.54, 2);
    });

    test("should be symmetric (order doesn't matter)", () => {
      const color1: RGB = { r: 100, g: 150, b: 200 };
      const color2: RGB = { r: 200, g: 100, b: 150 };
      const ratio1 = getContrastRatio({ color1, color2 });
      const ratio2 = getContrastRatio({ color1: color2, color2: color1 });
      expect(ratio1).toBe(ratio2);
    });
  });

  describe("checkWCAGCompliance", () => {
    test("should pass all levels for high contrast (21:1)", () => {
      const result = checkWCAGCompliance(21);
      expect(result.ratio).toBe(21);
      expect(result.aa.normal).toBe(true);
      expect(result.aa.large).toBe(true);
      expect(result.aa.graphicalObjects).toBe(true);
      expect(result.aaa.normal).toBe(true);
      expect(result.aaa.large).toBe(true);
    });

    test("should pass AA but not AAA normal for 4.5:1", () => {
      const result = checkWCAGCompliance(4.5);
      expect(result.ratio).toBe(4.5);
      expect(result.aa.normal).toBe(true);
      expect(result.aa.large).toBe(true);
      expect(result.aa.graphicalObjects).toBe(true);
      expect(result.aaa.normal).toBe(false);
      expect(result.aaa.large).toBe(true);
    });

    test("should pass only AA large for 3:1", () => {
      const result = checkWCAGCompliance(3);
      expect(result.ratio).toBe(3);
      expect(result.aa.normal).toBe(false);
      expect(result.aa.large).toBe(true);
      expect(result.aa.graphicalObjects).toBe(true);
      expect(result.aaa.normal).toBe(false);
      expect(result.aaa.large).toBe(false);
    });

    test("should fail all levels for low contrast (1.5:1)", () => {
      const result = checkWCAGCompliance(1.5);
      expect(result.ratio).toBe(1.5);
      expect(result.aa.normal).toBe(false);
      expect(result.aa.large).toBe(false);
      expect(result.aa.graphicalObjects).toBe(false);
      expect(result.aaa.normal).toBe(false);
      expect(result.aaa.large).toBe(false);
    });

    test("should pass AAA normal for 7:1", () => {
      const result = checkWCAGCompliance(7);
      expect(result.ratio).toBe(7);
      expect(result.aa.normal).toBe(true);
      expect(result.aa.large).toBe(true);
      expect(result.aa.graphicalObjects).toBe(true);
      expect(result.aaa.normal).toBe(true);
      expect(result.aaa.large).toBe(true);
    });

    test("should pass graphical objects for 3:1", () => {
      const result = checkWCAGCompliance(3);
      expect(result.ratio).toBe(3);
      expect(result.aa.graphicalObjects).toBe(true);
      expect(result.aa.normal).toBe(false);
    });

    test("should fail graphical objects for 2.9:1", () => {
      const result = checkWCAGCompliance(2.9);
      expect(result.ratio).toBe(2.9);
      expect(result.aa.graphicalObjects).toBe(false);
    });
  });

  describe("calculateContrast", () => {
    test("should calculate contrast for black on white", () => {
      const result = calculateContrast({
        foregroundHex: "#000000",
        backgroundHex: "#FFFFFF",
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ratio).toBeCloseTo(21, 1);
        expect(result.aa.normal).toBe(true);
        expect(result.aa.large).toBe(true);
        expect(result.aa.graphicalObjects).toBe(true);
        expect(result.aaa.normal).toBe(true);
        expect(result.aaa.large).toBe(true);
      }
    });

    test("should calculate contrast for #767676 on #FFFFFF", () => {
      const result = calculateContrast({
        foregroundHex: "#767676",
        backgroundHex: "#FFFFFF",
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ratio).toBeCloseTo(4.54, 2);
        expect(result.aa.normal).toBe(true);
        expect(result.aa.large).toBe(true);
        expect(result.aa.graphicalObjects).toBe(true);
        expect(result.aaa.normal).toBe(false);
        expect(result.aaa.large).toBe(true);
      }
    });

    test("should return null for invalid hex colors", () => {
      expect(
        calculateContrast({
          foregroundHex: "invalid",
          backgroundHex: "#FFFFFF",
        })
      ).toBeNull();
      expect(
        calculateContrast({
          foregroundHex: "#000000",
          backgroundHex: "invalid",
        })
      ).toBeNull();
      expect(
        calculateContrast({
          foregroundHex: "#12",
          backgroundHex: "#FFFFFF",
        })
      ).toBeNull();
      expect(
        calculateContrast({
          foregroundHex: "#000000",
          backgroundHex: "#123456789",
        })
      ).toBeNull();
    });

    test("should work with 4 and 5 digit hex colors (treated as 3)", () => {
      const result = calculateContrast({
        foregroundHex: "#fff0",
        backgroundHex: "#12345",
      });
      expect(result).not.toBeNull();
    });

    test("should return null for invalid lengths", () => {
      expect(
        calculateContrast({
          foregroundHex: "#1234567",
          backgroundHex: "#000",
        })
      ).toBeNull();
      expect(
        calculateContrast({
          foregroundHex: "#ffffff00",
          backgroundHex: "#000",
        })
      ).toBeNull();
    });

    test("should work with 3-digit hex colors", () => {
      const result = calculateContrast({
        foregroundHex: "#000",
        backgroundHex: "#fff",
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ratio).toBeCloseTo(21, 1);
      }

      const result2 = calculateContrast({
        foregroundHex: "#f00",
        backgroundHex: "#0f0",
      });
      expect(result2).not.toBeNull();
      if (result2) {
        expect(result2.ratio).toBeGreaterThan(1);
      }
    });

    test("should work with hex colors without # prefix", () => {
      const result = calculateContrast({
        foregroundHex: "000000",
        backgroundHex: "FFFFFF",
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ratio).toBeCloseTo(21, 1);
      }
    });

    test("should calculate contrast for low contrast colors", () => {
      const result = calculateContrast({
        foregroundHex: "#CCCCCC",
        backgroundHex: "#FFFFFF",
      });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.ratio).toBeLessThan(2);
        expect(result.aa.normal).toBe(false);
        expect(result.aa.large).toBe(false);
      }
    });
  });

  describe("getContrastDescription", () => {
    test("should return 'Excellent contrast' for ratio >= 7", () => {
      expect(getContrastDescription(7)).toBe("Excellent contrast");
      expect(getContrastDescription(10)).toBe("Excellent contrast");
      expect(getContrastDescription(21)).toBe("Excellent contrast");
    });

    test("should return 'Good contrast' for ratio >= 4.5 and < 7", () => {
      expect(getContrastDescription(4.5)).toBe("Good contrast");
      expect(getContrastDescription(5)).toBe("Good contrast");
      expect(getContrastDescription(6.9)).toBe("Good contrast");
    });

    test("should return 'Minimum contrast for large text' for ratio >= 3 and < 4.5", () => {
      expect(getContrastDescription(3)).toBe("Minimum contrast for large text");
      expect(getContrastDescription(3.5)).toBe(
        "Minimum contrast for large text"
      );
      expect(getContrastDescription(4.4)).toBe(
        "Minimum contrast for large text"
      );
    });

    test("should return 'Insufficient contrast' for ratio < 3", () => {
      expect(getContrastDescription(2.9)).toBe("Insufficient contrast");
      expect(getContrastDescription(2)).toBe("Insufficient contrast");
      expect(getContrastDescription(1.5)).toBe("Insufficient contrast");
      expect(getContrastDescription(1)).toBe("Insufficient contrast");
    });
  });
});
