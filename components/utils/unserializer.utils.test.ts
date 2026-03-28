import {
  formatPrintR,
  formatVarDump,
  isValidSerialized,
  unserialize,
} from "./unserializer.utils";

describe("unserializer.utils", () => {
  describe("unserialize", () => {
    test("parses primitive values", () => {
      expect(unserialize('s:5:"hello";')).toEqual({
        type: "string",
        value: "hello",
      });
      expect(unserialize("i:42;")).toEqual({ type: "int", value: 42 });
      expect(unserialize("d:3.14;")).toEqual({ type: "float", value: 3.14 });
      expect(unserialize("b:1;")).toEqual({ type: "bool", value: true });
      expect(unserialize("b:0;")).toEqual({ type: "bool", value: false });
      expect(unserialize("N;")).toEqual({ type: "null" });
    });

    test("parses multi-byte UTF-8 strings", () => {
      expect(unserialize('s:4:"😊";')).toEqual({
        type: "string",
        value: "😊",
      });
    });

    test("parses nested arrays from sample payload", () => {
      const input =
        'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';

      expect(unserialize(input)).toEqual({
        type: "array",
        entries: [
          {
            key: { type: "int", value: 0 },
            value: { type: "string", value: "Sample array" },
          },
          {
            key: { type: "int", value: 1 },
            value: {
              type: "array",
              entries: [
                {
                  key: { type: "int", value: 0 },
                  value: { type: "string", value: "Apple" },
                },
                {
                  key: { type: "int", value: 1 },
                  value: { type: "string", value: "Orange" },
                },
              ],
            },
          },
        ],
      });
    });

    test("resolves references", () => {
      const result = unserialize('a:2:{s:1:"x";s:3:"foo";s:1:"y";R:2;}');
      expect(result).toEqual({
        type: "array",
        entries: [
          {
            key: { type: "string", value: "x" },
            value: { type: "string", value: "foo" },
          },
          {
            key: { type: "string", value: "y" },
            value: { type: "string", value: "foo" },
          },
        ],
      });
    });

    test("throws clear errors for invalid input", () => {
      expect(() => unserialize("")).toThrow(
        "Please enter a serialized string."
      );
      expect(() => unserialize("xyz")).toThrow();
      expect(() => unserialize('a:1:{s:1:"x";R:99;}')).toThrow(
        "Reference index 99 does not exist"
      );
    });
  });

  describe("isValidSerialized", () => {
    test("returns true for valid payloads and false for invalid payloads", () => {
      expect(isValidSerialized('s:5:"hello";')).toBe(true);
      expect(isValidSerialized("i:42;")).toBe(true);
      expect(isValidSerialized("")).toBe(false);
      expect(isValidSerialized("not serialized")).toBe(false);
    });
  });

  describe("formatPrintR", () => {
    test("matches expected output for sample payload", () => {
      const input =
        'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';
      const parsed = unserialize(input);

      const expected = [
        "Array",
        "(",
        "    [0] => Sample array",
        "    [1] => Array",
        "        (",
        "            [0] => Apple",
        "            [1] => Orange",
        "        )",
        "",
        ")",
      ].join("\n");

      expect(formatPrintR(parsed)).toBe(expected);
    });
  });

  describe("formatVarDump", () => {
    test("matches expected output for sample payload", () => {
      const input =
        'a:2:{i:0;s:12:"Sample array";i:1;a:2:{i:0;s:5:"Apple";i:1;s:6:"Orange";}}';
      const parsed = unserialize(input);

      const expected = [
        "array(2) {",
        "  [0]=>",
        '  string(12) "Sample array"',
        "  [1]=>",
        "  array(2) {",
        "    [0]=>",
        '    string(5) "Apple"',
        "    [1]=>",
        '    string(6) "Orange"',
        "  }",
        "}",
      ].join("\n");

      expect(formatVarDump(parsed)).toBe(expected);
    });

    test("uses UTF-8 byte length for strings", () => {
      const parsed = unserialize('s:4:"😊";');
      expect(formatVarDump(parsed)).toBe('string(4) "😊"');
    });
  });
});
