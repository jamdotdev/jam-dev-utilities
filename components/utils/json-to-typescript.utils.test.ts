import { jsonToTypeScript } from "./json-to-typescript.utils";

describe("json-to-typescript.utils", () => {
  it("should generate an interface from a simple flat object", () => {
    const json = JSON.stringify({ name: "Alice", age: 30, active: true });
    const result = jsonToTypeScript(json);
    expect(result).toBe(
      `interface Root {\n  name: string;\n  age: number;\n  active: boolean;\n}`
    );
  });

  it("should handle nested objects", () => {
    const json = JSON.stringify({
      user: { name: "Bob", email: "bob@test.com" },
    });
    const result = jsonToTypeScript(json);
    expect(result).toContain("interface User {");
    expect(result).toContain("  name: string;");
    expect(result).toContain("  email: string;");
    expect(result).toContain("interface Root {");
    expect(result).toContain("  user: User;");
  });

  it("should handle arrays of primitives", () => {
    const json = JSON.stringify({ tags: ["a", "b", "c"] });
    const result = jsonToTypeScript(json);
    expect(result).toContain("tags: string[];");
  });

  it("should handle arrays of objects", () => {
    const json = JSON.stringify({
      users: [{ name: "Alice" }, { name: "Bob" }],
    });
    const result = jsonToTypeScript(json);
    expect(result).toContain("interface Users {");
    expect(result).toContain("users: Users[];");
  });

  it("should handle null values", () => {
    const json = JSON.stringify({ value: null });
    const result = jsonToTypeScript(json);
    expect(result).toContain("value: null;");
  });

  it("should handle empty arrays", () => {
    const json = JSON.stringify({ items: [] });
    const result = jsonToTypeScript(json);
    expect(result).toContain("items: unknown[];");
  });

  it("should handle mixed type arrays", () => {
    const json = JSON.stringify({ data: [1, "hello", true] });
    const result = jsonToTypeScript(json);
    expect(result).toContain("data: (number | string | boolean)[];");
  });

  it("should use custom root name", () => {
    const json = JSON.stringify({ id: 1 });
    const result = jsonToTypeScript(json, "ApiResponse");
    expect(result).toContain("interface ApiResponse {");
  });

  it("should handle root-level arrays", () => {
    const json = JSON.stringify([{ id: 1, name: "Alice" }]);
    const result = jsonToTypeScript(json);
    expect(result).toContain("interface Root {");
    expect(result).toContain("type RootArray = Root[];");
  });

  it("should handle primitive root values", () => {
    expect(jsonToTypeScript('"hello"')).toBe("type Root = string;");
    expect(jsonToTypeScript("42")).toBe("type Root = number;");
    expect(jsonToTypeScript("true")).toBe("type Root = boolean;");
  });

  it("should quote keys with special characters", () => {
    const json = JSON.stringify({ "content-type": "text/html" });
    const result = jsonToTypeScript(json);
    expect(result).toContain('"content-type": string;');
  });

  it("should handle deeply nested structures", () => {
    const json = JSON.stringify({
      company: {
        address: {
          city: "NYC",
          zip: "10001",
        },
      },
    });
    const result = jsonToTypeScript(json);
    expect(result).toContain("interface Address {");
    expect(result).toContain("interface Company {");
    expect(result).toContain("interface Root {");
  });

  it("should handle empty root array", () => {
    const result = jsonToTypeScript("[]");
    expect(result).toBe("type Root = unknown[];");
  });

  it("should throw on invalid JSON", () => {
    expect(() => jsonToTypeScript("not json")).toThrow();
  });
});
