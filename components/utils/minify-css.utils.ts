import CleanCSS from "clean-css";

export function minifyCSS(cssCode: string): string {
  try {
    const result = new CleanCSS({}).minify(cssCode);
    if (result.errors.length > 0) {
      throw new Error(result.errors.join(", "));
    }
    return result.styles;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to minify CSS: ${error.message}`);
    } else {
      throw new Error("Failed to minify CSS: Unknown error");
    }
  }
}
