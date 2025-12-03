export const escapeRegexPattern = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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
