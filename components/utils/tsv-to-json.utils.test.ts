import { convertTSVtoJSON } from "./tsv-to-json.utils";

describe("tsv-to-json.utils", () => {
  it("should convert TSV to JSON with lowercase headers/keys", () => {
    const tsv = `
      Name\tAge\tGender\tEmail\tPhone
      John Doe\t35\tMale\tjohn.doe@example.com\t+1 (555) 123-4567
      Jane Smith\t28\tFemale\tjane.smith@example.com\t+1 (555) 987-6543
      Michael Johnson\t42\tMale\tmichael.johnson@example.com\t+1 (555) 456-7890
      Emily Brown\t31\tFemale\temily.brown@example.com\t+1 (555) 321-7654
      David Lee\t25\tMale\tdavid.lee@example.com\t+1 (555) 789-0123
`;
    const result = convertTSVtoJSON(tsv, true);
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

  it("should convert TSV to JSON and trim values", () => {
    const tsv = `
      Name\t   Age\t Phone
      John Doe\t   30\t +1 (555) 123-4567
      Jane Smith\t   25\t +1 (555) 987-6543
`;
    const result = convertTSVtoJSON(tsv, true);
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

  it("should skip empty lines in TSV", () => {
    const tsv = `
      Name\t Age

      John Doe\t 30

      Jane Smith\t 25
`;
    const result = convertTSVtoJSON(tsv, true);
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

  it("should preserve original case when lowercase is false", () => {
    const tsv = `Name\tAge\nJohn\t25`;
    const result = convertTSVtoJSON(tsv, false);
    const parsed = JSON.parse(result);

    expect(parsed[0]).toHaveProperty("Name");
    expect(parsed[0]).toHaveProperty("Age");
  });
});
