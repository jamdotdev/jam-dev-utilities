import { fromBase64 } from "./base-64.utils";

enum State {
  NotYetValid,
  Valid,
  Expired,
  NeverValid,
  Unknown,
}

type DecodedJWT = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  validity: Validity;
};

type Payload = {
  iat?: string | number;
  nbf?: string | number;
  exp?: string | number;
  [key: string]: unknown;
};

type Validity = {
  message: string;
  state: State;
};

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

function parseDate(date: string | number | undefined): Date | undefined {
  if (date === undefined) return undefined;
  if (typeof date === "string") date = Number(date);
  if (isNaN(date)) return undefined;
  date *= 1000;
  return new Date(date);
}

function dateToString(input: Date): string {
  const inputArr = input.toISOString().split("T");
  const inputDate: string = inputArr[0];
  const inputTime: string = inputArr[1].split(".")[0];
  const today: string = new Date().toISOString().split("T")[0];
  if (inputDate === today) return inputTime;
  return inputDate;
}

function checkValidity(payload: Payload): Validity {
  const currentDate = new Date();
  const iat = parseDate(payload.iat);
  const nbf = parseDate(payload.nbf);
  const exp = parseDate(payload.exp);
  const validFrom = iat && nbf ? (iat > nbf ? iat : nbf) : (iat ?? nbf);
  if (validFrom && exp && validFrom >= exp)
    return {
      message: "Token expires before being valid",
      state: State.NeverValid,
    };
  else if (validFrom && validFrom >= currentDate)
    return {
      message: `Token will be valid starting ${dateToString(validFrom)}`,
      state: State.NotYetValid,
    };
  else if (exp) {
    if (exp >= currentDate)
      return {
        message: `Token valid until ${dateToString(exp)}`,
        state: State.Valid,
      };
    else
      return {
        message: `Token expired since ${dateToString(exp)}`,
        state: State.Expired,
      };
  } else if (validFrom)
    return {
      message: `Token forever valid since ${dateToString(validFrom)}`,
      state: State.Valid,
    };
  else
    return {
      message: "Token doesn`t contain a validity period",
      state: State.Valid,
    };
}

function decodeJWT(token: string): DecodedJWT {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      throw new Error("Invalid token");
    }

    const decodedHeader = JSON.parse(base64UrlDecode(header));
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    const validity = checkValidity(decodedPayload);

    const decodedJWT: DecodedJWT = {
      header: decodedHeader,
      payload: decodedPayload,
      signature,
      validity,
    };

    return decodedJWT;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export {
  decodeJWT,
  checkValidity,
  dateToString,
  parseDate,
  base64UrlDecode,
  State,
};
