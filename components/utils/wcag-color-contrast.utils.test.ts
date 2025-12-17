import {
  hexToRgb,
  isValidHex,
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

    test("should convert hex without # prefix", () => {
      expect(hexToRgb("000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    });

    test("should return null for invalid hex colors", () => {
      expect(hexToRgb("#GGGGGG")).toBeNull();
      expect(hexToRgb("#FFF")).toBeNull();
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#12345")).toBeNull();
      expect(hexToRgb("#1234567")).toBeNull();
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

    test("should reject invalid hex colors", () => {
      expect(isValidHex("#FFF")).toBe(false);
      expect(isValidHex("#GGGGGG")).toBe(false);
      expect(isValidHex("invalid")).toBe(false);
      expect(isValidHex("#12345")).toBe(false);
      expect(isValidHex("#1234567")).toBe(false);
      expect(isValidHex("")).toBe(false);
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
          foregroundHex: "#FFF",
          backgroundHex: "#FFFFFF",
        })
      ).toBeNull();
      expect(
        calculateContrast({
          foregroundHex: "#000000",
          backgroundHex: "#FFF",
        })
      ).toBeNull();
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
      expect(getContrastDescription(3.5)).toBe("Minimum contrast for large text");
      expect(getContrastDescription(4.4)).toBe("Minimum contrast for large text");
    });

    test("should return 'Insufficient contrast' for ratio < 3", () => {
      expect(getContrastDescription(2.9)).toBe("Insufficient contrast");
      expect(getContrastDescription(2)).toBe("Insufficient contrast");
      expect(getContrastDescription(1.5)).toBe("Insufficient contrast");
      expect(getContrastDescription(1)).toBe("Insufficient contrast");
    });
  });
});

