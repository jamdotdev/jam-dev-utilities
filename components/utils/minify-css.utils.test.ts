import { minifyCSS } from "./minify-css.utils";

describe("minify-css.utils", () => {
  it("should minify valid CSS code", () => {
    const cssCode = `body {
      color: red;
    }`;
    const expectedMinifiedCSS = "body{color:red}";
    expect(minifyCSS(cssCode)).toBe(expectedMinifiedCSS);
  });

  it("should handle syntactically incorrect CSS gracefully", () => {
    const invalidCSS = `body color red;`;
    const output = minifyCSS(invalidCSS);
    expect(output).toBe("");
  });
});
