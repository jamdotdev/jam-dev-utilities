export interface LogEntry {
  [key: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: LogEntry[];
}

export type LogLevel = "error" | "warning" | "info" | "debug" | "default";

export interface ColumnFilter {
  column: string;
  selectedValues: string[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface Facet {
  column: string;
  values: FacetValue[];
}

const ERROR_PATTERNS = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bfailure\b/i,
  /\bexception\b/i,
  /\bcritical\b/i,
  /\bfatal\b/i,
  /\b5\d{2}\b/,
];

const WARNING_PATTERNS = [
  /\bwarn(ing)?\b/i,
  /\bcaution\b/i,
  /\bdeprecated\b/i,
  /\b4\d{2}\b/,
];

const DEBUG_PATTERNS = [/\bdebug\b/i, /\btrace\b/i, /\bverbose\b/i];

const INFO_PATTERNS = [/\binfo\b/i, /\bnotice\b/i];

export function detectLogLevel(row: LogEntry): LogLevel {
  const rowText = Object.values(row).join(" ");

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(rowText)) {
      return "error";
    }
  }

  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(rowText)) {
      return "warning";
    }
  }

  for (const pattern of DEBUG_PATTERNS) {
    if (pattern.test(rowText)) {
      return "debug";
    }
  }

  for (const pattern of INFO_PATTERNS) {
    if (pattern.test(rowText)) {
      return "info";
    }
  }

  return "default";
}

export function getLogLevelColor(level: LogLevel): string {
  switch (level) {
    case "error":
      return "bg-red-500/10 border-l-2 border-l-red-500";
    case "warning":
      return "bg-yellow-500/10 border-l-2 border-l-yellow-500";
    case "info":
      return "bg-blue-500/5 border-l-2 border-l-blue-500";
    case "debug":
      return "bg-gray-500/5 border-l-2 border-l-gray-400";
    default:
      return "";
  }
}

export function getLogLevelBadgeColor(level: LogLevel): string {
  switch (level) {
    case "error":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    case "warning":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "info":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "debug":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

export function parseCSV(content: string): ParsedCSV {
  const lines = content.trim().split(/\r?\n/);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter);

  const rows: LogEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    const row: LogEntry = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row);
  }

  return { headers, rows };
}

function detectDelimiter(line: string): string {
  const tabCount = (line.match(/\t/g) || []).length;
  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;

  if (tabCount >= commaCount && tabCount >= semicolonCount) {
    return "\t";
  }
  if (semicolonCount > commaCount) {
    return ";";
  }
  return ",";
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function buildFacets(
  rows: LogEntry[],
  headers: string[]
): Map<string, Facet> {
  const facets = new Map<string, Facet>();

  headers.forEach((header) => {
    const valueCounts = new Map<string, number>();

    rows.forEach((row) => {
      const value = row[header] || "(empty)";
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    });

    const values: FacetValue[] = Array.from(valueCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    facets.set(header, { column: header, values });
  });

  return facets;
}

export function filterRows(
  rows: LogEntry[],
  filters: ColumnFilter[],
  searchQuery: string
): LogEntry[] {
  let result = rows;

  filters.forEach((filter) => {
    if (filter.selectedValues.length > 0) {
      result = result.filter((row) => {
        const value = row[filter.column] || "(empty)";
        return filter.selectedValues.includes(value);
      });
    }
  });

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter((row) => {
      return Object.values(row).some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }

  return result;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return dateString;
  }
}

export function isDateColumn(header: string, sampleValue: string): boolean {
  const dateHeaders = ["date", "time", "timestamp", "created", "updated", "at"];
  const headerLower = header.toLowerCase();

  if (dateHeaders.some((h) => headerLower.includes(h))) {
    return true;
  }

  if (sampleValue) {
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return isoPattern.test(sampleValue);
  }

  return false;
}
