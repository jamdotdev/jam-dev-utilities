export type AiProvider = "openai" | "anthropic";

export interface AiRegexExample {
  text: string;
  matches: string[];
}

export interface AiRegexResult {
  pattern: string;
  flags: string;
  regex: string;
  explanation: string;
  examples: AiRegexExample[];
  warnings: string[];
  raw?: string;
}

export interface AiRegexRequest {
  description: string;
  sampleText?: string;
  expectedMatches?: string;
}

export interface AiRegexProviderRequest extends AiRegexRequest {
  provider: AiProvider;
  apiKey: string;
  model?: string;
}

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-haiku-20240307";

const buildPromptContext = (request: AiRegexRequest) => {
  const parts = [
    `Task: Generate a JavaScript-compatible regex for this description:`,
    request.description.trim(),
  ];

  if (request.sampleText?.trim()) {
    parts.push("", "Sample text:", request.sampleText.trim());
  }

  if (request.expectedMatches?.trim()) {
    parts.push("", "Expected matches:", request.expectedMatches.trim());
  }

  parts.push(
    "",
    "Return only valid JSON with the following fields:",
    `{"pattern":"...","flags":"gimsuy","regex":"/.../flags","explanation":"...","examples":[{"text":"...","matches":["..."]}],"warnings":["..."]}`,
    "Rules:",
    "- pattern should NOT include slashes.",
    "- flags should include only valid JS regex flags (gimsuy).",
    "- regex should include slashes + flags.",
    "- explanation should be concise and practical.",
    "- warnings should be empty array if none.",
    "- If unsure, include warnings explaining assumptions."
  );

  return parts.join("\n");
};

export const buildRegexPrompt = (request: AiRegexRequest) => ({
  system:
    "You are a senior engineer generating safe JavaScript regex patterns.",
  user: buildPromptContext(request),
});

const stripCodeFences = (input: string) => {
  const fenced = input.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return input.trim();
};

const extractJson = (input: string) => {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return input.slice(start, end + 1);
  }
  return input;
};

const buildRegexFromParts = (pattern: string, flags: string) => {
  const trimmedPattern = pattern.trim();
  const trimmedFlags = flags.trim();
  if (!trimmedPattern) {
    return "";
  }
  return `/${trimmedPattern}/${trimmedFlags}`;
};

const extractRegexFromText = (input: string) => {
  const firstSlash = input.indexOf("/");
  const lastSlash = input.lastIndexOf("/");
  if (firstSlash !== -1 && lastSlash > firstSlash) {
    const pattern = input.slice(firstSlash + 1, lastSlash);
    const flags = input.slice(lastSlash + 1).match(/[gimsuy]+/)?.[0] || "";
    return { pattern, flags, regex: `/${pattern}/${flags}` };
  }
  return { pattern: "", flags: "", regex: "" };
};

export const parseRegexResponse = (content: string): AiRegexResult => {
  const cleaned = stripCodeFences(content);
  const jsonCandidate = extractJson(cleaned);

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<AiRegexResult>;
    const pattern = (parsed.pattern || "").trim();
    const flags = (parsed.flags || "").trim();
    const regex =
      (parsed.regex || "").trim() || buildRegexFromParts(pattern, flags);

    return {
      pattern,
      flags,
      regex,
      explanation: (parsed.explanation || "").trim(),
      examples: parsed.examples ?? [],
      warnings: parsed.warnings ?? [],
      raw: content,
    };
  } catch {
    const fallback = extractRegexFromText(cleaned);
    return {
      pattern: fallback.pattern,
      flags: fallback.flags,
      regex: fallback.regex,
      explanation: cleaned.slice(0, 600).trim(),
      examples: [],
      warnings: [
        "AI response could not be parsed as JSON. Showing best-effort extraction.",
      ],
      raw: content,
    };
  }
};

export const callOpenAI = async (
  request: AiRegexProviderRequest
): Promise<AiRegexResult> => {
  const { model = DEFAULT_OPENAI_MODEL, apiKey } = request;
  const prompt = buildRegexPrompt(request);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI request failed (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI response missing content.");
  }
  return parseRegexResponse(content);
};

export const callAnthropic = async (
  request: AiRegexProviderRequest
): Promise<AiRegexResult> => {
  const { model = DEFAULT_ANTHROPIC_MODEL, apiKey } = request;
  const prompt = buildRegexPrompt(request);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0.2,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Anthropic request failed (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  const data = (await response.json()) as {
    content?: { text?: string }[];
  };
  const content = data.content?.map((item) => item.text || "").join("").trim();
  if (!content) {
    throw new Error("Anthropic response missing content.");
  }
  return parseRegexResponse(content);
};

export const generateAiRegex = async (
  request: AiRegexProviderRequest
): Promise<AiRegexResult> => {
  if (!request.apiKey.trim()) {
    throw new Error("API key is required.");
  }

  if (!request.description.trim()) {
    throw new Error("Description is required.");
  }

  if (request.provider === "openai") {
    return callOpenAI(request);
  }

  return callAnthropic(request);
};

export const getDefaultModel = (provider: AiProvider) =>
  provider === "openai" ? DEFAULT_OPENAI_MODEL : DEFAULT_ANTHROPIC_MODEL;
