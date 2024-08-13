import Papa from "papaparse";

export function convertJSONtoCSV(input: string | object): string {
  try {
    let data: object[] = [];

    if (typeof input === "string") {
      data = JSON.parse(input);
    } else if (Array.isArray(input)) {
      data = input;
    } else if (typeof input === "object") {
      data = [input];
    } else {
      throw new Error("Input must be a JSON string or an object.");
    }

    const csv = Papa.unparse(data, { header: true });

    return csv;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to convert JSON to CSV: Unknown error");
    }
  }
}
