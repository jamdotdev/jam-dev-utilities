export interface RegexFlags {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
  u: boolean;
  y: boolean;
}

export interface CaptureGroup {
  index: number;
  name: string | null;
  pattern: string;
  start: number;
  end: number;
  content: string | null;
  nested: CaptureGroup[];
}

export interface RegexMatch {
  fullMatch: string;
  index: number;
  groups: { [key: string]: string | undefined };
  captureGroups: (string | undefined)[];
}

export interface PatternComponent {
  type: string;
  value: string;
  explanation: string;
  start: number;
  end: number;
}

export interface MatchStats {
  totalMatches: number;
  matchPositions: { start: number; end: number; text: string }[];
  averageMatchLength: number;
  executionTime: number;
  uniqueMatches: number;
}

export const FLAG_DESCRIPTIONS: Record<
  keyof RegexFlags,
  { name: string; description: string }
> = {
  g: {
    name: "Global",
    description: "Find all matches rather than stopping after the first match",
  },
  i: {
    name: "Case Insensitive",
    description: "Match letters regardless of case (a matches A)",
  },
  m: {
    name: "Multiline",
    description: "^ and $ match start/end of each line, not just the string",
  },
  s: {
    name: "DotAll",
    description: "Dot (.) matches newline characters as well",
  },
  u: {
    name: "Unicode",
    description: "Enable full Unicode support for the pattern",
  },
  y: {
    name: "Sticky",
    description: "Match only from the lastIndex position in the target string",
  },
};

export const PRESET_PATTERNS = [
  {
    name: "Email",
    pattern: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/gm",
    testString: "test@example.com\ninvalid-email\nuser.name+tag@domain.co.uk",
  },
  {
    name: "URL",
    pattern: "/https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*/gi",
    testString:
      "Visit https://example.com/path?query=1\nOr http://sub.domain.org/page#section",
  },
  {
    name: "Phone (US)",
    pattern: "/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/g",
    testString: "(555) 123-4567\n555.123.4567\n555-123-4567",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "/\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])/g",
    testString: "2024-01-15\n2023-12-31\n2024-13-45 (invalid)",
  },
  {
    name: "IPv4 Address",
    pattern:
      "/\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b/g",
    testString: "192.168.1.1\n10.0.0.255\n256.1.1.1 (invalid)",
  },
  {
    name: "Hex Color",
    pattern: "/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b/g",
    testString: "#FF5733\n#abc\n#GGGGGG (invalid)",
  },
  {
    name: "HTML Tag",
    pattern: "/<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)/gi",
    testString: '<div class="container">Content</div>\n<img src="image.png" />',
  },
  {
    name: "Credit Card",
    pattern: "/\\b(?:\\d{4}[- ]?){3}\\d{4}\\b/g",
    testString: "4111-1111-1111-1111\n4111 1111 1111 1111\n4111111111111111",
  },
];

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

export const parseFlags = (pattern: string): RegexFlags => {
  const flags: RegexFlags = {
    g: false,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  };

  if (pattern.startsWith("/")) {
    const lastSlashIndex = pattern.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      const flagStr = pattern.slice(lastSlashIndex + 1);
      for (const flag of flagStr) {
        if (flag in flags) {
          flags[flag as keyof RegexFlags] = true;
        }
      }
    }
  }

  return flags;
};

export const buildPatternWithFlags = (
  patternBody: string,
  flags: RegexFlags
): string => {
  const flagStr = Object.entries(flags)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag)
    .join("");
  return `/${patternBody}/${flagStr}`;
};

export const getPatternBody = (pattern: string): string => {
  if (pattern.startsWith("/")) {
    const lastSlashIndex = pattern.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      return pattern.slice(1, lastSlashIndex);
    }
  }
  return pattern;
};

export const findCaptureGroups = (pattern: string): CaptureGroup[] => {
  const patternBody = getPatternBody(pattern);
  const groups: CaptureGroup[] = [];
  const stack: { start: number; name: string | null }[] = [];
  let i = 0;

  while (i < patternBody.length) {
    if (patternBody[i] === "\\") {
      i += 2;
      continue;
    }

    if (patternBody[i] === "[") {
      let j = i + 1;
      while (j < patternBody.length && patternBody[j] !== "]") {
        if (patternBody[j] === "\\") j++;
        j++;
      }
      i = j + 1;
      continue;
    }

    if (patternBody[i] === "(") {
      let name: string | null = null;
      let isCapturing = true;

      if (patternBody.slice(i + 1, i + 3) === "?:") {
        isCapturing = false;
      } else if (
        patternBody.slice(i + 1, i + 4) === "?<" &&
        patternBody[i + 4] !== "=" &&
        patternBody[i + 4] !== "!"
      ) {
        const nameEnd = patternBody.indexOf(">", i + 4);
        if (nameEnd !== -1) {
          name = patternBody.slice(i + 4, nameEnd);
        }
      } else if (
        patternBody[i + 1] === "?" &&
        (patternBody[i + 2] === "=" ||
          patternBody[i + 2] === "!" ||
          patternBody[i + 2] === "<")
      ) {
        isCapturing = false;
      }

      if (isCapturing) {
        stack.push({ start: i, name });
      } else {
        stack.push({ start: -1, name: null });
      }
    } else if (patternBody[i] === ")") {
      const groupInfo = stack.pop();
      if (groupInfo && groupInfo.start !== -1) {
        const groupPattern = patternBody.slice(groupInfo.start, i + 1);
        groups.push({
          index: groups.length + 1,
          name: groupInfo.name,
          pattern: groupPattern,
          start: groupInfo.start,
          end: i + 1,
          content: null,
          nested: [],
        });
      }
    }

    i++;
  }

  return groups.sort((a, b) => a.start - b.start);
};

export const explainPattern = (pattern: string): PatternComponent[] => {
  const patternBody = getPatternBody(pattern);
  const components: PatternComponent[] = [];
  let i = 0;

  const explanations: Record<string, string> = {
    "^": "Start of string/line",
    $: "End of string/line",
    ".": "Any character (except newline)",
    "*": "Zero or more of the preceding",
    "+": "One or more of the preceding",
    "?": "Zero or one of the preceding (optional)",
    "\\d": "Any digit (0-9)",
    "\\D": "Any non-digit",
    "\\w": "Any word character (a-z, A-Z, 0-9, _)",
    "\\W": "Any non-word character",
    "\\s": "Any whitespace character",
    "\\S": "Any non-whitespace character",
    "\\b": "Word boundary",
    "\\B": "Non-word boundary",
    "\\n": "Newline",
    "\\t": "Tab",
    "\\r": "Carriage return",
    "|": "Alternation (OR)",
  };

  while (i < patternBody.length) {
    const char = patternBody[i];

    if (char === "\\") {
      const escaped = patternBody.slice(i, i + 2);
      const explanation =
        explanations[escaped] || `Escaped character: ${patternBody[i + 1]}`;
      components.push({
        type: "escape",
        value: escaped,
        explanation,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    if (char === "[") {
      let j = i + 1;
      const negated = patternBody[j] === "^";
      while (j < patternBody.length && patternBody[j] !== "]") {
        if (patternBody[j] === "\\") j++;
        j++;
      }
      const charClass = patternBody.slice(i, j + 1);
      const explanation = negated
        ? `Character class (NOT): matches any character NOT in ${charClass}`
        : `Character class: matches any character in ${charClass}`;
      components.push({
        type: "characterClass",
        value: charClass,
        explanation,
        start: i,
        end: j + 1,
      });
      i = j + 1;
      continue;
    }

    if (char === "(") {
      let groupType = "Capturing group";
      let skipChars = 1;

      if (patternBody.slice(i + 1, i + 3) === "?:") {
        groupType = "Non-capturing group";
        skipChars = 3;
      } else if (patternBody.slice(i + 1, i + 3) === "?=") {
        groupType = "Positive lookahead";
        skipChars = 3;
      } else if (patternBody.slice(i + 1, i + 3) === "?!") {
        groupType = "Negative lookahead";
        skipChars = 3;
      } else if (patternBody.slice(i + 1, i + 4) === "?<=") {
        groupType = "Positive lookbehind";
        skipChars = 4;
      } else if (patternBody.slice(i + 1, i + 4) === "?<!") {
        groupType = "Negative lookbehind";
        skipChars = 4;
      } else if (patternBody.slice(i + 1, i + 3) === "?<") {
        const nameEnd = patternBody.indexOf(">", i + 3);
        if (nameEnd !== -1) {
          const name = patternBody.slice(i + 3, nameEnd);
          groupType = `Named capturing group: "${name}"`;
        }
      }

      components.push({
        type: "groupStart",
        value: "(",
        explanation: groupType,
        start: i,
        end: i + skipChars,
      });
      i += skipChars;
      continue;
    }

    if (char === ")") {
      components.push({
        type: "groupEnd",
        value: ")",
        explanation: "End of group",
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    if (char === "{") {
      let j = i + 1;
      while (j < patternBody.length && patternBody[j] !== "}") j++;
      const quantifier = patternBody.slice(i, j + 1);
      const inner = quantifier.slice(1, -1);
      let explanation = "";

      if (inner.includes(",")) {
        const [min, max] = inner.split(",");
        if (max === "") {
          explanation = `${min} or more of the preceding`;
        } else {
          explanation = `Between ${min} and ${max} of the preceding`;
        }
      } else {
        explanation = `Exactly ${inner} of the preceding`;
      }

      components.push({
        type: "quantifier",
        value: quantifier,
        explanation,
        start: i,
        end: j + 1,
      });
      i = j + 1;
      continue;
    }

    if (explanations[char]) {
      components.push({
        type: "special",
        value: char,
        explanation: explanations[char],
        start: i,
        end: i + 1,
      });
    } else {
      components.push({
        type: "literal",
        value: char,
        explanation: `Literal character: "${char}"`,
        start: i,
        end: i + 1,
      });
    }
    i++;
  }

  return components;
};

export const getMatchStats = (
  pattern: string,
  testString: string
): MatchStats => {
  const startTime = performance.now();
  const stats: MatchStats = {
    totalMatches: 0,
    matchPositions: [],
    averageMatchLength: 0,
    executionTime: 0,
    uniqueMatches: 0,
  };

  try {
    const regex = createRegex(pattern);
    const globalRegex = new RegExp(
      regex.source,
      regex.flags.includes("g") ? regex.flags : regex.flags + "g"
    );

    let match;
    const uniqueSet = new Set<string>();
    let totalLength = 0;

    while ((match = globalRegex.exec(testString)) !== null) {
      stats.totalMatches++;
      stats.matchPositions.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
      uniqueSet.add(match[0]);
      totalLength += match[0].length;

      if (match[0].length === 0) {
        globalRegex.lastIndex++;
      }
    }

    stats.uniqueMatches = uniqueSet.size;
    stats.averageMatchLength =
      stats.totalMatches > 0 ? totalLength / stats.totalMatches : 0;
  } catch {
    // Pattern is invalid, return empty stats
  }

  stats.executionTime = performance.now() - startTime;
  return stats;
};

export const getDetailedMatches = (
  pattern: string,
  testString: string
): RegexMatch[] => {
  const matches: RegexMatch[] = [];

  try {
    const regex = createRegex(pattern);
    const globalRegex = new RegExp(
      regex.source,
      regex.flags.includes("g") ? regex.flags : regex.flags + "g"
    );

    let match;
    while ((match = globalRegex.exec(testString)) !== null) {
      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.groups || {},
        captureGroups: match.slice(1),
      });

      if (match[0].length === 0) {
        globalRegex.lastIndex++;
      }
    }
  } catch {
    // Pattern is invalid, return empty matches
  }

  return matches;
};

export const CHEAT_SHEET = {
  "Character Classes": [
    { syntax: ".", description: "Any character except newline" },
    { syntax: "\\w", description: "Word character [a-zA-Z0-9_]" },
    { syntax: "\\W", description: "Non-word character" },
    { syntax: "\\d", description: "Digit [0-9]" },
    { syntax: "\\D", description: "Non-digit" },
    { syntax: "\\s", description: "Whitespace" },
    { syntax: "\\S", description: "Non-whitespace" },
    { syntax: "[abc]", description: "Any of a, b, or c" },
    { syntax: "[^abc]", description: "Not a, b, or c" },
    { syntax: "[a-z]", description: "Character range a-z" },
  ],
  Anchors: [
    { syntax: "^", description: "Start of string/line" },
    { syntax: "$", description: "End of string/line" },
    { syntax: "\\b", description: "Word boundary" },
    { syntax: "\\B", description: "Non-word boundary" },
  ],
  Quantifiers: [
    { syntax: "*", description: "0 or more" },
    { syntax: "+", description: "1 or more" },
    { syntax: "?", description: "0 or 1 (optional)" },
    { syntax: "{n}", description: "Exactly n" },
    { syntax: "{n,}", description: "n or more" },
    { syntax: "{n,m}", description: "Between n and m" },
    { syntax: "*?", description: "0 or more (lazy)" },
    { syntax: "+?", description: "1 or more (lazy)" },
  ],
  "Groups & Lookaround": [
    { syntax: "(abc)", description: "Capturing group" },
    { syntax: "(?:abc)", description: "Non-capturing group" },
    { syntax: "(?<name>abc)", description: "Named group" },
    { syntax: "(?=abc)", description: "Positive lookahead" },
    { syntax: "(?!abc)", description: "Negative lookahead" },
    { syntax: "(?<=abc)", description: "Positive lookbehind" },
    { syntax: "(?<!abc)", description: "Negative lookbehind" },
    { syntax: "|", description: "Alternation (OR)" },
  ],
};
