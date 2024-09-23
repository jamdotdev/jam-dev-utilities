import { decodeJWTHeader, decodeJWTPayload } from "./jwt-decode.utils";

describe("jwt-decode.utils", () => {
  it("should decode a valid JWT header", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const header = decodeJWTHeader(token);
    const headerJson = JSON.parse(header);
    expect(headerJson).toHaveProperty("alg", "HS256");
    expect(headerJson).toHaveProperty("typ", "JWT");
  });

  it("should decode a valid JWT payload", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const payload = decodeJWTPayload(token);
    const payloadJson = JSON.parse(payload);
    expect(payloadJson).toHaveProperty("sub", "1234567890");
    expect(payloadJson).toHaveProperty("name", "John Doe");
    expect(payloadJson).toHaveProperty("iat", 1516239022);
  });

  it("should return error message for invalid JWT header", () => {
    const token = "invalid.jwt.token";
    const header = decodeJWTHeader(token);
    expect(header).toBe("Invalid JWT: Cannot decode header.");
  });

  it("should return error message for invalid JWT payload", () => {
    const token = "invalid.jwt.token";
    const payload = decodeJWTPayload(token);
    expect(payload).toBe("Invalid JWT: Cannot decode payload.");
  });
});
