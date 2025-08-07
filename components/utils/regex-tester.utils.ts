export interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

export interface ParsedRegex {
  pattern: string;
  flags: RegexFlags;
}

export interface MatchDetail {
  match: string;
  index: number;
  length: number;
  groups: string[];
  namedGroups: Record<string, string>;
}

export interface RegexTestResult {
  isValid: boolean;
  matches: MatchDetail[];
  totalMatches: number;
  error?: string;
}

export const createRegex = (pattern: string): RegExp => {
  if (typeof pattern !== "string" || pattern.trim() === "") {
    throw new Error("Pattern must be a non-empty string");
  }

  let patternBody = "";
  let flags = "";

  if (pattern.startsWith("/")) {
    const lastSlashIndex = pattern.lastIndexOf("/");
    if (lastSlashIndex === 0) {
      throw new Error("Invalid regex: missing closing slash");
    }

    patternBody = pattern.slice(1, lastSlashIndex);
    flags = pattern.slice(lastSlashIndex + 1);

    if (flags !== "" && !/^[gimsuy]+$/.test(flags)) {
      throw new Error(`Invalid regex flags: ${flags}`);
    }

    if (new Set(flags).size !== flags.length) {
      throw new Error(`Duplicate flags are not allowed: ${flags}`);
    }
  } else {
    if (pattern.includes("/")) {
      throw new Error(
        "Invalid regex: slash (/) found within the pattern. If you intended to use regex delimiters, ensure the pattern starts and ends with a slash."
      );
    }
    patternBody = pattern;
  }

  try {
    return new RegExp(patternBody, flags);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const parseRegexPattern = (pattern: string): ParsedRegex => {
  let patternBody = "";
  let flagsString = "";

  if (pattern.startsWith("/")) {
    const lastSlashIndex = pattern.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      patternBody = pattern.slice(1, lastSlashIndex);
      flagsString = pattern.slice(lastSlashIndex + 1);
    } else {
      patternBody = pattern.slice(1);
    }
  } else {
    patternBody = pattern;
  }

  const flags: RegexFlags = {
    global: flagsString.includes("g"),
    ignoreCase: flagsString.includes("i"),
    multiline: flagsString.includes("m"),
    dotAll: flagsString.includes("s"),
    unicode: flagsString.includes("u"),
    sticky: flagsString.includes("y"),
  };

  return { pattern: patternBody, flags };
};

export const formatRegexWithFlags = (
  pattern: string,
  flags: RegexFlags
): string => {
  const flagsString = Object.entries(flags)
    .filter(([, value]) => value)
    .map(([key]) => {
      switch (key) {
        case "global":
          return "g";
        case "ignoreCase":
          return "i";
        case "multiline":
          return "m";
        case "dotAll":
          return "s";
        case "unicode":
          return "u";
        case "sticky":
          return "y";
        default:
          return "";
      }
    })
    .join("");

  return flagsString ? `/${pattern}/${flagsString}` : pattern;
};

export const testRegexPattern = (
  pattern: string,
  testString: string,
  flags: RegexFlags
): RegexTestResult => {
  try {
    const flagsString = Object.entries(flags)
      .filter(([, value]) => value)
      .map(([key]) => {
        switch (key) {
          case "global":
            return "g";
          case "ignoreCase":
            return "i";
          case "multiline":
            return "m";
          case "dotAll":
            return "s";
          case "unicode":
            return "u";
          case "sticky":
            return "y";
          default:
            return "";
        }
      })
      .join("");

    const regex = new RegExp(pattern, flagsString);
    const matches: MatchDetail[] = [];

    if (flags.global) {
      let match;
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups || {},
        });

        // Prevent infinite loop for zero-length matches
        if (match[0] === "") {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups || {},
        });
      }
    }

    return {
      isValid: true,
      matches,
      totalMatches: matches.length,
    };
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      totalMatches: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const commonPatterns = {
  email: {
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Email address",
    example: "user@example.com",
  },
  phone: {
    pattern: "\\+?[1-9]\\d{1,14}",
    description: "Phone number",
    example: "+1234567890",
  },
  url: {
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "URL",
    example: "https://example.com",
  },
  ipv4: {
    pattern:
      "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",
    description: "IPv4 address",
    example: "192.168.1.1",
  },
  date: {
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    description: "Date (YYYY-MM-DD)",
    example: "2023-12-25",
  },
  time: {
    pattern: "([01]?[0-9]|2[0-3]):[0-5][0-9]",
    description: "Time (HH:MM)",
    example: "14:30",
  },
  hexColor: {
    pattern: "#[a-fA-F0-9]{6}",
    description: "Hex color",
    example: "#FF5733",
  },
  creditCard: {
    pattern: "\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}",
    description: "Credit card number",
    example: "1234 5678 9012 3456",
  },
};
