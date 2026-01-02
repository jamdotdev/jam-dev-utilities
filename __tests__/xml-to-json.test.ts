/**
 * @jest-environment jsdom
 */
import { xmlToJson } from "../lib/xmlToJson";

describe("XML to JSON Converter", () => {
  describe("Basic conversion", () => {
    it("should convert simple XML to JSON", () => {
      const xml = "<root><name>test</name></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { name: "test" } });
    });

    it("should handle nested elements", () => {
      const xml = "<root><parent><child>value</child></parent></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { parent: { child: "value" } },
      });
    });

    it("should handle empty elements", () => {
      const xml = "<root><empty></empty></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { empty: null } });
    });
  });

  describe("Attribute handling", () => {
    it("should convert XML attributes to @attributes object", () => {
      const xml = '<root id="123"><name>test</name></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "@attributes": { id: "123" }, name: "test" },
      });
    });

    it("should handle multiple attributes", () => {
      const xml = '<root id="123" class="main" data-test="true"></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: {
          "@attributes": { id: "123", class: "main", "data-test": "true" },
        },
      });
    });

    it("should handle element with only attributes", () => {
      const xml = '<root id="123"></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "@attributes": { id: "123" } },
      });
    });
  });

  describe("Array handling", () => {
    it("should convert multiple same-named elements to array", () => {
      const xml = "<root><item>1</item><item>2</item><item>3</item></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { item: ["1", "2", "3"] } });
    });

    it("should handle mixed elements with arrays", () => {
      const xml = "<root><name>test</name><item>1</item><item>2</item></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { name: "test", item: ["1", "2"] },
      });
    });
  });

  describe("Text content handling", () => {
    it("should handle text content with attributes", () => {
      const xml = '<root id="1">text content</root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "@attributes": { id: "1" }, "#text": "text content" },
      });
    });

    it("should trim whitespace from text content", () => {
      const xml = "<root><name>  test  </name></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { name: "test" } });
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid XML", () => {
      const xml = "<root><unclosed>";
      expect(() => xmlToJson(xml)).toThrow("Invalid XML");
    });

    it("should throw error for malformed XML", () => {
      const xml = "not xml at all";
      expect(() => xmlToJson(xml)).toThrow("Invalid XML");
    });
  });

  describe("Complex XML structures", () => {
    it("should handle deeply nested structures", () => {
      const xml =
        "<root><level1><level2><level3>deep</level3></level2></level1></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { level1: { level2: { level3: "deep" } } },
      });
    });

    it("should handle real-world XML example", () => {
      const xml = `
                <users>
                    <user id="1">
                        <name>John</name>
                        <email>john@example.com</email>
                    </user>
                    <user id="2">
                        <name>Jane</name>
                        <email>jane@example.com</email>
                    </user>
                </users>
            `;
      const result = xmlToJson(xml);
      expect(result).toEqual({
        users: {
          user: [
            {
              "@attributes": { id: "1" },
              name: "John",
              email: "john@example.com",
            },
            {
              "@attributes": { id: "2" },
              name: "Jane",
              email: "jane@example.com",
            },
          ],
        },
      });
    });
  });
});
