import { parseJsonLines, toJsonArrayString } from "./jsonl-validator.utils";

describe("jsonl-validator.utils", () => {
  describe("parseJsonLines", () => {
    it("returns an empty result for empty input", () => {
      expect(parseJsonLines("")).toEqual({
        totalLines: 0,
        emptyLines: 0,
        validLines: 0,
        invalidLines: 0,
        records: [],
        errors: [],
        keyFrequency: {},
      });
    });

    it("parses valid JSONL lines and computes key frequency", () => {
      const input = [
        '{"id":1,"level":"info","message":"ok"}',
        '{"id":2,"level":"warn"}',
        '{"id":3,"level":"error","code":"E_TIMEOUT"}',
      ].join("\n");

      const result = parseJsonLines(input);

      expect(result.totalLines).toBe(3);
      expect(result.emptyLines).toBe(0);
      expect(result.validLines).toBe(3);
      expect(result.invalidLines).toBe(0);
      expect(result.records).toHaveLength(3);
      expect(result.keyFrequency).toEqual({
        id: 3,
        level: 3,
        message: 1,
        code: 1,
      });
    });

    it("ignores empty lines and reports invalid lines with line numbers", () => {
      const input = ['{"ok": true}', "", "{", "not-json", '{"ok": false}'].join(
        "\n"
      );

      const result = parseJsonLines(input);

      expect(result.totalLines).toBe(4);
      expect(result.emptyLines).toBe(1);
      expect(result.validLines).toBe(2);
      expect(result.invalidLines).toBe(2);
      expect(result.errors[0].lineNumber).toBe(3);
      expect(result.errors[0].lineContent).toBe("{");
      expect(result.errors[0].columnNumber).toBeGreaterThan(0);
      expect(result.errors[1].lineNumber).toBe(4);
      expect(result.errors[1].lineContent).toBe("not-json");
      expect(result.errors[1].columnNumber).toBeUndefined();
    });

    it("accepts non-object JSON values as valid records", () => {
      const input = ['"text"', "42", "true", "null", "[1,2,3]"].join("\n");

      const result = parseJsonLines(input);

      expect(result.validLines).toBe(5);
      expect(result.invalidLines).toBe(0);
      expect(result.keyFrequency).toEqual({});
    });
  });

  describe("toJsonArrayString", () => {
    it("formats records as pretty-printed JSON array", () => {
      const output = toJsonArrayString([{ id: 1 }, { id: 2 }]);
      expect(output).toBe(
        '[\n  {\n    "id": 1\n  },\n  {\n    "id": 2\n  }\n]'
      );
    });
  });
});
