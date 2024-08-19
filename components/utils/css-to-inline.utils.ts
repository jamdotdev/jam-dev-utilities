export function convertCSSToInline(html: string, css: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const rules = css
    .split("}")
    .map((rule) => rule.trim())
    .filter(Boolean);

  rules.forEach((rule) => {
    const [selectors, styleString] = rule.split("{").map((part) => part.trim());

    if (!selectors || !styleString) return;

    const elements = doc.querySelectorAll(selectors);

    elements.forEach((element) => {
      const currentStyle = element.getAttribute("style") || "";
      const styleMap: { [key: string]: string } = {};

      currentStyle.split(";").forEach((styleRule) => {
        const [property, value] = styleRule.split(":").map((s) => s.trim());
        if (property && value) {
          styleMap[property] = value;
        }
      });

      styleString.split(";").forEach((styleRule) => {
        const [property, value] = styleRule.split(":").map((s) => s.trim());
        if (property && value) {
          styleMap[property] = value;
        }
      });

      const finalStyle =
        Object.entries(styleMap)
          .map(([property, value]) => `${property}: ${value}`)
          .join("; ") + ";";

      element.setAttribute("style", finalStyle);
    });
  });

  return doc.body.innerHTML.trim();
}
