export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  ratio: number;
  aa: {
    normal: boolean;
    large: boolean;
    graphicalObjects: boolean;
  };
  aaa: {
    normal: boolean;
    large: boolean;
  };
}

export const WCAG = {
  AA: {
    NORMAL_THRESHOLD: 4.5,
    LARGE_THRESHOLD: 3,
    GRAPHICAL_OBJECTS_THRESHOLD: 3,
  },
  AAA: {
    NORMAL_THRESHOLD: 7,
    LARGE_THRESHOLD: 4.5,
  },
} as const;

// WCAG 2.1 constants - Reference: https://www.w3.org/WAI/GL/wiki/Relative_luminance
// Note: WCAG 2.x uses 0.03928, while the correct IEC standard uses 0.04045.
// For 8-bit color values, the difference is not significant. We use 0.03928 to match WCAG 2.x specification.
const SRGB_GAMMA_THRESHOLD = 0.03928 as const;
const SRGB_LOW_VALUE_DIVISOR = 12.92 as const;
const SRGB_GAMMA_OFFSET = 0.055 as const;
const SRGB_GAMMA_DIVISOR = 1.055 as const;
const SRGB_GAMMA_EXPONENT = 2.4 as const;

const LUMINANCE_R_COEFFICIENT = 0.2126 as const;
const LUMINANCE_G_COEFFICIENT = 0.7152 as const;
const LUMINANCE_B_COEFFICIENT = 0.0722 as const;

const CONTRAST_RATIO_CONSTANT = 0.05 as const;

const HEX_COLOR_PATTERN: RegExp = /^[0-9A-Fa-f]{6}$/;
const INVALID_HEX_CHARS: RegExp = /[^#0-9A-F]/gi;

export const hexToRgb = (hex: string): RGB | null => {
  const normalizedHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (!HEX_COLOR_PATTERN.test(normalizedHex)) {
    return null;
  }

  const r = parseInt(normalizedHex.substring(0, 2), 16);
  const g = parseInt(normalizedHex.substring(2, 4), 16);
  const b = parseInt(normalizedHex.substring(4, 6), 16);

  return { r, g, b };
};

export const isValidHex = (hex: string): boolean => {
  const normalizedHex = hex.startsWith("#") ? hex.slice(1) : hex;
  return HEX_COLOR_PATTERN.test(normalizedHex);
};

/**
 * Calculates the relative luminance of a color according to WCAG 2.1
 * Reference: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export const getRelativeLuminance = (rgb: RGB): number => {
  const normalize = (value: number): number => {
    const val = value / 255;
    return val <= SRGB_GAMMA_THRESHOLD
      ? val / SRGB_LOW_VALUE_DIVISOR
      : Math.pow(
          (val + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_DIVISOR,
          SRGB_GAMMA_EXPONENT
        );
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  return (
    LUMINANCE_R_COEFFICIENT * r +
    LUMINANCE_G_COEFFICIENT * g +
    LUMINANCE_B_COEFFICIENT * b
  );
};

/**
 * Calculates the contrast ratio between two colors according to WCAG 2.1
 * Reference: https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export const getContrastRatio = ({
  color1,
  color2,
}: {
  color1: RGB;
  color2: RGB;
}): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (
    (lighter + CONTRAST_RATIO_CONSTANT) / (darker + CONTRAST_RATIO_CONSTANT)
  );
};

export const checkWCAGCompliance = (ratio: number): ContrastResult => {
  return {
    ratio,
    aa: {
      normal: ratio >= WCAG.AA.NORMAL_THRESHOLD,
      large: ratio >= WCAG.AA.LARGE_THRESHOLD,
      graphicalObjects: ratio >= WCAG.AA.GRAPHICAL_OBJECTS_THRESHOLD,
    },
    aaa: {
      normal: ratio >= WCAG.AAA.NORMAL_THRESHOLD,
      large: ratio >= WCAG.AAA.LARGE_THRESHOLD,
    },
  };
};

export const calculateContrast = ({
  foregroundHex,
  backgroundHex,
}: {
  foregroundHex: string;
  backgroundHex: string;
}): ContrastResult | null => {
  const fgRgb = hexToRgb(foregroundHex);
  const bgRgb = hexToRgb(backgroundHex);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const ratio = getContrastRatio({ color1: fgRgb, color2: bgRgb });
  return checkWCAGCompliance(ratio);
};

export const normalizeHexInput = (value: string): string => {
  let normalized = value.trim().toUpperCase();

  if (normalized && !normalized.startsWith("#")) {
    normalized = "#" + normalized;
  }

  normalized = normalized.replace(INVALID_HEX_CHARS, "");
  if (normalized.length > 7) {
    normalized = normalized.slice(0, 7);
  }

  return normalized;
};

export const validateAndLimitFontSize = (value: string): string | undefined => {
  if (!value) return "";

  const numValue = parseFloat(value);
  const rules: Array<{ condition: boolean; result: string | undefined }> = [
    { condition: isNaN(numValue), result: undefined },
    { condition: numValue > 90, result: "90" },
    { condition: numValue >= 1, result: value },
  ];

  const matchedRule = rules.find((rule) => rule.condition);
  return matchedRule?.result ?? undefined;
};

interface ContrastDescriptionRule {
  condition: boolean;
  result: string;
}

export const getContrastDescription = (ratio: number): string => {
  const rules: ContrastDescriptionRule[] = [
    {
      condition: ratio >= WCAG.AAA.NORMAL_THRESHOLD,
      result: "Excellent contrast",
    },
    { condition: ratio >= WCAG.AA.NORMAL_THRESHOLD, result: "Good contrast" },
    {
      condition: ratio >= WCAG.AA.LARGE_THRESHOLD,
      result: "Minimum contrast for large text",
    },
  ];

  const matchedRule = rules.find((rule) => rule.condition);
  return matchedRule?.result ?? "Insufficient contrast";
};
