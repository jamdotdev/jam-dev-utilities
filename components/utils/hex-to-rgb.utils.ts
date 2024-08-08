export interface RGBValues {
  r: string;
  g: string;
  b: string;
}

export const isValidHex = (hex: string) => {
  const pattern = /^#?[a-fA-F0-9]{6}$/;

  return pattern.test(hex);
};

export const isRGBValueValid = (value: number) => {
  return !isNaN(value) && value >= 0 && value <= 255;
};

export const convertToRGB = (hex: string): RGBValues => {
  const normalizedHex = hex.startsWith("#") ? hex.slice(1) : hex;

  const r = parseInt(normalizedHex.substring(0, 2), 16).toString();
  const g = parseInt(normalizedHex.substring(2, 4), 16).toString();
  const b = parseInt(normalizedHex.substring(4, 6), 16).toString();

  return { r, g, b };
};

export const convertToHex = (r: string, g: string, b: string) => {
  return `#${[r, g, b]
    .map((value) => {
      const intValue = parseInt(value);
      if (isNaN(intValue)) {
        return "00";
      }

      return intValue.toString(16).padStart(2, "0");
    })
    .join("")}`;
};

export const toCss = (rgb: RGBValues) => {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
};

const valueToFixed = (value: string) => (parseInt(value) / 255).toFixed(2);

export const toIOS = (rgb: RGBValues, lang: "swift" | "c"): string => {
  const red = valueToFixed(rgb.r);
  const green = valueToFixed(rgb.g);
  const blue = valueToFixed(rgb.b);

  if (lang === "swift") {
    return `UIColor(red: ${red}, green: ${green}, blue: ${blue}, alpha: 1.00)`;
  }

  return `[UIColor colorWithRed: ${red} green: ${green} blue: ${blue} alpha: 1.0]`;
};

export const toAndroidColor = (rgb: RGBValues) => {
  return `Color.rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};
