export type SqlSummaryProvider = "openai" | "anthropic";

export type SqlRiskSeverity = "low" | "medium" | "high";

export interface SqlRiskFlag {
  id: string;
  title: string;
  description: string;
  severity: SqlRiskSeverity;
}

export interface SqlSummaryResult {
  summary: string;
  cautions: string[];
}

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

const SUMMARY_SYSTEM_PROMPT =
  "You are a senior database engineer. Return JSON only with keys: summary (string, <= 2 sentences) and cautions (array of short strings). No markdown, no code fences.";

const SUMMARY_USER_PROMPT = (sql: string) =>
  `Analyze this SQL and respond with JSON only:\n${sql}`;

const ensureString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const parseJsonFromText = (text: string): SqlSummaryResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { summary: "", cautions: [] };
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(slice);
      return {
        summary: ensureString(parsed.summary),
        cautions: Array.isArray(parsed.cautions)
          ? parsed.cautions.map(ensureString).filter(Boolean)
          : [],
      };
    } catch (error) {
      // fall through to plain text fallback
    }
  }

  return { summary: trimmed, cautions: [] };
};

export async function summarizeSqlWithLLM(
  sql: string,
  provider: SqlSummaryProvider,
  apiKey: string
): Promise<SqlSummaryResult> {
  if (!apiKey) {
    throw new Error("Missing API key");
  }

  if (!sql.trim()) {
    return { summary: "", cautions: [] };
  }

  if (provider === "openai") {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: SUMMARY_USER_PROMPT(sql) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    const data = await response.json();
    const content = ensureString(data?.choices?.[0]?.message?.content);
    return parseJsonFromText(content);
  }

  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      temperature: 0.2,
      max_tokens: 400,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: SUMMARY_USER_PROMPT(sql) }],
    }),
  });

  if (!response.ok) {
    throw new Error("Anthropic request failed");
  }

  const data = await response.json();
  const content = ensureString(data?.content?.[0]?.text);
  return parseJsonFromText(content);
}

const stripCommentsPreserveStrings = (sql: string): string => {
  let result = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;

  while (i < sql.length) {
    const char = sql[i];
    const next = i + 1 < sql.length ? sql[i + 1] : "";

    if (inSingle) {
      result += char;
      if (char === "'" && next === "'") {
        result += next;
        i += 2;
        continue;
      }
      if (char === "'") {
        inSingle = false;
      }
      i++;
      continue;
    }

    if (inDouble) {
      result += char;
      if (char === '"' && next === '"') {
        result += next;
        i += 2;
        continue;
      }
      if (char === '"') {
        inDouble = false;
      }
      i++;
      continue;
    }

    if (char === "'" && !inDouble) {
      inSingle = true;
      result += char;
      i++;
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = true;
      result += char;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      i += 2;
      while (i < sql.length - 1) {
        if (sql[i] === "*" && sql[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      i += 2;
      while (i < sql.length && sql[i] !== "\n" && sql[i] !== "\r") {
        i++;
      }
      continue;
    }

    result += char;
    i++;
  }

  return result;
};

const splitStatements = (sql: string): string[] => {
  const statements: string[] = [];
  let buffer = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = i + 1 < sql.length ? sql[i + 1] : "";

    if (inSingle) {
      buffer += char;
      if (char === "'" && next === "'") {
        buffer += next;
        i++;
        continue;
      }
      if (char === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      buffer += char;
      if (char === '"' && next === '"') {
        buffer += next;
        i++;
        continue;
      }
      if (char === '"') inDouble = false;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      buffer += char;
      continue;
    }

    if (char === '"') {
      inDouble = true;
      buffer += char;
      continue;
    }

    if (char === ";") {
      if (buffer.trim()) statements.push(buffer.trim());
      buffer = "";
      continue;
    }

    buffer += char;
  }

  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
};

const normalizeForAnalysis = (sql: string): string =>
  stripCommentsPreserveStrings(sql)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const extractClause = (statement: string, clause: string): string => {
  const regex = new RegExp(
    `${clause}\\s+(.+?)(where|group by|order by|limit|having|$)`,
    "i"
  );
  const match = statement.match(regex);
  return match ? match[1].trim() : "";
};

export function deriveSqlRisks(sql: string): SqlRiskFlag[] {
  const risks: SqlRiskFlag[] = [];
  const withoutComments = stripCommentsPreserveStrings(sql);
  const statements = splitStatements(withoutComments);

  statements.forEach((statement, index) => {
    const normalized = normalizeForAnalysis(statement);
    const statementLabel = statements.length > 1 ? `Statement ${index + 1}` : "";

    const addRisk = (risk: Omit<SqlRiskFlag, "id">) => {
      risks.push({
        id: `${risk.title}-${index}`,
        ...risk,
      });
    };

    if (/^\s*update\b/.test(normalized) && !/\bwhere\b/.test(normalized)) {
      addRisk({
        title: "UPDATE without WHERE",
        description: `${statementLabel} updates all rows without a filter.`,
        severity: "high",
      });
    }

    if (/^\s*delete\b/.test(normalized) && !/\bwhere\b/.test(normalized)) {
      addRisk({
        title: "DELETE without WHERE",
        description: `${statementLabel} deletes all rows without a filter.`,
        severity: "high",
      });
    }

    const fromClause = extractClause(statement, "from");
    const hasCommaJoin = /,/.test(fromClause);
    const hasJoinKeyword = /\bjoin\b/i.test(statement);
    const hasWhere = /\bwhere\b/i.test(statement);

    if (hasCommaJoin && !hasJoinKeyword && !hasWhere) {
      addRisk({
        title: "Possible Cartesian join",
        description: `${statementLabel} uses multiple tables without join conditions.`,
        severity: "high",
      });
    }

    if (
      /\bselect\s+\*/i.test(statement) &&
      (hasCommaJoin || hasJoinKeyword)
    ) {
      addRisk({
        title: "SELECT * on multi-table query",
        description: `${statementLabel} selects all columns across multiple tables.`,
        severity: "medium",
      });
    }

    if (/like\s+['"]%.*%['"]/i.test(statement)) {
      addRisk({
        title: "Leading wildcard LIKE",
        description: `${statementLabel} uses LIKE with leading wildcard, which can be slow.`,
        severity: "medium",
      });
    }

    const whereClause = extractClause(statement, "where");
    if (whereClause && /\sor\s/i.test(whereClause) && !/[()]/.test(whereClause)) {
      addRisk({
        title: "OR chain without grouping",
        description: `${statementLabel} has OR conditions without parentheses.`,
        severity: "low",
      });
    }

    if (/order\s+by\s+(rand|random)\s*\(\s*\)/i.test(statement)) {
      addRisk({
        title: "ORDER BY RAND()",
        description: `${statementLabel} uses random ordering, which can be expensive.`,
        severity: "medium",
      });
    }
  });

  return risks;
}
