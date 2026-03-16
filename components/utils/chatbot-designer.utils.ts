export type ChatbotLayout = "compact" | "spacious";

export interface ChatbotDesignerConfig {
  title: string;
  subtitle: string;
  showHeader: boolean;
  streaming: boolean;
  layout: ChatbotLayout;
  fontFamily: string;
  fontSize: number;
  containerMaxWidth: number;
  containerPadding: number;
  messageGap: number;
  bubbleRadius: number;
  bubblePaddingX: number;
  bubblePaddingY: number;
  inputRadius: number;
  inputPaddingX: number;
  inputPaddingY: number;
  colors: {
    surface: string;
    border: string;
    headerBackground: string;
    headerText: string;
    userBubble: string;
    userText: string;
    botBubble: string;
    botText: string;
    inputBackground: string;
    inputText: string;
    inputBorder: string;
    sendButton: string;
    sendButtonText: string;
  };
}

export const layoutPresets: Record<
  ChatbotLayout,
  Pick<
    ChatbotDesignerConfig,
    | "containerPadding"
    | "messageGap"
    | "bubblePaddingX"
    | "bubblePaddingY"
    | "inputPaddingX"
    | "inputPaddingY"
    | "fontSize"
  >
> = {
  compact: {
    containerPadding: 14,
    messageGap: 8,
    bubblePaddingX: 12,
    bubblePaddingY: 8,
    inputPaddingX: 12,
    inputPaddingY: 8,
    fontSize: 14,
  },
  spacious: {
    containerPadding: 20,
    messageGap: 12,
    bubblePaddingX: 16,
    bubblePaddingY: 12,
    inputPaddingX: 16,
    inputPaddingY: 10,
    fontSize: 16,
  },
};

export const defaultChatbotDesignerConfig: ChatbotDesignerConfig = {
  title: "Acme Support",
  subtitle: "Ask anything about your account",
  showHeader: true,
  streaming: true,
  layout: "compact",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontSize: 14,
  containerMaxWidth: 420,
  containerPadding: 14,
  messageGap: 8,
  bubbleRadius: 14,
  bubblePaddingX: 12,
  bubblePaddingY: 8,
  inputRadius: 12,
  inputPaddingX: 12,
  inputPaddingY: 8,
  colors: {
    surface: "#FFFFFF",
    border: "#E5E7EB",
    headerBackground: "#0F172A",
    headerText: "#F8FAFC",
    userBubble: "#2563EB",
    userText: "#FFFFFF",
    botBubble: "#F1F5F9",
    botText: "#0F172A",
    inputBackground: "#FFFFFF",
    inputText: "#0F172A",
    inputBorder: "#CBD5F5",
    sendButton: "#111827",
    sendButtonText: "#FFFFFF",
  },
};

export const applyLayoutPreset = (
  config: ChatbotDesignerConfig,
  layout: ChatbotLayout
): ChatbotDesignerConfig => {
  return {
    ...config,
    layout,
    ...layoutPresets[layout],
  };
};

export const getChatbotDesignerJson = (config: ChatbotDesignerConfig): string => {
  return JSON.stringify(config, null, 2);
};

export const getChatbotDesignerReactSnippet = (
  config: ChatbotDesignerConfig
): string => {
  const configString = JSON.stringify(config, null, 2);

  return `import React, { useState } from "react";

const config = ${configString};

type MessageRole = "user" | "assistant";
type Message = { role: MessageRole; content: string };

type SendOptions = { stream: boolean };
type StreamResult = AsyncIterable<string>;

async function sendMessage(
  messages: Message[],
  options: SendOptions
): Promise<string | StreamResult> {
  // TODO: Replace with your API call.
  if (options.stream) {
    return (async function* () {})();
  }

  return "Replace with your API response.";
}

export function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");

    if (config.streaming) {
      const stream = (await sendMessage(nextMessages, {
        stream: true,
      })) as StreamResult;
      let buffer = "";

      for await (const chunk of stream) {
        buffer += chunk;
        setMessages([
          ...nextMessages,
          { role: "assistant", content: buffer },
        ]);
      }

      return;
    }

    const reply = (await sendMessage(nextMessages, {
      stream: false,
    })) as string;
    setMessages([...nextMessages, { role: "assistant", content: reply }]);
  };

  return (
    <div
      style={{
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        maxWidth: config.containerMaxWidth,
        background: config.colors.surface,
        border: \`1px solid \${config.colors.border}\`,
        borderRadius: config.bubbleRadius,
        padding: config.containerPadding,
      }}
    >
      {config.showHeader && (
        <div
          style={{
            background: config.colors.headerBackground,
            color: config.colors.headerText,
            padding: \`\${config.containerPadding}px\`,
            borderRadius: config.bubbleRadius,
            marginBottom: config.messageGap,
          }}
        >
          <div style={{ fontWeight: 600 }}>{config.title}</div>
          <div style={{ opacity: 0.85 }}>{config.subtitle}</div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: config.messageGap,
          marginBottom: config.messageGap,
        }}
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  background: isUser
                    ? config.colors.userBubble
                    : config.colors.botBubble,
                  color: isUser
                    ? config.colors.userText
                    : config.colors.botText,
                  borderRadius: config.bubbleRadius,
                  padding: \`\${config.bubblePaddingY}px \${config.bubblePaddingX}px\`,
                }}
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: config.colors.inputBackground,
            color: config.colors.inputText,
            border: \`1px solid \${config.colors.inputBorder}\`,
            borderRadius: config.inputRadius,
            padding: \`\${config.inputPaddingY}px \${config.inputPaddingX}px\`,
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          style={{
            background: config.colors.sendButton,
            color: config.colors.sendButtonText,
            borderRadius: config.inputRadius,
            padding: \`\${config.inputPaddingY}px \${config.inputPaddingX}px\`,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
`;
};
