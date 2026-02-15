export type JsonlParseError = {
  lineNumber: number;
  columnNumber?: number;
  message: string;
  lineContent: string;
};

export type JsonlValidationResult = {
  totalLines: number;
  emptyLines: number;
  validLines: number;
  invalidLines: number;
  records: unknown[];
  errors: JsonlParseError[];
  keyFrequency: Record<string, number>;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const extractColumnNumber = (message: string) => {
  const columnMatch = message.match(/column\s+(\d+)/i);
  if (columnMatch) {
    const parsedColumn = Number(columnMatch[1]);
    return Number.isNaN(parsedColumn) ? undefined : parsedColumn;
  }

  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const parsedPosition = Number(positionMatch[1]);
    if (!Number.isNaN(parsedPosition)) {
      return parsedPosition + 1;
    }
  }

  return undefined;
};

export const parseJsonLines = (input: string): JsonlValidationResult => {
  if (input.trim() === "") {
    return {
      totalLines: 0,
      emptyLines: 0,
      validLines: 0,
      invalidLines: 0,
      records: [],
      errors: [],
      keyFrequency: {},
    };
  }

  const lines = input.split(/\r?\n/);
  const records: unknown[] = [];
  const errors: JsonlParseError[] = [];
  const keyFrequency: Record<string, number> = {};
  let emptyLines = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      emptyLines += 1;
      return;
    }

    try {
      const parsed = JSON.parse(trimmedLine);
      records.push(parsed);

      if (isPlainObject(parsed)) {
        Object.keys(parsed).forEach((key) => {
          keyFrequency[key] = (keyFrequency[key] || 0) + 1;
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      errors.push({
        lineNumber: index + 1,
        columnNumber: extractColumnNumber(message),
        message,
        lineContent: line,
      });
    }
  });

  const totalLines = lines.length - emptyLines;

  return {
    totalLines,
    emptyLines,
    validLines: records.length,
    invalidLines: errors.length,
    records,
    errors,
    keyFrequency,
  };
};

export const toJsonArrayString = (records: unknown[]) => {
  return JSON.stringify(records, null, 2);
};
