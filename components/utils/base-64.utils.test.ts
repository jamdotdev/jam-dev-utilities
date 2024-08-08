import { toBase64, fromBase64, isPrintableASCII } from "./base-64.utils";

describe("base-64.utils", () => {
  describe("toBase64", () => {
    test("should encode a regular string to Base64", () => {
      expect(toBase64("hello")).toBe("aGVsbG8=");
    });

    test("should encode an empty string to Base64", () => {
      expect(toBase64("")).toBe("");
    });
  });

  describe("fromBase64", () => {
    test("should decode a valid Base64 string", () => {
      expect(fromBase64("aGVsbG8=")).toBe("hello");
    });

    test("should throw an error for an invalid Base64 string", () => {
      expect(() => fromBase64("invalid_base64")).toThrow(
        "Invalid Base64 input"
      );
    });

    test("should throw an error for a Base64 string that decodes to non-printable ASCII characters", () => {
      const nonPrintableBase64 = Buffer.from("\x01\x02\x03").toString("base64");
      expect(() => fromBase64(nonPrintableBase64)).toThrow(
        "Invalid Base64 input"
      );
    });
  });

  describe("isPrintableASCII", () => {
    test("should return true for a string with only printable ASCII characters", () => {
      expect(isPrintableASCII("hello")).toBe(true);
    });

    test("should return false for a string with non-printable ASCII characters", () => {
      expect(isPrintableASCII("hello\x01")).toBe(false);
    });
  });
});
