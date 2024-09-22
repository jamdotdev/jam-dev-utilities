import { minifyJS } from "./minify-js.utils";

describe("minify-js.utils", () => {
  it("should minify valid JS code", async () => {
    const jsCode = `function add(a, b) {
      return a + b;
    }`;
    const expectedMinifiedJS = "function add(a,b){return a+b}";
    await expect(minifyJS(jsCode)).resolves.toBe(expectedMinifiedJS);
  });

  it("should throw an error for invalid JS code", async () => {
    const invalidJS = `function add(a, b { return a + b; }`;
    await expect(minifyJS(invalidJS)).rejects.toThrow("Unexpected token");
  });
});
