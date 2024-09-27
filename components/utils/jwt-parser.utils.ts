import { fromBase64 } from "./base-64.utils";

function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = fromBase64(base64);
    if (!decoded) throw new Error();
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function decodeJWT(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
} {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      throw new Error("Invalid token");
    }

    return {
      header: JSON.parse(base64UrlDecode(header)),
      payload: JSON.parse(base64UrlDecode(payload)),
      signature,
    };
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export { decodeJWT, base64UrlDecode };
