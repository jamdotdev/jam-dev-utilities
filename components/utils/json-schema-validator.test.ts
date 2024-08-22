import { validateJsonSchema } from "./json-schema-validator";

describe("validateJsonSchema", () => {
  test("should validate JSON data against a correct schema", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    });

    const jsonData = JSON.stringify({ name: "John", age: 30 });

    const result = validateJsonSchema(schema, jsonData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("should return errors for invalid JSON data", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    });

    const jsonData = JSON.stringify({ name: "John" }); // Missing age

    const result = validateJsonSchema(schema, jsonData);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("should have required property 'age'"),
      ])
    );
  });

  test("should return errors for invalid schema", () => {
    const schema = "{ invalid JSON schema";
    const jsonData = JSON.stringify({ name: "John", age: 30 });

    const result = validateJsonSchema(schema, jsonData);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Expected property name or '}' in JSON at position"
        ),
      ])
    );
  });

  test("should return errors for invalid JSON data", () => {
    const schema = JSON.stringify({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    });

    const jsonData = "{ invalid JSON data";

    const result = validateJsonSchema(schema, jsonData);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Expected property name or '}' in JSON at position"
        ),
      ])
    );
  });
});
