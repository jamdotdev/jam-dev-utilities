import Papa from "papaparse";

export function convertJSONtoTSV(input: string | object): string {
  try {
    let data: object[] = [];

    if (typeof input === "string") {
      const parsed = JSON.parse(input);
      data = Array.isArray(parsed) ? parsed : [parsed];
    } else if (Array.isArray(input)) {
      data = input;
    } else if (typeof input === "object") {
      data = [input];
    } else {
      throw new Error("Input must be a JSON string or an object.");
    }

    const config = {
      header: true,
      delimiter: "\t",
      newline: "\r\n",
      quoteChar: '"',
      escapeChar: '"',
      skipEmptyLines: true,
    };

    const tsv = Papa.unparse(data, config);
    return tsv;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to convert JSON to TSV: Unknown error");
    }
  }
}
