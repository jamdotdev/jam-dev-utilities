import { generateHash } from "./hash-generator.utils";
import crypto from "crypto";

describe("generateHash", () => {
  it("should generate a valid SHA-256 hash", () => {
    const hash = generateHash("sha256", "test");
    expect(hash).toBe(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    );
  });

  it("should generate a valid SHA-512 hash", () => {
    const hash = generateHash("sha512", "test");
    expect(hash).toBe(
      "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff"
    );
  });

  it("should generate a valid MD5 hash", () => {
    const hash = generateHash("md5", "test");
    expect(hash).toBe("098f6bcd4621d373cade4e832627b4f6");
  });

  it("should generate a SHA-256 hash with base64 encoding", () => {
    const hash = generateHash("sha256", "test", "base64");
    expect(hash).toBe("n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=");
  });

  it("should generate a valid HMAC-SHA-256 hash", () => {
    const secretKey = "mySecretKey";
    const hash = generateHash("hmac-sha256", "test", "hex", secretKey);

    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update("test")
      .digest("hex");
    expect(hash).toBe(expectedHash);
  });

  it("should generate a valid HMAC-SHA-512 hash", () => {
    const secretKey = "mySecretKey";
    const hash = generateHash("hmac-sha512", "test", "hex", secretKey);

    const expectedHash = crypto
      .createHmac("sha512", secretKey)
      .update("test")
      .digest("hex");
    expect(hash).toBe(expectedHash);
  });

  it("should throw an error if data is an empty string", () => {
    expect(() => generateHash("sha256", "")).toThrow(
      "Data must be a non-empty string"
    );
  });

  it("should throw an error if data is not a string", () => {
    expect(() => generateHash("sha256", 123 as unknown as string)).toThrow(
      "Data must be a non-empty string"
    );
  });

  it("should throw an error for unsupported algorithm", () => {
    expect(() => generateHash("unsupportedAlgo", "test")).toThrow(
      "Failed to generate hash:"
    );
  });

  it("should throw an unknown error if a non-error is thrown", () => {
    const mockCrypto = jest
      .spyOn(crypto, "createHash")
      .mockImplementation(() => {
        throw "unexpected error";
      });

    expect(() => generateHash("sha256", "test")).toThrow(
      "Failed to generate hash: An unknown error occurred"
    );

    mockCrypto.mockRestore();
  });
});
