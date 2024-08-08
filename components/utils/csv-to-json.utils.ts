import Papa from "papaparse";

export function convertCSVtoJSON(csv: string, lowercase: boolean) {
  const parsedData = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      return lowercase ? header.trim().toLowerCase() : header.trim();
    },
    transform: (value) => {
      return value.trim();
    },
  });

  if (parsedData.errors.length > 0) {
    throw new Error(parsedData.errors[0].message);
  }

  return JSON.stringify(parsedData.data, null, 2);
}
