import { formatOutput } from "./timestamp-to-date.utils";

describe("timestamp-to-date.utils", () => {
  test("should format milliseconds timestamp correctly", () => {
    const timestamp = "1234567890123";
    const result = formatOutput(timestamp);

    expect(result).toContain("Format detected: milliseconds");
    expect(result).toContain("Fri, Feb 13, 2009, 23:31:30 UTC");
  });

  test("should format seconds timestamp correctly", () => {
    const timestamp = "123456789";
    const result = formatOutput(timestamp);

    expect(result).toContain("Format detected: seconds");
    expect(result).toContain("Thu, Nov 29, 1973, 21:33:09 UTC");
  });

  test("should throw error for invalid timestamp format", () => {
    const timestamp = "invalid-timestamp";

    expect(() => formatOutput(timestamp)).toThrow("Invalid timestamp format");
  });

  test("should throw error for invalid date", () => {
    const timestamp = "999999999999999999999";

    expect(() => formatOutput(timestamp)).toThrow("Invalid timestamp format");
  });
});
