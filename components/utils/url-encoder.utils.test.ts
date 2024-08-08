import { encode, decode } from "./url-encoder.utils";

describe("url-encoder.utils", () => {
  test("should encode a complex URL with non-ASCII characters", () => {
    const input = "https://mozilla.org/?x=шеллы";
    const expectedOutput = "https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B"; //prettier-ignore

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should decode a complex encoded URL with non-ASCII characters", () => {
    const encoded = "https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B";
    const expectedOutput = "https://mozilla.org/?x=шеллы";

    expect(decode(encoded)).toBe(expectedOutput);
  });

  test("should encode a valid URL without protocol", () => {
    const input = "example.com/path?query=test";
    const expectedOutput = "example.com%2Fpath%3Fquery%3Dtest";

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should encode a string with all special characters", () => {
    const input = "@#$%^&*()!~';";
    const expectedOutput = "%40%23%24%25%5E%26*()!~'%3B";

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should encode a string", () => {
    const input = "this is random text!";
    const expectedOutput = "this%20is%20random%20text!";

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should return an empty string when input is empty", () => {
    const input = "";
    const expectedOutput = "";

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should encode an invalid URL as a string", () => {
    const input = "://invalid-url and non-ASCII: шеллы";
    const expectedOutput = "%3A%2F%2Finvalid-url%20and%20non-ASCII%3A%20%D1%88%D0%B5%D0%BB%D0%BB%D1%8B"; //prettier-ignore

    expect(encode(input)).toBe(expectedOutput);
  });

  test("should decode an invlaid URL with protocol", () => {
    const input = "https%3A%2F%2Fexample.com%2Fpath%3Fwith%3Dspecial%26characters"; //prettier-ignore
    const expectedOutput = "https://example.com/path?with=special&characters";

    expect(decode(input)).toBe(expectedOutput);
  });
});
