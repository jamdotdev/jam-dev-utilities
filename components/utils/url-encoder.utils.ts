/**
 * The `encode` function attempts to encode a given input string as a URL.
 * If the input is a valid URL, it uses `encodeURI` to encode the URL.
 * If the input is not a valid URL, it falls back to `encodeURIComponent` to encode the input as a regular string.
 *
 * The `decode` function attempts to decode a given input string.
 * If the input is a valid URL with a protocol (http or https), it uses `decodeURI` to decode the URL.
 * If the input does not have a protocol or is not a valid URL, it falls back to `decodeURIComponent` to decode the input as a regular string.
 * If decoding fails, it returns a failure message.
 */

export function encode(input: string): string {
  try {
    new URL(input);
    return encodeURI(input);
  } catch {
    return encodeURIComponent(input);
  }
}

export function decode(input: string): string {
  try {
    const hasProtocol = /^https?:\/\//i.test(input);

    if (hasProtocol) {
      new URL(input);
      return decodeURI(input);
    } else {
      return decodeURIComponent(input);
    }
  } catch (error) {
    return "Failed to decode string";
  }
}
