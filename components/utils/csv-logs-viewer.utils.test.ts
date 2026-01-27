import * as fs from "fs";
import * as path from "path";
import {
  parseCSV,
  buildFacets,
  filterRows,
  detectLogLevel,
  detectIfLogsFile,
  formatDate,
  isDateColumn,
} from "./csv-logs-viewer.utils";

describe("csv-logs-viewer.utils", () => {
  describe("parseCSV", () => {
    it("should parse comma-separated CSV", () => {
      const csv = `Name,Age,City
John,30,New York
Jane,25,Los Angeles`;
      const result = parseCSV(csv);
      expect(result.headers).toEqual(["Name", "Age", "City"]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({
        Name: "John",
        Age: "30",
        City: "New York",
      });
    });

    it("should parse tab-separated TSV", () => {
      const tsv = `Date\tHost\tService\tContent
2026-01-23T16:42:54.549Z\t\tchrome-extension\t[settingsHandler] test`;
      const result = parseCSV(tsv);
      expect(result.headers).toEqual(["Date", "Host", "Service", "Content"]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].Service).toBe("chrome-extension");
    });

    it("should handle quoted fields with commas", () => {
      const csv = `Name,Company,City
John,"Acme, Inc.",New York`;
      const result = parseCSV(csv);
      expect(result.rows[0].Company).toBe("Acme, Inc.");
    });

    it("should handle empty values", () => {
      const csv = `Name,Age,City
John,,New York`;
      const result = parseCSV(csv);
      expect(result.rows[0].Age).toBe("");
    });

    it("should skip empty lines", () => {
      const csv = `Name,Age
John,30

Jane,25`;
      const result = parseCSV(csv);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("detectLogLevel", () => {
    it("should detect error level", () => {
      expect(detectLogLevel({ message: "Error occurred" })).toBe("error");
      expect(detectLogLevel({ message: "Request failed" })).toBe("error");
      expect(detectLogLevel({ status: "500" })).toBe("error");
    });

    it("should detect warning level", () => {
      expect(detectLogLevel({ message: "Warning: deprecated" })).toBe(
        "warning"
      );
      expect(detectLogLevel({ status: "404" })).toBe("warning");
    });

    it("should detect info level", () => {
      expect(detectLogLevel({ message: "Info: started" })).toBe("info");
    });

    it("should detect debug level", () => {
      expect(detectLogLevel({ message: "Debug: value=123" })).toBe("debug");
    });

    it("should return default for normal messages", () => {
      expect(detectLogLevel({ message: "Hello world" })).toBe("default");
    });
  });

  describe("detectIfLogsFile", () => {
    it("should detect log files with log-related headers", () => {
      const headers = ["Date", "Host", "Service", "Content"];
      const rows = [
        {
          Date: "2026-01-23T16:42:54.549Z",
          Host: "",
          Service: "chrome-extension",
          Content: "test",
        },
      ];
      expect(detectIfLogsFile(headers, rows)).toBe(true);
    });

    it("should detect log files with timestamp and few columns", () => {
      const headers = ["timestamp", "level", "message"];
      const rows = [
        {
          timestamp: "2026-01-23T16:42:54.549Z",
          level: "info",
          message: "test",
        },
      ];
      expect(detectIfLogsFile(headers, rows)).toBe(true);
    });

    it("should not detect regular CSV as logs", () => {
      const headers = [
        "Index",
        "Customer Id",
        "First Name",
        "Last Name",
        "Company",
        "City",
        "Country",
        "Phone 1",
        "Phone 2",
        "Email",
        "Subscription Date",
        "Website",
      ];
      const rows = [
        {
          Index: "1",
          "Customer Id": "abc123",
          "First Name": "John",
          "Last Name": "Doe",
          Company: "Acme",
          City: "NYC",
          Country: "USA",
          "Phone 1": "123",
          "Phone 2": "456",
          Email: "john@example.com",
          "Subscription Date": "2021-01-01",
          Website: "http://example.com",
        },
      ];
      expect(detectIfLogsFile(headers, rows)).toBe(false);
    });
  });

  describe("buildFacets", () => {
    it("should build facets with value counts", () => {
      const rows = [
        { Service: "graphql", Host: "server1" },
        { Service: "graphql", Host: "server2" },
        { Service: "chrome-extension", Host: "server1" },
      ];
      const headers = ["Service", "Host"];
      const facets = buildFacets(rows, headers);

      expect(facets.get("Service")?.values).toHaveLength(2);
      expect(facets.get("Service")?.values[0]).toEqual({
        value: "graphql",
        count: 2,
      });
    });

    it("should limit facet values to maxValuesPerFacet", () => {
      const rows = Array.from({ length: 200 }, (_, i) => ({
        id: `id-${i}`,
      }));
      const facets = buildFacets(rows, ["id"], 50);
      expect(facets.get("id")?.values).toHaveLength(50);
    });
  });

  describe("filterRows", () => {
    const rows = [
      { Service: "graphql", Host: "server1", Content: "request started" },
      { Service: "graphql", Host: "server2", Content: "request completed" },
      {
        Service: "chrome-extension",
        Host: "server1",
        Content: "error occurred",
      },
    ];

    it("should filter by column values", () => {
      const filters = [{ column: "Service", selectedValues: ["graphql"] }];
      const result = filterRows(rows, filters, "");
      expect(result).toHaveLength(2);
    });

    it("should filter by search query", () => {
      const result = filterRows(rows, [], "error");
      expect(result).toHaveLength(1);
      expect(result[0].Content).toBe("error occurred");
    });

    it("should combine filters and search", () => {
      const filters = [{ column: "Host", selectedValues: ["server1"] }];
      const result = filterRows(rows, filters, "request");
      expect(result).toHaveLength(1);
      expect(result[0].Service).toBe("graphql");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date strings", () => {
      const result = formatDate("2026-01-23T16:42:54.549Z");
      expect(result).toContain("Jan");
      expect(result).toContain("23");
    });

    it("should return original string for invalid dates", () => {
      expect(formatDate("not a date")).toBe("not a date");
    });
  });

  describe("isDateColumn", () => {
    it("should detect date columns by header name", () => {
      expect(isDateColumn("Date", "")).toBe(true);
      expect(isDateColumn("timestamp", "")).toBe(true);
      expect(isDateColumn("created_at", "")).toBe(true);
    });

    it("should detect date columns by ISO value", () => {
      expect(isDateColumn("column", "2026-01-23T16:42:54.549Z")).toBe(true);
    });

    it("should not detect non-date columns", () => {
      expect(isDateColumn("Name", "John")).toBe(false);
    });
  });

  describe("performance benchmark", () => {
    it("should parse 1000-row CSV efficiently", () => {
      const csvPath = path.join(
        __dirname,
        "../../__tests__/fixtures/customers-1000.csv"
      );

      if (!fs.existsSync(csvPath)) {
        console.warn("Skipping benchmark: customers-1000.csv not found");
        return;
      }

      const csvContent = fs.readFileSync(csvPath, "utf-8");

      const parseStart = performance.now();
      const result = parseCSV(csvContent);
      const parseEnd = performance.now();

      expect(result.rows).toHaveLength(1000);
      expect(result.headers).toContain("First Name");

      const facetStart = performance.now();
      const facets = buildFacets(result.rows, result.headers);
      const facetEnd = performance.now();

      expect(facets.size).toBe(result.headers.length);

      const parseTime = parseEnd - parseStart;
      const facetTime = facetEnd - facetStart;

      console.log(`Parse time for 1000 rows: ${parseTime.toFixed(2)}ms`);
      console.log(`Facet build time: ${facetTime.toFixed(2)}ms`);

      expect(parseTime).toBeLessThan(500);
      expect(facetTime).toBeLessThan(500);
    });
  });
});
