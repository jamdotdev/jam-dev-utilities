import { Builder } from "xml2js";

export function convertJSONtoXML(input: string | object): string {
  try {
    let data: object;

    if (typeof input === "string") {
      data = JSON.parse(input);
    } else if (typeof input === "object") {
      data = input;
    } else {
      throw new Error("Input must be a JSON string or an object.");
    }

    const builder = new Builder({
      headless: true,
      renderOpts: { pretty: true },
    });
    const xml = builder.buildObject(data);

    return xml;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to convert JSON to XML: Unknown error");
    }
  }
}
