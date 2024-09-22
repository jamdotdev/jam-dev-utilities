import { parseStringPromise } from "xml2js";

export async function convertXMLtoJSON(
  input: string
): Promise<object | string> {
  try {
    const result = await parseStringPromise(input, { explicitArray: false });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert XML to JSON: ${error.message}`);
    } else {
      throw new Error("Failed to convert XML to JSON: Unknown error");
    }
  }
}
