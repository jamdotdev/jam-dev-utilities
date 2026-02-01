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
  headers: string[],
  maxValuesPerFacet: number = 100
): Map<string, Facet> {
  const facetMaps = new Map<string, Map<string, number>>();
  headers.forEach((header) => facetMaps.set(header, new Map()));

  for (const row of rows) {
    for (const header of headers) {
      const value = row[header] || "(empty)";
      const valueMap = facetMaps.get(header)!;
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }
  }

  const facets = new Map<string, Facet>();
  for (const header of headers) {
    const valueMap = facetMaps.get(header)!;
    const values: FacetValue[] = Array.from(valueMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxValuesPerFacet);

    facets.set(header, { column: header, values });
  }

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

export function detectIfLogsFile(headers: string[], rows: LogEntry[]): boolean {
  const logRelatedHeaders = [
    "log",
    "message",
    "content",
    "service",
    "host",
    "level",
    "severity",
    "error",
    "trace",
    "span",
  ];

  const headersLower = headers.map((h) => h.toLowerCase());
  const hasLogHeaders = headersLower.some((h) =>
    logRelatedHeaders.some((lh) => h.includes(lh))
  );

  const hasTimestampColumn =
    headersLower.some(
      (h) => h.includes("date") || h.includes("time") || h.includes("timestamp")
    ) ||
    (rows.length > 0 &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rows[0][headers[0]] || ""));

  const hasReasonableColumnCount = headers.length <= 8;

  if (hasLogHeaders && hasTimestampColumn) {
    return true;
  }

  if (hasTimestampColumn && hasReasonableColumnCount) {
    return true;
  }

  return false;
}

// High-cardinality column names that shouldn't become facets
const HIGH_CARDINALITY_PATTERNS = [
  "content",
  "message",
  "body",
  "description",
  "text",
  "log",
  "details",
  "payload",
  "request",
  "response",
  "url",
  "path",
  "query",
  "id",
  "uuid",
  "guid",
  "email",
  "phone",
  "address",
  "name",
  "title",
  "comment",
  "note",
  "website",
];

// Columns that are good for faceting in logs
const FACET_FRIENDLY_PATTERNS = [
  "service",
  "host",
  "level",
  "severity",
  "status",
  "type",
  "category",
  "source",
  "environment",
  "env",
  "region",
  "version",
  "method",
  "code",
  "country",
  "city",
  "company",
];

function isHighCardinalityColumn(header: string): boolean {
  const headerLower = header.toLowerCase();
  return HIGH_CARDINALITY_PATTERNS.some((pattern) =>
    headerLower.includes(pattern)
  );
}

function isFacetFriendlyColumn(header: string): boolean {
  const headerLower = header.toLowerCase();
  return FACET_FRIENDLY_PATTERNS.some((pattern) =>
    headerLower.includes(pattern)
  );
}

export interface SmartFacetResult {
  facets: Map<string, Facet>;
  excludedColumns: string[];
}

export function buildSmartFacets(
  rows: LogEntry[],
  headers: string[],
  maxValuesPerFacet: number = 100
): SmartFacetResult {
  const totalRows = rows.length;
  const excludedColumns: string[] = [];

  // First, build all facets to analyze cardinality
  const facetMaps = new Map<string, Map<string, number>>();
  headers.forEach((header) => facetMaps.set(header, new Map()));

  for (const row of rows) {
    for (const header of headers) {
      const value = row[header] || "(empty)";
      const valueMap = facetMaps.get(header)!;
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }
  }

  const facets = new Map<string, Facet>();

  for (const header of headers) {
    const valueMap = facetMaps.get(header)!;
    const uniqueCount = valueMap.size;
    const cardinalityRatio = totalRows > 0 ? uniqueCount / totalRows : 1;

    // Determine if this column should be a facet
    let shouldInclude = false;

    // Always include facet-friendly columns if they have reasonable cardinality
    if (isFacetFriendlyColumn(header)) {
      shouldInclude = uniqueCount <= 100 && uniqueCount > 1;
    }
    // Exclude high-cardinality pattern columns
    else if (isHighCardinalityColumn(header)) {
      shouldInclude = false;
    }
    // For other columns, use smart heuristics
    else {
      // Include if: low cardinality ratio AND reasonable unique count
      // - Less than 30% unique values (good for grouping)
      // - Or less than 50 unique values total
      // - And more than 1 unique value (otherwise pointless)
      shouldInclude =
        uniqueCount > 1 &&
        (cardinalityRatio < 0.3 || uniqueCount <= 50) &&
        uniqueCount <= 100;
    }

    if (shouldInclude) {
      const values: FacetValue[] = Array.from(valueMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, maxValuesPerFacet);

      facets.set(header, { column: header, values });
    } else if (uniqueCount > 1) {
      excludedColumns.push(header);
    }
  }

  return { facets, excludedColumns };
}
