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

            // Add attributes
            if (element.attributes.length > 0) {
                obj["@attributes"] = {};
                for (let i = 0; i < element.attributes.length; i++) {
                    const attr = element.attributes[i];
                    (obj["@attributes"] as Record<string, string>)[attr.nodeName] =
                        attr.nodeValue || "";
                }
            }

            // Handle child nodes
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
                            // If only text content, return it directly
                            if (
                                element.childNodes.length === 1 &&
                                element.attributes.length === 0
                            ) {
                                return text;
                            }
                            obj["#text"] = text;
                        }
                    }
                    // Element node
                    else if (child.nodeType === Node.ELEMENT_NODE) {
                        const childName = child.nodeName;
                        const childValue = nodeToJson(child);

                        // Handle arrays (multiple elements with same name)
                        if (obj[childName] !== undefined) {
                            if (!Array.isArray(obj[childName])) {
                                obj[childName] = [obj[childName]];
                            }
                            (obj[childName] as unknown[]).push(childValue);
                        } else {
                            obj[childName] = childValue;
                        }
                    }
                }
            }

            // If object has only @attributes, merge them
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
