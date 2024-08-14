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

    const config = {
      header: true, // Include headers in the CSV
      delimiter: ",", // Use comma as delimiter
      newline: "\r\n", // Use carriage return and newline for new lines
      quoteChar: '"', // Use double quotes for quoting fields
      escapeChar: '"', // Use double quotes for escaping quoted fields
      skipEmptyLines: true, // Skip empty lines in the output
    };

    const csv = Papa.unparse(data, config);
    return csv;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to convert JSON to CSV: Unknown error");
    }
  }
}
