import { convertJSONtoXML } from "./json-to-xml.utils";

describe("json-to-xml.utils", () => {
  it("should convert a JSON object to XML", () => {
    const jsonObject = { person: { name: "John", age: 30 } };
    const expectedXML = `<person>\n  <name>John</name>\n  <age>30</age>\n</person>`;

    expect(convertJSONtoXML(jsonObject).trim()).toBe(expectedXML.trim());
  });

  it("should convert a JSON string to XML", () => {
    const jsonString = '{"person": {"name": "John", "age": 30}}';
    const expectedXML = `<person>\n  <name>John</name>\n  <age>30</age>\n</person>`;

    expect(convertJSONtoXML(jsonString).trim()).toBe(expectedXML.trim());
  });

  it("should throw an error for invalid input", () => {
    // Use 'unknown' first, then assert to the expected type to avoid using 'any'
    const invalidInput = 123 as unknown as string | object;

    expect(() => convertJSONtoXML(invalidInput)).toThrow(
      "Input must be a JSON string or an object."
    );
  });

  it("should handle complex nested JSON", () => {
    const jsonObject = {
      library: {
        books: [
          { title: "Book 1", author: "Author 1" },
          { title: "Book 2", author: "Author 2" },
        ],
      },
    };
    const expectedXML = `<library>\n  <books>\n    <title>Book 1</title>\n    <author>Author 1</author>\n  </books>\n  <books>\n    <title>Book 2</title>\n    <author>Author 2</author>\n  </books>\n</library>`;

    expect(convertJSONtoXML(jsonObject).trim()).toBe(expectedXML.trim());
  });
});
