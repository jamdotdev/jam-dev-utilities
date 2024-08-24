import crypto, { BinaryToTextEncoding } from "crypto";

export const generateHash = (
  algorithm: string,
  data: string,
  encoding: BinaryToTextEncoding = "hex",
  secretKey?: string
): string => {
  if (typeof data !== "string" || data.trim() === "") {
    throw new Error("Data must be a non-empty string");
  }

  try {
    const hash = algorithm.startsWith("hmac")
      ? crypto.createHmac(algorithm.replace("hmac-", ""), secretKey!)
      : crypto.createHash(algorithm);

    return hash.update(data).digest(encoding);
  } catch (error) {
    throw new Error(
      `Failed to generate hash: ${error instanceof Error ? error.message : "An unknown error occurred"}`
    );
  }
};
