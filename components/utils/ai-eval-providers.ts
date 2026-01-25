import {
  ChatParams,
  ChatResponse,
  ProviderId,
  getProviderById,
  getModelById,
} from "./ai-eval-schemas";

// ============================================================================
// Provider Adapter Interface
// ============================================================================

export interface ProviderAdapter {
  id: ProviderId;
  name: string;
  chat(apiKey: string, params: ChatParams): Promise<ChatResponse>;
  validateKey(apiKey: string): Promise<boolean>;
}

// ============================================================================
// OpenAI Adapter
// ============================================================================

const openaiAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI",

  async chat(apiKey: string, params: ChatParams): Promise<ChatResponse> {
    const provider = getProviderById("openai");
    if (!provider) throw new Error("OpenAI provider not found");

    const body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 4096,
      temperature: params.temperature ?? 0.7,
    };

    if (params.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(provider.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content || "",
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  },

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// Anthropic Adapter
// ============================================================================

const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  name: "Anthropic",

  async chat(apiKey: string, params: ChatParams): Promise<ChatResponse> {
    const provider = getProviderById("anthropic");
    if (!provider) throw new Error("Anthropic provider not found");

    // Anthropic uses a different message format
    // System message is separate from the messages array
    const systemMessage = params.messages.find((m) => m.role === "system");
    const otherMessages = params.messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: params.model,
      max_tokens: params.maxTokens ?? 4096,
      messages: otherMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    const response = await fetch(provider.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `Anthropic API error: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      content: data.content?.[0]?.text || "",
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      finishReason: data.stop_reason,
    };
  },

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      // Anthropic doesn't have a simple models endpoint, so we make a minimal request
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// Google AI Adapter
// ============================================================================

const googleAdapter: ProviderAdapter = {
  id: "google",
  name: "Google AI",

  async chat(apiKey: string, params: ChatParams): Promise<ChatResponse> {
    const model = getModelById(params.model);
    if (!model) throw new Error(`Model not found: ${params.model}`);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;

    // Convert messages to Google format
    const systemMessage = params.messages.find((m) => m.role === "system");
    const otherMessages = params.messages.filter((m) => m.role !== "system");

    const contents = otherMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: params.maxTokens ?? 4096,
        temperature: params.temperature ?? 0.7,
      },
    };

    if (systemMessage) {
      body.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (params.jsonMode) {
      (body.generationConfig as Record<string, unknown>).responseMimeType =
        "application/json";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `Google AI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || "";

    return {
      content,
      model: params.model,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      finishReason: candidate?.finishReason,
    };
  },

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// Adapter Registry
// ============================================================================

const adapters: Record<ProviderId, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  google: googleAdapter,
};

export function getAdapter(providerId: ProviderId): ProviderAdapter {
  const adapter = adapters[providerId];
  if (!adapter) {
    throw new Error(`No adapter found for provider: ${providerId}`);
  }
  return adapter;
}

export function getAdapterForModel(modelId: string): ProviderAdapter {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }
  return getAdapter(model.providerId);
}

// ============================================================================
// Unified Chat Function
// ============================================================================

export async function chat(
  apiKey: string,
  params: ChatParams
): Promise<ChatResponse> {
  const adapter = getAdapterForModel(params.model);
  return adapter.chat(apiKey, params);
}

export async function validateApiKey(
  providerId: ProviderId,
  apiKey: string
): Promise<boolean> {
  const adapter = getAdapter(providerId);
  return adapter.validateKey(apiKey);
}
