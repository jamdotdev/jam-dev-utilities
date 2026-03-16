export type ProviderKey =
  | "openai"
  | "anthropic"
  | "gemini"
  | "mistral"
  | "azure-openai";

export type PromptFormat = "messages" | "template";

export type NormalizedRole =
  | "system"
  | "user"
  | "assistant"
  | "tool"
  | "function";

export type NormalizedMessage = {
  role: NormalizedRole;
  content: string;
};

export const PROVIDER_OPTIONS = [
  {
    value: "openai" as const,
    label: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  },
  {
    value: "anthropic" as const,
    label: "Anthropic",
    models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
  },
  {
    value: "gemini" as const,
    label: "Google Gemini",
    models: ["gemini-1.5-flash", "gemini-1.5-pro"],
  },
  {
    value: "mistral" as const,
    label: "Mistral",
    models: ["mistral-large-latest", "mistral-small-latest"],
  },
  {
    value: "azure-openai" as const,
    label: "Azure OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  },
];

const KNOWN_ROLES: NormalizedRole[] = [
  "system",
  "user",
  "assistant",
  "tool",
  "function",
];

const toRole = (role: string | undefined): NormalizedRole => {
  if (role && KNOWN_ROLES.includes(role as NormalizedRole)) {
    return role as NormalizedRole;
  }
  return "user";
};

const contentToString = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    const parts = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: string }).text ?? "");
        }
        return "";
      })
      .filter(Boolean);
    return parts.join("\n");
  }
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: string }).text ?? "");
  }
  if (content === null || content === undefined) {
    return "";
  }
  return String(content);
};

export const normalizeMessagesFromInput = (
  input: string
): { messages: NormalizedMessage[]; error?: string } => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { messages: [], error: "Please paste prompt input." };
  }

  try {
    const parsed = JSON.parse(trimmed);

    const messages: NormalizedMessage[] = [];

    if (parsed && typeof parsed === "object" && "system" in parsed) {
      const systemValue = (parsed as { system?: unknown }).system;
      if (systemValue) {
        messages.push({
          role: "system",
          content: contentToString(systemValue),
        });
      }
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((message) => {
        const role = toRole(message?.role);
        const content = contentToString(message?.content);
        messages.push({ role, content });
      });
      return { messages };
    }

    if (parsed && typeof parsed === "object") {
      const objectParsed = parsed as {
        messages?: unknown;
        contents?: unknown;
      };

      if (Array.isArray(objectParsed.messages)) {
        objectParsed.messages.forEach((message) => {
          const role = toRole((message as { role?: string })?.role);
          const content = contentToString((message as { content?: unknown })
            ?.content);
          messages.push({ role, content });
        });
        return { messages };
      }

      if (Array.isArray(objectParsed.contents)) {
        objectParsed.contents.forEach((item) => {
          const role = toRole((item as { role?: string })?.role);
          const content = contentToString((item as { parts?: unknown })?.parts);
          messages.push({ role, content });
        });
        return { messages };
      }
    }

    return { messages: [], error: "Unsupported prompt shape." };
  } catch (error) {
    return {
      messages: [],
      error: error instanceof Error ? error.message : "Invalid JSON input.",
    };
  }
};

export const createMessagesFromTemplate = (
  template: string,
  isSystem: boolean
): NormalizedMessage[] => {
  const trimmed = template.trim();
  if (!trimmed) return [];
  return [
    {
      role: isSystem ? "system" : "user",
      content: trimmed,
    },
  ];
};

const normalizeRoleForOpenAI = (role: NormalizedRole) => {
  if (role === "function") return "tool";
  return role;
};

export const convertToProvider = (
  messages: NormalizedMessage[],
  provider: ProviderKey
) => {
  if (provider === "anthropic") {
    const systemMessages = messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .filter(Boolean);

    const nonSystemMessages = messages.filter(
      (message) => message.role !== "system"
    );

    return {
      system: systemMessages.join("\n\n"),
      messages: nonSystemMessages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      })),
    };
  }

  if (provider === "gemini") {
    const systemMessages = messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .filter(Boolean);

    const contents = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    return {
      system_instruction: systemMessages.length
        ? { parts: [{ text: systemMessages.join("\n\n") }] }
        : undefined,
      contents,
    };
  }

  return {
    messages: messages.map((message) => ({
      role: normalizeRoleForOpenAI(message.role),
      content: message.content,
    })),
  };
};

export const formatJson = (value: unknown) =>
  JSON.stringify(value, null, 2);
