export function toBase64(value: string) {
  try {
    return Buffer.from(value).toString("base64");
  } catch {
    throw new Error("Failed to encode to Base64");
  }
}

function decodeBase64Chunk(value: string): string {
  const decoded = Buffer.from(value, "base64").toString("utf-8");
  if (!isPrintableASCII(decoded)) {
    throw new Error("Decoded string contains non-printable characters");
  }
  return decoded;
}

export function fromBase64(value: string): string {
  try {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const lines = trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      const stripped = trimmed.replace(/\s/g, "");
      const singleDecoded = decodeBase64Chunk(stripped);
      const firstLineDecoded = decodeBase64Chunk(lines[0]);

      // Multiple independent base64 strings (one per line) decode to the same
      // output as the first line when joined; PEM-style wrapped input does not.
      if (singleDecoded === firstLineDecoded) {
        return lines.map((line) => decodeBase64Chunk(line)).join("\n");
      }
    }

    return decodeBase64Chunk(trimmed.replace(/\s/g, ""));
  } catch {
    throw new Error("Invalid Base64 input");
  }
}

/**
 * Checks if the given string consists entirely of printable ASCII characters.
 * Printable ASCII characters are those in the range from space (0x20) to tilde (0x7E).
 */
export function isPrintableASCII(str: string): boolean {
  return /^[\x20-\x7E]*$/.test(str);
}
