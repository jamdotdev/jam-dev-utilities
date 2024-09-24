import { base64UrlDecode, decodeJWT } from "./jwt-parser.utils";

jest.mock("./base-64.utils", () => ({
  fromBase64: (value: string) => {
    if (value === "Invalid string") {
      throw new Error("Invalid Base64 string");
    }
    return Buffer.from(value, "base64").toString("utf-8");
  },
}));

describe("base64UrlDecode", () => {
  it("should decode a valid Base64 URL-safe string", () => {
    const input = "SGVsbG8td29ybGQ_";
    const output = base64UrlDecode(input);
    expect(output).toBe("Hello-world?");
  });

  it("should throw an error for an invalid Base64 URL-safe string", () => {
    const input = "Invalid string";
    expect(() => base64UrlDecode(input)).toThrow("Invalid token");
  });
});

describe("decodeJWT", () => {
  it("should decode a valid JWT", () => {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "1234567890", name: "John Doe", admin: true })
    ).toString("base64url");
    const signature = "abc123";

    const token = `${header}.${payload}.${signature}`;
    const result = decodeJWT(token);

    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("payload");
    expect(result).toHaveProperty("signature");

    expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payload).toEqual({
      sub: "1234567890",
      name: "John Doe",
      admin: true,
    });
    expect(result.signature).toBe("abc123");
  });

  it("should throw an error for an invalid JWT format", () => {
    const token = "invalid.jwt.token";
    expect(() => decodeJWT(token)).toThrow("Invalid token");
  });

  it("should throw an error if JWT is missing parts", () => {
    const token =
      "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAiMTIzNDU2Nzg5MCIsIG5hbWUiOiAiSm9obiBEb2UiLCAiYWRtaW4iOiB0cnVlfQ";
    expect(() => decodeJWT(token)).toThrow("Invalid token");
  });

  it("should throw an error for a JWT with invalid Base64 encoding", () => {
    const token =
      "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.invalid_payload.abc123";
    expect(() => decodeJWT(token)).toThrow("Invalid token");
  });
});
