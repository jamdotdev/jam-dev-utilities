import crypto, { BinaryToTextEncoding } from "crypto";

export type Algorithm =
  | "sha256"
  | "sha512"
  | "md5"
  | "pbkdf2"
  | "hmac-sha256"
  | "hmac-sha512";

export const generateHash = (
  algorithm: Algorithm,
  data: string,
  encoding: BinaryToTextEncoding = "hex",
  secretKey?: string
): string => {
  if (typeof data !== "string" || data.trim() === "") {
    throw new Error("Data must be a non-empty string");
  }

  if (algorithm.startsWith("hmac") && !secretKey) {
    throw new Error("Secret key must be provided for HMAC algorighms");
  }

  const secret = secretKey || crypto.randomBytes(32).toString("hex");

  try {
    const hash = algorithm.startsWith("hmac")
      ? crypto.createHmac(algorithm.replace("hmac-", ""), secret)
      : crypto.createHash(algorithm);

    return hash.update(data).digest(encoding);
  } catch (error) {
    throw new Error(
      `Failed to generate hash: ${error instanceof Error ? error.message : "An unknown error occurred"}`
    );
  }
};
