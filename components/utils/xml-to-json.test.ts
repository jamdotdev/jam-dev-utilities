import { xmlToJson } from "./xmlToJson";

describe("XML to JSON Converter", () => {
  describe("Basic conversion", () => {
    it("should convert simple XML to JSON", () => {
      const xml = "<root><name>test</name></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { name: "test" } });
    });

    it("should handle nested elements", () => {
      const xml = "<root><parent><child>value</child></parent></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { parent: { child: "value" } },
      });
    });

    it("should handle empty elements", () => {
      const xml = "<root><empty></empty></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { empty: null } });
    });
  });

  describe("Attribute handling", () => {
    it("should convert XML attributes to @attributes object", () => {
      const xml = '<root id="123"><name>test</name></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "@attributes": { id: "123" }, name: "test" },
      });
    });

    it("should handle multiple attributes", () => {
      const xml = '<root id="123" class="main" data-test="true"></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: {
          "@attributes": { id: "123", class: "main", "data-test": "true" },
        },
      });
    });

    it("should handle element with only attributes", () => {
      const xml = '<root id="123"></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "@attributes": { id: "123" } },
      });
    });

    it("should handle self-closing tags with attributes", () => {
      const xml = '<root><coordinates lat="40.7128" lon="-74.0060"/></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: {
          coordinates: {
            "@attributes": {
              lat: "40.7128",
              lon: "-74.0060",
            },
          },
        },
      });
    });
  });

  describe("Array handling", () => {
    it("should convert multiple same-named elements to array", () => {
      const xml = "<root><item>1</item><item>2</item><item>3</item></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { item: ["1", "2", "3"] } });
    });

    it("should handle mixed elements with arrays", () => {
      const xml = "<root><name>test</name><item>1</item><item>2</item></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { name: "test", item: ["1", "2"] },
      });
    });

    it("should handle arrays of objects with attributes", () => {
      const xml =
        '<root><item id="1">first</item><item id="2">second</item></root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: {
          item: [
            { "#text": "first", "@attributes": { id: "1" } },
            { "#text": "second", "@attributes": { id: "2" } },
          ],
        },
      });
    });
  });

  describe("Text content handling", () => {
    it("should handle text content with attributes using #text", () => {
      const xml = '<root id="1">text content</root>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        root: { "#text": "text content", "@attributes": { id: "1" } },
      });
    });

    it("should trim whitespace from text content", () => {
      const xml = "<root><name>  test  </name></root>";
      const result = xmlToJson(xml);
      expect(result).toEqual({ root: { name: "test" } });
    });

    it("should handle mixed content (text + elements)", () => {
      const xml = '<price currency="USD">12.50</price>';
      const result = xmlToJson(xml);
      expect(result).toEqual({
        price: { "#text": "12.50", "@attributes": { currency: "USD" } },
      });
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid XML", () => {
      const xml = "<root><unclosed>";
      expect(() => xmlToJson(xml)).toThrow("Invalid XML");
    });

    it("should throw error for malformed XML", () => {
      const xml = "not xml at all";
      expect(() => xmlToJson(xml)).toThrow("Invalid XML");
    });
  });

  describe("Complex nested structure", () => {
    it("should convert complex library XML structure", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<library>
  <metadata>
    <name>City Central Library</name>
    <location>
      <city>New York</city>
      <country>USA</country>
      <coordinates lat="40.7128" lon="-74.0060"/>
    </location>
    <established>1832</established>
  </metadata>

  <books>
    <book id="001" available="true">
      <title>The Great Gatsby</title>
      <author nationality="American">
        <firstName>F. Scott</firstName>
        <lastName>Fitzgerald</lastName>
      </author>
      <isbn>978-0-7432-7356-5</isbn>
      <published>1925</published>
      <genres>
        <genre>Fiction</genre>
        <genre>Classic</genre>
      </genres>
      <price currency="USD">12.50</price>
      <copies>5</copies>
      <description>A novel set in the Jazz Age that explores themes of decadence, idealism, and excess.</description>
    </book>

    <book id="002" available="false">
      <title>1984</title>
      <author nationality="British">
        <firstName>George</firstName>
        <lastName>Orwell</lastName>
      </author>
      <isbn>978-0-452-28423-4</isbn>
      <published>1949</published>
      <genres>
        <genre>Dystopian</genre>
        <genre>Science Fiction</genre>
        <genre>Political Fiction</genre>
      </genres>
      <price currency="USD">9.80</price>
      <copies>0</copies>
      <description>A dystopian social science fiction novel and cautionary tale.</description>
    </book>

    <book id="003" available="true">
      <title>To Kill a Mockingbird</title>
      <author nationality="American">
        <firstName>Harper</firstName>
        <lastName>Lee</lastName>
      </author>
      <isbn>978-0-06-112008-4</isbn>
      <published>1960</published>
      <genres>
        <genre>Fiction</genre>
        <genre>Classic</genre>
        <genre>Historical</genre>
      </genres>
      <price currency="USD">11.00</price>
      <copies>3</copies>
      <awards>
        <award year="1961">Pulitzer Prize</award>
        <award year="1961">Brotherhood Award</award>
      </awards>
      <description>A novel about racial injustice and childhood innocence in the American South.</description>
    </book>
  </books>

  <members>
    <member id="M001" status="active">
      <name>John Doe</name>
      <email>john.doe@example.com</email>
      <phone>+1 555 123 4567</phone>
      <joinDate>2024-03-15</joinDate>
      <borrowedBooks>
        <bookRef id="001" dueDate="2026-01-20"/>
      </borrowedBooks>
    </member>

    <member id="M002" status="active">
      <name>Jane Smith</name>
      <email>jane.smith@example.com</email>
      <phone>+1 555 987 6543</phone>
      <joinDate>2023-07-22</joinDate>
      <borrowedBooks>
        <bookRef id="003" dueDate="2026-01-15"/>
        <bookRef id="001" dueDate="2026-01-18"/>
      </borrowedBooks>
    </member>

    <member id="M003" status="suspended">
      <name>Bob Johnson</name>
      <email>bob.johnson@example.com</email>
      <phone>+1 555 555 7890</phone>
      <joinDate>2022-11-10</joinDate>
      <borrowedBooks/>
      <suspensionReason>Late returns</suspensionReason>
    </member>
  </members>

  <staff>
    <employee id="E001" role="librarian">
      <name>Alice Williams</name>
      <department>Reference</department>
      <hireDate>2018-05-01</hireDate>
      <schedule>
        <shift day="Monday" start="09:00" end="17:00"/>
        <shift day="Wednesday" start="09:00" end="17:00"/>
        <shift day="Friday" start="09:00" end="17:00"/>
      </schedule>
    </employee>

    <employee id="E002" role="manager">
      <name>Charlie Brown</name>
      <department>Administration</department>
      <hireDate>2015-02-15</hireDate>
      <schedule>
        <shift day="Monday" start="08:00" end="16:00"/>
        <shift day="Tuesday" start="08:00" end="16:00"/>
        <shift day="Wednesday" start="08:00" end="16:00"/>
        <shift day="Thursday" start="08:00" end="16:00"/>
        <shift day="Friday" start="08:00" end="16:00"/>
      </schedule>
    </employee>
  </staff>

  <events>
    <event type="workshop" capacity="20">
      <title>Creative Writing Workshop</title>
      <date>2026-02-10</date>
      <time>18:00</time>
      <instructor>David Miller</instructor>
      <registrations>15</registrations>
    </event>

    <event type="reading" capacity="50">
      <title>Poetry Night</title>
      <date>2026-01-25</date>
      <time>19:30</time>
      <guests>
        <guest>Emily Davis</guest>
        <guest>Frank Wilson</guest>
      </guests>
      <registrations>42</registrations>
    </event>
  </events>

  <config>
    <settings>
      <maxBorrowDays>14</maxBorrowDays>
      <maxBooksPerMember>5</maxBooksPerMember>
      <lateFeePerDay currency="USD">0.50</lateFeePerDay>
      <openingHours>
        <weekday open="08:00" close="20:00"/>
        <saturday open="09:00" close="15:00"/>
        <sunday closed="true"/>
      </openingHours>
    </settings>
  </config>
</library>`;

      const result = xmlToJson(xml);

      expect(result).toEqual({
        library: {
          metadata: {
            name: "City Central Library",
            location: {
              city: "New York",
              country: "USA",
              coordinates: {
                "@attributes": {
                  lat: "40.7128",
                  lon: "-74.0060",
                },
              },
            },
            established: "1832",
          },
          books: {
            book: [
              {
                "@attributes": {
                  id: "001",
                  available: "true",
                },
                title: "The Great Gatsby",
                author: {
                  "@attributes": {
                    nationality: "American",
                  },
                  firstName: "F. Scott",
                  lastName: "Fitzgerald",
                },
                isbn: "978-0-7432-7356-5",
                published: "1925",
                genres: {
                  genre: ["Fiction", "Classic"],
                },
                price: {
                  "#text": "12.50",
                  "@attributes": {
                    currency: "USD",
                  },
                },
                copies: "5",
                description:
                  "A novel set in the Jazz Age that explores themes of decadence, idealism, and excess.",
              },
              {
                "@attributes": {
                  id: "002",
                  available: "false",
                },
                title: "1984",
                author: {
                  "@attributes": {
                    nationality: "British",
                  },
                  firstName: "George",
                  lastName: "Orwell",
                },
                isbn: "978-0-452-28423-4",
                published: "1949",
                genres: {
                  genre: ["Dystopian", "Science Fiction", "Political Fiction"],
                },
                price: {
                  "#text": "9.80",
                  "@attributes": {
                    currency: "USD",
                  },
                },
                copies: "0",
                description:
                  "A dystopian social science fiction novel and cautionary tale.",
              },
              {
                "@attributes": {
                  id: "003",
                  available: "true",
                },
                title: "To Kill a Mockingbird",
                author: {
                  "@attributes": {
                    nationality: "American",
                  },
                  firstName: "Harper",
                  lastName: "Lee",
                },
                isbn: "978-0-06-112008-4",
                published: "1960",
                genres: {
                  genre: ["Fiction", "Classic", "Historical"],
                },
                price: {
                  "#text": "11.00",
                  "@attributes": {
                    currency: "USD",
                  },
                },
                copies: "3",
                awards: {
                  award: [
                    {
                      "#text": "Pulitzer Prize",
                      "@attributes": {
                        year: "1961",
                      },
                    },
                    {
                      "#text": "Brotherhood Award",
                      "@attributes": {
                        year: "1961",
                      },
                    },
                  ],
                },
                description:
                  "A novel about racial injustice and childhood innocence in the American South.",
              },
            ],
          },
          members: {
            member: [
              {
                "@attributes": {
                  id: "M001",
                  status: "active",
                },
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+1 555 123 4567",
                joinDate: "2024-03-15",
                borrowedBooks: {
                  bookRef: {
                    "@attributes": {
                      id: "001",
                      dueDate: "2026-01-20",
                    },
                  },
                },
              },
              {
                "@attributes": {
                  id: "M002",
                  status: "active",
                },
                name: "Jane Smith",
                email: "jane.smith@example.com",
                phone: "+1 555 987 6543",
                joinDate: "2023-07-22",
                borrowedBooks: {
                  bookRef: [
                    {
                      "@attributes": {
                        id: "003",
                        dueDate: "2026-01-15",
                      },
                    },
                    {
                      "@attributes": {
                        id: "001",
                        dueDate: "2026-01-18",
                      },
                    },
                  ],
                },
              },
              {
                "@attributes": {
                  id: "M003",
                  status: "suspended",
                },
                name: "Bob Johnson",
                email: "bob.johnson@example.com",
                phone: "+1 555 555 7890",
                joinDate: "2022-11-10",
                borrowedBooks: null,
                suspensionReason: "Late returns",
              },
            ],
          },
          staff: {
            employee: [
              {
                "@attributes": {
                  id: "E001",
                  role: "librarian",
                },
                name: "Alice Williams",
                department: "Reference",
                hireDate: "2018-05-01",
                schedule: {
                  shift: [
                    {
                      "@attributes": {
                        day: "Monday",
                        start: "09:00",
                        end: "17:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Wednesday",
                        start: "09:00",
                        end: "17:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Friday",
                        start: "09:00",
                        end: "17:00",
                      },
                    },
                  ],
                },
              },
              {
                "@attributes": {
                  id: "E002",
                  role: "manager",
                },
                name: "Charlie Brown",
                department: "Administration",
                hireDate: "2015-02-15",
                schedule: {
                  shift: [
                    {
                      "@attributes": {
                        day: "Monday",
                        start: "08:00",
                        end: "16:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Tuesday",
                        start: "08:00",
                        end: "16:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Wednesday",
                        start: "08:00",
                        end: "16:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Thursday",
                        start: "08:00",
                        end: "16:00",
                      },
                    },
                    {
                      "@attributes": {
                        day: "Friday",
                        start: "08:00",
                        end: "16:00",
                      },
                    },
                  ],
                },
              },
            ],
          },
          events: {
            event: [
              {
                "@attributes": {
                  type: "workshop",
                  capacity: "20",
                },
                title: "Creative Writing Workshop",
                date: "2026-02-10",
                time: "18:00",
                instructor: "David Miller",
                registrations: "15",
              },
              {
                "@attributes": {
                  type: "reading",
                  capacity: "50",
                },
                title: "Poetry Night",
                date: "2026-01-25",
                time: "19:30",
                guests: {
                  guest: ["Emily Davis", "Frank Wilson"],
                },
                registrations: "42",
              },
            ],
          },
          config: {
            settings: {
              maxBorrowDays: "14",
              maxBooksPerMember: "5",
              lateFeePerDay: {
                "#text": "0.50",
                "@attributes": {
                  currency: "USD",
                },
              },
              openingHours: {
                weekday: {
                  "@attributes": {
                    open: "08:00",
                    close: "20:00",
                  },
                },
                saturday: {
                  "@attributes": {
                    open: "09:00",
                    close: "15:00",
                  },
                },
                sunday: {
                  "@attributes": {
                    closed: "true",
                  },
                },
              },
            },
          },
        },
      });
    });
  });
});
