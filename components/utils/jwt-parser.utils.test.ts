import {
  base64UrlDecode,
  parseDate,
  dateToString,
  checkValidity,
  decodeJWT,
  State,
} from "./jwt-parser.utils";

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

describe("parseDate", () => {
  it("should return undefined if input is undefined", () => {
    expect(parseDate(undefined)).toBeUndefined();
  });

  it("should parse number timestamp correctly", () => {
    const timestamp = 1714048653;
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(timestamp * 1000);
  });

  it("should parse string timestamp correctly", () => {
    const timestamp = "1714048653";
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(Number(timestamp) * 1000);
  });

  it("should return undefined for invalid string", () => {
    expect(parseDate("invalid")).toBeUndefined();
  });
});

describe("dateToString", () => {
  it("should return only time if date is today", () => {
    const now = new Date();
    const result = dateToString(now);
    const expected = now.toISOString().split("T")[1].split(".")[0];
    expect(result).toBe(expected);
  });

  it("should return date string if not today", () => {
    const pastDate = new Date(Date.now() - 86400000);
    const result = dateToString(pastDate);
    const expected = pastDate.toISOString().split("T")[0];
    expect(result).toBe(expected);
  });
});

describe("checkValidity", () => {
  const now = Math.floor(Date.now() / 1000);

  it("should return NeverValid if exp is before iat/nbf", () => {
    const payload = {
      iat: now,
      nbf: now,
      exp: now - 100,
    };
    const result = checkValidity(payload);
    expect(result.state).toBe(State.NeverValid);
    expect(result.message).toMatch(/Token expires before being valid/);
  });

  it("should return NotYetValid if validFrom is in the future", () => {
    const payload = {
      iat: now + 1000,
    };
    const result = checkValidity(payload);
    expect(result.state).toBe(State.NotYetValid);
    expect(result.message).toMatch(/Token will be valid starting/);
  });

  it("should return Valid if currently valid", () => {
    const payload = {
      iat: now - 1000,
      exp: now + 1000,
    };
    const result = checkValidity(payload);
    expect(result.state).toBe(State.Valid);
    expect(result.message).toMatch(/Token valid until/);
  });

  it("should return Expired if exp is in the past", () => {
    const payload = {
      iat: now - 2000,
      exp: now - 1000,
    };
    const result = checkValidity(payload);
    expect(result.state).toBe(State.Expired);
    expect(result.message).toMatch(/Token expired since/);
  });

  it("should return Valid forever if no exp but has iat or nbf", () => {
    const payload = {
      iat: now - 1000,
    };
    const result = checkValidity(payload);
    expect(result.state).toBe(State.Valid);
    expect(result.message).toMatch(/Token forever valid since/);
  });

  it("should return Valid with generic message if no dates given", () => {
    const result = checkValidity({});
    expect(result.state).toBe(State.Valid);
    expect(result.message).toMatch(/Token doesn't contain a validity period/);
  });
});

describe("decodeJWT", () => {
  it("should decode a valid JWT", () => {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        sub: "1234567890",
        name: "John Doe",
        admin: true,
        iat: "10000",
      })
    ).toString("base64url");
    const signature = "abc123";

    const token = `${header}.${payload}.${signature}`;
    const result = decodeJWT(token);

    expect(result).toHaveProperty("header");
    expect(result).toHaveProperty("payload");
    expect(result).toHaveProperty("signature");
    expect(result).toHaveProperty("validity");

    expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payload).toEqual({
      sub: "1234567890",
      name: "John Doe",
      admin: true,
    });
    expect(result.signature).toBe("abc123");
    expect(result.payload).toEqual({
      message: "Token forever valid since 1970-01-01",
      state: State.Valid,
    });
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
