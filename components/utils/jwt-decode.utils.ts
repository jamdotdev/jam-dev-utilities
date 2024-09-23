import { jwtDecode } from "jwt-decode";

export function decodeJWTHeader(token: string): string {
  try {
    const decoded = jwtDecode(token, { header: true });
    return JSON.stringify(decoded, null, 2);
  } catch (error) {
    return "Invalid JWT: Cannot decode header.";
  }
}

export function decodeJWTPayload(token: string): string {
  try {
    const decoded = jwtDecode(token);
    return JSON.stringify(decoded, null, 2);
  } catch (error) {
    return "Invalid JWT: Cannot decode payload.";
  }
}
