type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface GeneratedInterface {
  name: string;
  body: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeKey(key: string): string {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
}

function toInterfaceName(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9_$]/g, " ")
    .split(/[\s_-]+/)
    .map(capitalize)
    .join("");
}

function inferType(
  value: JsonValue,
  keyName: string,
  interfaces: GeneratedInterface[]
): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "unknown[]";
    }

    const itemTypes = value.map((item) =>
      inferType(item, keyName, interfaces)
    );
    const unique = Array.from(new Set(itemTypes));

    if (unique.length === 1) {
      return `${unique[0]}[]`;
    }

    return `(${unique.join(" | ")})[]`;
  }

  if (typeof value === "object") {
    const interfaceName = toInterfaceName(keyName);
    generateInterface(interfaceName, value as Record<string, JsonValue>, interfaces);
    return interfaceName;
  }

  return typeof value;
}

function generateInterface(
  name: string,
  obj: Record<string, JsonValue>,
  interfaces: GeneratedInterface[]
): void {
  const existing = interfaces.find((i) => i.name === name);
  if (existing) {
    return;
  }

  // Reserve the name to prevent infinite recursion
  const placeholder: GeneratedInterface = { name, body: "" };
  interfaces.push(placeholder);

  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const type = inferType(value, capitalize(key), interfaces);
    const safeKey = sanitizeKey(key);
    lines.push(`  ${safeKey}: ${type};`);
  }

  placeholder.body = `interface ${name} {\n${lines.join("\n")}\n}`;
}

export function jsonToTypeScript(
  jsonString: string,
  rootName: string = "Root"
): string {
  const parsed = JSON.parse(jsonString);

  const interfaces: GeneratedInterface[] = [];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return `type ${rootName} = unknown[];`;
    }

    const firstItem = parsed[0];
    if (typeof firstItem === "object" && firstItem !== null && !Array.isArray(firstItem)) {
      generateInterface(rootName, firstItem as Record<string, JsonValue>, interfaces);
      return (
        interfaces
          .map((i) => i.body)
          .reverse()
          .join("\n\n") + `\n\ntype ${rootName}Array = ${rootName}[];`
      );
    }

    const type = inferType(parsed, rootName, interfaces);
    if (interfaces.length > 0) {
      return (
        interfaces.map((i) => i.body).reverse().join("\n\n") +
        `\n\ntype ${rootName}Alias = ${type};`
      );
    }
    return `type ${rootName} = ${type};`;
  }

  if (typeof parsed === "object" && parsed !== null) {
    generateInterface(rootName, parsed as Record<string, JsonValue>, interfaces);
    return interfaces.map((i) => i.body).reverse().join("\n\n");
  }

  return `type ${rootName} = ${typeof parsed};`;
}
