import { formatOutput } from "./timestamp-to-date.utils";

describe("timestamp-to-date.utils", () => {
  // Test timestamp to date conversion
  test("should format milliseconds timestamp correctly", () => {
    const timestamp = "1234567890123";
    const result = formatOutput(timestamp);

    expect(result).toContain("Input detected: Unix timestamp (milliseconds)");
    expect(result).toContain("Fri, Feb 13, 2009, 23:31:30 UTC");
    expect(result).toContain("ISO 8601:");
    expect(result).toContain("2009-02-13T23:31:30.123Z");
  });

  test("should format seconds timestamp correctly", () => {
    const timestamp = "123456789";
    const result = formatOutput(timestamp);

    expect(result).toContain("Input detected: Unix timestamp (seconds)");
    expect(result).toContain("Thu, Nov 29, 1973, 21:33:09 UTC");
    expect(result).toContain("ISO 8601:");
  });

  // Test date string to timestamp conversion
  test("should convert ISO date string to timestamp", () => {
    const isoDate = "2009-02-13T23:31:30.123Z";
    const result = formatOutput(isoDate);

    expect(result).toContain("Input detected: Date string");
    expect(result).toContain("Unix timestamp (seconds):");
    expect(result).toContain("1234567890");
    expect(result).toContain("Unix timestamp (ms):");
    expect(result).toContain("1234567890123");
    expect(result).toContain("Fri, Feb 13, 2009, 23:31:30 UTC");
  });

  test("should convert human readable date string to timestamp", () => {
    const dateString = "February 13, 2009 23:31:30 GMT";
    const result = formatOutput(dateString);

    expect(result).toContain("Input detected: Date string");
    expect(result).toContain("Unix timestamp (seconds):");
    expect(result).toContain("Unix timestamp (ms):");
    expect(result).toContain("Greenwich Mean Time:");
  });

  test("should convert date with timezone to timestamp", () => {
    const dateString = "2009-02-13T23:31:30.000Z";
    const result = formatOutput(dateString);

    expect(result).toContain("Input detected: Date string");
    expect(result).toContain("Unix timestamp (seconds):");
    expect(result).toContain("1234567890");
  });

  // Error handling tests
  test("should throw error for invalid input", () => {
    const invalidInput = "invalid-input-123abc";

    expect(() => formatOutput(invalidInput)).toThrow(
      "Invalid input format. Please enter a Unix timestamp (seconds/milliseconds) or ISO date string."
    );
  });

  test("should throw error for invalid date string", () => {
    const invalidDate = "not-a-valid-date-string-at-all"; // Invalid date
    
    expect(() => formatOutput(invalidDate)).toThrow("Invalid input format. Please enter a Unix timestamp (seconds/milliseconds) or ISO date string.");
  });

  test("should throw error for date that creates invalid Date object", () => {
    // Create a string that looks like a date but creates invalid Date
    const invalidDateStr = "abc-def-ghij"; 
    
    expect(() => formatOutput(invalidDateStr)).toThrow("Invalid input format. Please enter a Unix timestamp (seconds/milliseconds) or ISO date string.");
  });

  test("should throw error for extremely large timestamp", () => {
    const timestamp = "999999999999999999999";

    expect(() => formatOutput(timestamp)).toThrow(
      "Invalid input format. Please enter a Unix timestamp (seconds/milliseconds) or ISO date string."
    );
  });

  // Edge cases
  test("should handle timestamp at epoch start", () => {
    const timestamp = "0";
    const result = formatOutput(timestamp);

    expect(result).toContain("Input detected: Unix timestamp (seconds)");
    expect(result).toContain("Thu, Jan 1, 1970, 00:00:00 UTC");
    expect(result).toContain("1970-01-01T00:00:00.000Z");
  });

  test("should handle current time range timestamps", () => {
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    const result = formatOutput(currentTimestamp);

    expect(result).toContain("Input detected: Unix timestamp (seconds)");
    expect(result).toContain("Greenwich Mean Time:");
    expect(result).toContain("Your time zone:");
    expect(result).toContain("ISO 8601:");
  });
});
