export type SerializedValue =
  | { type: "string"; value: string }
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "bool"; value: boolean }
  | { type: "null" }
  | {
      type: "array";
      entries: Array<{ key: SerializedValue; value: SerializedValue }>;
    }
  | {
      type: "object";
      className: string;
      properties: Array<{ key: SerializedValue; value: SerializedValue }>;
    };

class UnserializeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnserializeError";
  }
}

class Parser {
  private pos = 0;
  private readonly parsedValues: SerializedValue[] = [];

  constructor(private input: string) {}

  parse(): SerializedValue {
    const value = this.readValue();
    if (this.pos !== this.input.length) {
      throw new UnserializeError(
        `Unexpected trailing characters at position ${this.pos}`
      );
    }
    return value;
  }

  private readValue(): SerializedValue {
    if (this.pos >= this.input.length) {
      throw new UnserializeError("Unexpected end of input");
    }

    const type = this.input[this.pos];

    switch (type) {
      case "s":
        return this.readString();
      case "i":
        return this.readInt();
      case "d":
        return this.readFloat();
      case "b":
        return this.readBool();
      case "N":
        return this.readNull();
      case "a":
        return this.readArray();
      case "O":
        return this.readObject();
      case "r":
      case "R":
        return this.readReference();
      default:
        throw new UnserializeError(
          `Unknown type "${type}" at position ${this.pos}`
        );
    }
  }

  private expect(char: string) {
    if (this.input[this.pos] !== char) {
      throw new UnserializeError(
        `Expected "${char}" at position ${this.pos}, got "${this.input[this.pos]}"`
      );
    }
    this.pos++;
  }

  private readUntil(char: string): string {
    const start = this.pos;
    while (this.pos < this.input.length && this.input[this.pos] !== char) {
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      throw new UnserializeError(`Expected "${char}" but reached end of input`);
    }

    return this.input.slice(start, this.pos);
  }

  private readString(registerValue = true): SerializedValue {
    this.expect("s");
    this.expect(":");
    const lenStr = this.readUntil(":");
    const len = parseInt(lenStr, 10);
    if (Number.isNaN(len) || len < 0) {
      throw new UnserializeError(`Invalid string length: "${lenStr}"`);
    }

    this.expect(":");
    this.expect('"');
    const value = this.readUtf8ByteLengthString(len);
    this.expect('"');
    this.expect(";");

    const parsed: SerializedValue = { type: "string", value };
    if (registerValue) {
      this.parsedValues.push(parsed);
    }
    return parsed;
  }

  private readInt(registerValue = true): SerializedValue {
    this.expect("i");
    this.expect(":");
    const numStr = this.readUntil(";");
    this.expect(";");
    const value = parseInt(numStr, 10);
    if (Number.isNaN(value)) {
      throw new UnserializeError(`Invalid integer value: "${numStr}"`);
    }

    const parsed: SerializedValue = { type: "int", value };
    if (registerValue) {
      this.parsedValues.push(parsed);
    }
    return parsed;
  }

  private readFloat(): SerializedValue {
    this.expect("d");
    this.expect(":");
    const numStr = this.readUntil(";");
    this.expect(";");

    let value: number;
    if (numStr === "INF") value = Infinity;
    else if (numStr === "-INF") value = -Infinity;
    else if (numStr === "NAN") value = NaN;
    else {
      value = parseFloat(numStr);
      if (Number.isNaN(value)) {
        throw new UnserializeError(`Invalid float value: "${numStr}"`);
      }
    }

    const parsed: SerializedValue = { type: "float", value };
    this.parsedValues.push(parsed);
    return parsed;
  }

  private readBool(): SerializedValue {
    this.expect("b");
    this.expect(":");
    const val = this.readUntil(";");
    this.expect(";");
    if (val !== "0" && val !== "1") {
      throw new UnserializeError(`Invalid boolean value: "${val}"`);
    }

    const parsed: SerializedValue = { type: "bool", value: val === "1" };
    this.parsedValues.push(parsed);
    return parsed;
  }

  private readNull(): SerializedValue {
    this.expect("N");
    this.expect(";");
    const parsed: SerializedValue = { type: "null" };
    this.parsedValues.push(parsed);
    return parsed;
  }

  private readArray(): SerializedValue {
    this.expect("a");
    this.expect(":");
    const countStr = this.readUntil(":");
    const count = parseInt(countStr, 10);
    if (Number.isNaN(count) || count < 0) {
      throw new UnserializeError(`Invalid array count: "${countStr}"`);
    }
    this.expect(":");
    this.expect("{");

    const parsed: {
      type: "array";
      entries: Array<{ key: SerializedValue; value: SerializedValue }>;
    } = {
      type: "array",
      entries: [],
    };
    this.parsedValues.push(parsed);

    const entries: Array<{ key: SerializedValue; value: SerializedValue }> = [];
    for (let i = 0; i < count; i++) {
      const key = this.readArrayKey();
      const value = this.readValue();
      entries.push({ key, value });
    }

    this.expect("}");
    parsed.entries = entries;
    return parsed;
  }

  private readObject(): SerializedValue {
    this.expect("O");
    this.expect(":");
    const classNameLenStr = this.readUntil(":");
    const classNameLen = parseInt(classNameLenStr, 10);
    if (Number.isNaN(classNameLen) || classNameLen < 0) {
      throw new UnserializeError(
        `Invalid class name length: "${classNameLenStr}"`
      );
    }
    this.expect(":");
    this.expect('"');
    const className = this.readUtf8ByteLengthString(classNameLen);
    this.expect('"');
    this.expect(":");
    const countStr = this.readUntil(":");
    const count = parseInt(countStr, 10);
    if (Number.isNaN(count) || count < 0) {
      throw new UnserializeError(
        `Invalid object property count: "${countStr}"`
      );
    }
    this.expect(":");
    this.expect("{");

    const parsed: {
      type: "object";
      className: string;
      properties: Array<{ key: SerializedValue; value: SerializedValue }>;
    } = {
      type: "object",
      className,
      properties: [],
    };
    this.parsedValues.push(parsed);

    const properties: Array<{ key: SerializedValue; value: SerializedValue }> =
      [];
    for (let i = 0; i < count; i++) {
      const key = this.readObjectKey();
      const value = this.readValue();
      properties.push({ key, value });
    }

    this.expect("}");
    parsed.properties = properties;
    return parsed;
  }

  private readReference(): SerializedValue {
    this.pos++; // skip "r" or "R"
    this.expect(":");
    const refStr = this.readUntil(";");
    this.expect(";");

    const refIndex = parseInt(refStr, 10);
    if (Number.isNaN(refIndex) || refIndex < 1) {
      throw new UnserializeError(`Invalid reference index: "${refStr}"`);
    }

    const referencedValue = this.parsedValues[refIndex - 1];
    if (!referencedValue) {
      throw new UnserializeError(`Reference index ${refIndex} does not exist`);
    }

    return referencedValue;
  }

  private readUtf8ByteLengthString(byteLength: number): string {
    const start = this.pos;
    let consumedBytes = 0;

    while (consumedBytes < byteLength) {
      if (this.pos >= this.input.length) {
        throw new UnserializeError(
          "Unexpected end of input while reading string bytes"
        );
      }

      const codePoint = this.input.codePointAt(this.pos);
      if (codePoint === undefined) {
        throw new UnserializeError("Invalid string code point");
      }

      const char = String.fromCodePoint(codePoint);
      const charByteLength = utf8ByteLength(char);
      consumedBytes += charByteLength;
      this.pos += char.length;
    }

    if (consumedBytes !== byteLength) {
      throw new UnserializeError(
        `String byte length mismatch. Expected ${byteLength}, got ${consumedBytes}`
      );
    }

    return this.input.slice(start, this.pos);
  }

  private readArrayKey(): SerializedValue {
    const keyType = this.input[this.pos];
    switch (keyType) {
      case "i":
        return this.readInt(false);
      case "s":
        return this.readString(false);
      default:
        throw new UnserializeError(
          `Invalid array key type "${keyType}" at position ${this.pos}`
        );
    }
  }

  private readObjectKey(): SerializedValue {
    const keyType = this.input[this.pos];
    if (keyType !== "s") {
      throw new UnserializeError(
        `Invalid object property key type "${keyType}" at position ${this.pos}`
      );
    }
    return this.readString(false);
  }
}

export function unserialize(input: string): SerializedValue {
  if (!input || input.trim() === "") {
    throw new UnserializeError("Please enter a serialized string.");
  }

  const parser = new Parser(input.trim());
  return parser.parse();
}

export function isValidSerialized(input: string): boolean {
  try {
    unserialize(input);
    return true;
  } catch {
    return false;
  }
}

function keyToString(key: SerializedValue): string {
  switch (key.type) {
    case "int":
      return String(key.value);
    case "string":
      return key.value;
    case "bool":
      return key.value ? "1" : "0";
    case "null":
      return "";
    case "float":
      return String(Math.trunc(key.value));
    default:
      return "";
  }
}

function utf8ByteLength(value: string): number {
  return encodeURIComponent(value).replace(/%[A-F\d]{2}/gi, "x").length;
}

export function formatPrintR(value: SerializedValue, indent = 0): string {
  const pad = " ".repeat(indent * 4);
  const innerPad = " ".repeat((indent + 1) * 4);

  switch (value.type) {
    case "string":
      return value.value;
    case "int":
    case "float":
      return String(value.value);
    case "bool":
      return value.value ? "1" : "";
    case "null":
      return "";
    case "array": {
      if (value.entries.length === 0) {
        return `Array\n${pad}(\n${pad})`;
      }

      let result = `Array\n${pad}(\n`;
      for (const entry of value.entries) {
        const k = keyToString(entry.key);
        const v = formatPrintR(entry.value, indent + 2);
        result += `${innerPad}[${k}] => ${v}\n`;
      }
      result += `${pad})`;
      return indent > 0 ? `${result}\n` : result;
    }
    case "object": {
      let result = `${value.className} Object\n${pad}(\n`;
      for (const property of value.properties) {
        const k = keyToString(property.key);
        const v = formatPrintR(property.value, indent + 2);
        result += `${innerPad}[${k}] => ${v}\n`;
      }
      result += `${pad})`;
      return indent > 0 ? `${result}\n` : result;
    }
  }
}

export function formatVarDump(value: SerializedValue, indent = 0): string {
  const pad = " ".repeat(indent * 2);
  const innerPad = " ".repeat((indent + 1) * 2);

  switch (value.type) {
    case "string":
      return `${pad}string(${utf8ByteLength(value.value)}) "${value.value}"`;
    case "int":
      return `${pad}int(${value.value})`;
    case "float":
      return `${pad}float(${value.value})`;
    case "bool":
      return `${pad}bool(${value.value ? "true" : "false"})`;
    case "null":
      return `${pad}NULL`;
    case "array": {
      let result = `${pad}array(${value.entries.length}) {\n`;
      for (const entry of value.entries) {
        const k = keyToString(entry.key);
        const keyBracket = entry.key.type === "int" ? `[${k}]` : `["${k}"]`;
        result += `${innerPad}${keyBracket}=>\n`;
        result += `${formatVarDump(entry.value, indent + 1)}\n`;
      }
      result += `${pad}}`;
      return result;
    }
    case "object": {
      let result = `${pad}object(${value.className})#1 (${value.properties.length}) {\n`;
      for (const property of value.properties) {
        const k = keyToString(property.key);
        result += `${innerPad}["${k}"]=>\n`;
        result += `${formatVarDump(property.value, indent + 1)}\n`;
      }
      result += `${pad}}`;
      return result;
    }
  }
}
