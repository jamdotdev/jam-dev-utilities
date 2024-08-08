import { convertQueryParamsToJSON } from "./query-params-to-json.utils";

describe("query-params-to-json.utils", () => {
  it("should convert query parameters to JSON", () => {
    const input = "https://example.com?name=John&age=30&city=New%20York";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "New York",
        name: "John",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle query parameters without a URL scheme", () => {
    const input = "?name=John&age=30&city=New%20York";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "New York",
        name: "John",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle query parameters without a leading question mark", () => {
    const input = "name=John&age=30&city=New%20York";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "New York",
        name: "John",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle multiple values for the same key", () => {
    const input = "https://example.com?name=John&name=Jane&age=30";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        name: ["John", "Jane"],
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle empty query parameters", () => {
    const input = "https://example.com";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify({}, null, 2);

    expect(result).toBe(expected);
  });

  it("should handle query parameters with special characters", () => {
    const input = "https://example.com?name=John%20Doe&city=New%20York&age=30";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "New York",
        name: "John Doe",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle array values", () => {
    const input = "https://example.com?name=John&name=Jane&name=Jack";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        name: ["John", "Jane", "Jack"],
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle boolean and numeric values", () => {
    const input = "https://example.com?isAdmin=true&age=30&height=5.9";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        height: "5.9",
        isAdmin: "true",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle empty keys and values", () => {
    const input = "https://example.com?name=&age=30&city=";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "",
        name: "",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should handle malformed query strings", () => {
    const input = "https://example.com?name=John&age=30&city";
    const result = convertQueryParamsToJSON(input);
    const expected = JSON.stringify(
      {
        age: "30",
        city: "",
        name: "John",
      },
      null,
      2
    );

    expect(result).toBe(expected);
  });
});
