import { convertCSVtoJSON } from "./csv-to-json.utils";

describe("csv-to-json.utils", () => {
  it("should convert CSV to JSON with lowercase headers/keys", () => {
    const csv = `
      Name,Age,Gender,Email,Phone
      John Doe,35,Male,john.doe@example.com,+1 (555) 123-4567
      Jane Smith,28,Female,jane.smith@example.com,+1 (555) 987-6543
      Michael Johnson,42,Male,michael.johnson@example.com,+1 (555) 456-7890
      Emily Brown,31,Female,emily.brown@example.com,+1 (555) 321-7654
      David Lee,25,Male,david.lee@example.com,+1 (555) 789-0123
`;
    const result = convertCSVtoJSON(csv, true);
    const expected = JSON.stringify(
      [
        {
          name: "John Doe",
          age: "35",
          gender: "Male",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
        {
          name: "Jane Smith",
          age: "28",
          gender: "Female",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
        },
        {
          name: "Michael Johnson",
          age: "42",
          gender: "Male",
          email: "michael.johnson@example.com",
          phone: "+1 (555) 456-7890",
        },
        {
          name: "Emily Brown",
          age: "31",
          gender: "Female",
          email: "emily.brown@example.com",
          phone: "+1 (555) 321-7654",
        },
        {
          name: "David Lee",
          age: "25",
          gender: "Male",
          email: "david.lee@example.com",
          phone: "+1 (555) 789-0123",
        },
      ],
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should convert CSV to JSON and trim values", () => {
    const csv = `
      Name,   Age, Phone
      John Doe,   30, +1 (555) 123-4567
      Jane Smith,   25, +1 (555) 987-6543
`;
    const result = convertCSVtoJSON(csv, true);
    const expected = JSON.stringify(
      [
        { name: "John Doe", age: "30", phone: "+1 (555) 123-4567" },
        { name: "Jane Smith", age: "25", phone: "+1 (555) 987-6543" },
      ],
      null,
      2
    );

    expect(result).toBe(expected);
  });

  it("should skip empty lines in CSV", () => {
    const csv = `
      Name, Age

      John Doe, 30

      Jane Smith, 25
`;
    const result = convertCSVtoJSON(csv, true);
    const expected = JSON.stringify(
      [
        { name: "John Doe", age: "30" },
        { name: "Jane Smith", age: "25" },
      ],
      null,
      2
    );

    expect(result).toBe(expected);
  });
});
