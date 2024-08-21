import { convertCSSToInline } from "./css-to-inline.utils";

describe("convertCSSToInline", () => {
  it("should apply inline styles from CSS to a more complex HTML structure while preserving classes", () => {
    const html = `
      <div id="main" class="container">
        <header class="header">
          <h1>Welcome</h1>
          <nav class="nav">
            <ul>
              <li><a href="#home" class="nav-link">Home</a></li>
              <li><a href="#about" class="nav-link">About</a></li>
              <li><a href="#services" class="nav-link">Services</a></li>
            </ul>
          </nav>
        </header>
        <section class="content">
          <p class="intro">This is a sample paragraph inside a section.</p>
          <div class="highlight">
            <span class="highlighted-text">Important Text</span>
          </div>
        </section>
      </div>
    `;

    const css = `
      .container {
        max-width: 960px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      }
      .header {
        background-color: #333;
        color: #fff;
        padding: 15px;
        text-align: center;
      }
      .nav-link {
        color: #007BFF;
        text-decoration: none;
        margin-right: 10px;
      }
      .content {
        margin-top: 20px;
      }
      .intro {
        font-size: 18px;
        color: #555;
      }
      .highlight {
        background-color: #ffeb3b;
        padding: 10px;
        border-radius: 5px;
      }
      .highlighted-text {
        font-weight: bold;
        color: #d32f2f;
      }
    `;

    const result = convertCSSToInline(html, css);

    const expected = `
      <div id="main" class="container" style="max-width: 960px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <header class="header" style="background-color: #333; color: #fff; padding: 15px; text-align: center;">
          <h1>Welcome</h1>
          <nav class="nav">
            <ul>
              <li><a href="#home" class="nav-link" style="color: #007BFF; text-decoration: none; margin-right: 10px;">Home</a></li>
              <li><a href="#about" class="nav-link" style="color: #007BFF; text-decoration: none; margin-right: 10px;">About</a></li>
              <li><a href="#services" class="nav-link" style="color: #007BFF; text-decoration: none; margin-right: 10px;">Services</a></li>
            </ul>
          </nav>
        </header>
        <section class="content" style="margin-top: 20px;">
          <p class="intro" style="font-size: 18px; color: #555;">This is a sample paragraph inside a section.</p>
          <div class="highlight" style="background-color: #ffeb3b; padding: 10px; border-radius: 5px;">
            <span class="highlighted-text" style="font-weight: bold; color: #d32f2f;">Important Text</span>
          </div>
        </section>
      </div>
    `.trim();

    expect(result.trim()).toBe(expected);
  });

  it("should return the same HTML when CSS is empty", () => {
    const html = `
      <div class="container">
        <p class="text">Sample text</p>
      </div>
    `;
    const css = "";
    const result = convertCSSToInline(html, css);

    expect(result.trim()).toBe(html.trim());
  });

  it("should return the same HTML when CSS does not match any selectors", () => {
    const html = `
      <div class="container">
        <p class="text">Sample text</p>
      </div>
    `;
    const css = `
      .non-existent-class {
        color: green;
      }
    `;
    const result = convertCSSToInline(html, css);

    expect(result.trim()).toBe(html.trim());
  });

  it("should correctly apply the last defined style when CSS has conflicting styles for the same selector", () => {
    const html = `
      <div class="container">
        <p class="text">Sample text</p>
      </div>
    `;
    const css = `
      .text {
        color: red;
      }
      .text {
        color: blue;
      }
    `;
    const result = convertCSSToInline(html, css);
    const expected = `
      <div class="container">
        <p class="text" style="color: blue;">Sample text</p>
      </div>
    `.trim();

    expect(result.trim()).toBe(expected);
  });

  it("should not apply styles from CSS rules that do not match any elements", () => {
    const html = `
      <div class="container">
        <p class="text">Sample text</p>
      </div>
    `;
    const css = `
      .non-matching-class {
        color: red;
      }
    `;
    const result = convertCSSToInline(html, css);
    const expected = `
      <div class="container">
        <p class="text">Sample text</p>
      </div>
    `.trim();

    expect(result.trim()).toBe(expected);
  });
});
