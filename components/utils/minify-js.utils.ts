import { minify } from "terser";

export async function minifyJS(jsCode: string): Promise<string> {
  try {
    const result = await minify(jsCode, { mangle: false });
    if (!result.code) {
      throw new Error("Minification produced no output.");
    }
    return result.code;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to minify JS: ${error.message}`);
    } else {
      throw new Error("Failed to minify JS: Unknown error");
    }
  }
}
