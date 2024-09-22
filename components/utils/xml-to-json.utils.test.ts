import { convertXMLtoJSON } from "./xml-to-json.utils";

describe("xml-to-json.utils", () => {
  it("should convert XML to JSON", async () => {
    const xmlString = `
      <person>
        <name>John</name>
        <age>30</age>
      </person>
    `;
    const expectedJSON = { person: { name: "John", age: "30" } };

    const result = await convertXMLtoJSON(xmlString);
    expect(result).toEqual(expectedJSON);
  });

  it("should handle more complex XML structures", async () => {
    const xmlString = `
      <people>
        <person>
          <name>John</name>
          <age>30</age>
        </person>
        <person>
          <name>Jane</name>
          <age>25</age>
        </person>
      </people>
    `;
    const expectedJSON = {
      people: {
        person: [
          { name: "John", age: "30" },
          { name: "Jane", age: "25" },
        ],
      },
    };

    const result = await convertXMLtoJSON(xmlString);
    expect(result).toEqual(expectedJSON);
  });

  it("should throw an error for invalid XML", async () => {
    const invalidXML = "<invalid><person></invalid>";

    await expect(convertXMLtoJSON(invalidXML)).rejects.toThrow(
      "Failed to convert XML to JSON"
    );
  });
});
