import { convertJSONtoCSV } from "./json-to-csv.utils";

describe("json-to-csv.utils", () => {
  // Helper function to normalize line endings
  const normalizeCSV = (csv: string) => csv.replace(/\r\n/g, "\n").trim();

  it("should convert a JSON string to CSV", () => {
    const jsonString = '[{"name":"John","age":30},{"name":"Jane","age":25}]';
    const expectedCSV = "name,age\nJohn,30\nJane,25";

    expect(normalizeCSV(convertJSONtoCSV(jsonString))).toBe(
      normalizeCSV(expectedCSV)
    );
  });

  it("should convert a JSON object to CSV", () => {
    const jsonObject = { name: "John", age: 30 };
    const expectedCSV = "name,age\nJohn,30";

    expect(normalizeCSV(convertJSONtoCSV(jsonObject))).toBe(
      normalizeCSV(expectedCSV)
    );
  });

  it("should convert an array of JSON objects to CSV", () => {
    const jsonArray = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
    ];
    const expectedCSV = "name,age\nJohn,30\nJane,25";

    expect(normalizeCSV(convertJSONtoCSV(jsonArray))).toBe(
      normalizeCSV(expectedCSV)
    );
  });

  it("should throw an error for invalid input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => convertJSONtoCSV(123 as any)).toThrow(
      "Input must be a JSON string or an object."
    );
  });
});
