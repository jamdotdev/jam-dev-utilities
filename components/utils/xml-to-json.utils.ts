/**
 * Converts XML string to JSON object
 * @param xml - The XML string to convert
 * @returns The parsed JSON object
 */
export function xmlToJson(xml: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  // Check for parsing errors
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML");
  }

  function nodeToJson(node: Node): unknown {
    const obj: Record<string, unknown> = {};

    // Handle element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // Handle child nodes first
      const children: Record<string, unknown[]> = {};
      let hasTextContent = false;
      let textContent = "";

      if (element.hasChildNodes()) {
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i];

          // Text node
          if (
            child.nodeType === Node.TEXT_NODE ||
            child.nodeType === Node.CDATA_SECTION_NODE
          ) {
            const text = child.textContent?.trim();
            if (text) {
              hasTextContent = true;
              textContent = text;
            }
          }
          // Element node
          else if (child.nodeType === Node.ELEMENT_NODE) {
            const childName = child.nodeName;
            const childValue = nodeToJson(child);

            if (!children[childName]) {
              children[childName] = [];
            }
            children[childName].push(childValue);
          }
        }
      }

      // Add child elements to object
      for (const [name, values] of Object.entries(children)) {
        if (values.length === 1) {
          obj[name] = values[0];
        } else {
          obj[name] = values;
        }
      }

      // Handle text content
      if (hasTextContent) {
        // If only text content and no attributes, return text directly
        if (Object.keys(obj).length === 0 && element.attributes.length === 0) {
          return textContent;
        }
        // If has attributes or children, add as #text
        if (element.attributes.length > 0 || Object.keys(obj).length > 0) {
          obj["#text"] = textContent;
        }
      }

      // Add attributes as @attributes object
      if (element.attributes.length > 0) {
        const attributes: Record<string, string> = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attributes[attr.nodeName] = attr.nodeValue || "";
        }
        obj["@attributes"] = attributes;
      }

      // If empty element, return null
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return null;
      }
    }

    return obj;
  }

  const root = doc.documentElement;
  return { [root.nodeName]: nodeToJson(root) };
}
