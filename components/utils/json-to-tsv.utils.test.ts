import { convertJSONtoTSV } from "./json-to-tsv.utils";

describe("json-to-tsv.utils", () => {
  // Helper function to normalize line endings
  const normalizeTSV = (tsv: string) => tsv.replace(/\r\n/g, "\n").trim();

  it("should convert a JSON string to TSV", () => {
    const jsonString = '[{"name":"John","age":30},{"name":"Jane","age":25}]';
    const expectedTSV = "name\tage\nJohn\t30\nJane\t25";

    expect(normalizeTSV(convertJSONtoTSV(jsonString))).toBe(
      normalizeTSV(expectedTSV)
    );
  });

  it("should convert a JSON object to TSV", () => {
    const jsonObject = { name: "John", age: 30 };
    const expectedTSV = "name\tage\nJohn\t30";

    expect(normalizeTSV(convertJSONtoTSV(jsonObject))).toBe(
      normalizeTSV(expectedTSV)
    );
  });

  it("should convert an array of JSON objects to TSV", () => {
    const jsonArray = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
    ];
    const expectedTSV = "name\tage\nJohn\t30\nJane\t25";

    expect(normalizeTSV(convertJSONtoTSV(jsonArray))).toBe(
      normalizeTSV(expectedTSV)
    );
  });

  it("should convert a single JSON object string to TSV", () => {
    const jsonString = '{"name":"John","age":30}';
    const expectedTSV = "name\tage\nJohn\t30";

    expect(normalizeTSV(convertJSONtoTSV(jsonString))).toBe(
      normalizeTSV(expectedTSV)
    );
  });

  it("should handle empty input", () => {
    expect(normalizeTSV(convertJSONtoTSV([]))).toBe("");
    expect(normalizeTSV(convertJSONtoTSV({}))).toBe("");
    expect(normalizeTSV(convertJSONtoTSV("[]"))).toBe("");
    expect(normalizeTSV(convertJSONtoTSV("{}"))).toBe("");
  });

  it("should handle arrays within objects", () => {
    const jsonArray = [
      { name: "John", hobbies: ["reading", "swimming"] },
      { name: "Jane", hobbies: ["painting"] },
    ];
    const expectedTSV = "name\thobbies\nJohn\treading,swimming\nJane\tpainting";

    expect(normalizeTSV(convertJSONtoTSV(jsonArray))).toBe(
      normalizeTSV(expectedTSV)
    );
  });

  it("should throw an error for invalid input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => convertJSONtoTSV(123 as any)).toThrow(
      "Input must be a JSON string or an object."
    );
  });
});
