import { useCallback, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { Input } from "@/components/ds/InputComponent";
import { ColorPicker } from "@/components/ds/ColorPickerComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ds/TabsComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Slider } from "@/components/ds/SliderComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import ChatbotDesignerSEO from "@/components/seo/ChatbotDesignerSEO";
import {
  applyLayoutPreset,
  ChatbotDesignerConfig,
  ChatbotLayout,
  defaultChatbotDesignerConfig,
  getChatbotDesignerJson,
  getChatbotDesignerReactSnippet,
} from "@/components/utils/chatbot-designer.utils";
import { normalizeHexInput } from "@/components/utils/wcag-color-contrast.utils";

const SAMPLE_MESSAGES = [
  {
    role: "assistant",
    content: "Hi! I'm the Acme bot. What can I help you with?",
  },
  {
    role: "user",
    content: "Can you update my billing address?",
  },
  {
    role: "assistant",
    content: "Absolutely. Share the new address and I will update it.",
  },
] as const;

const layoutLabels: Record<ChatbotLayout, string> = {
  compact: "Compact",
  spacious: "Spacious",
};

export default function ChatbotDesigner() {
  const [config, setConfig] = useState<ChatbotDesignerConfig>(
    defaultChatbotDesignerConfig
  );
  const { buttonText: reactCopyText, handleCopy: handleReactCopy } =
    useCopyToClipboard();
  const { buttonText: jsonCopyText, handleCopy: handleJsonCopy } =
    useCopyToClipboard();

  const reactSnippet = useMemo(
    () => getChatbotDesignerReactSnippet(config),
    [config]
  );
  const jsonSnippet = useMemo(() => getChatbotDesignerJson(config), [config]);

  const handleLayoutChange = useCallback((layout: string) => {
    setConfig((prev) => applyLayoutPreset(prev, layout as ChatbotLayout));
  }, []);

  const handleToggleChange = useCallback(
    (key: "showHeader" | "streaming") =>
      (value: boolean | "indeterminate") => {
        setConfig((prev) => ({ ...prev, [key]: Boolean(value) }));
      },
    []
  );

  const handleTextChange = useCallback(
    (key: keyof ChatbotDesignerConfig) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setConfig((prev) => ({ ...prev, [key]: value }));
      },
    []
  );

  const handleNumberChange = useCallback(
    (key: keyof ChatbotDesignerConfig) => (value: number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleColorChange = useCallback(
    (key: keyof ChatbotDesignerConfig["colors"]) =>
      (value: string) => {
        setConfig((prev) => ({
          ...prev,
          colors: { ...prev.colors, [key]: value },
        }));
      },
    []
  );

  const handleHexInputChange = useCallback(
    (key: keyof ChatbotDesignerConfig["colors"]) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const normalized = normalizeHexInput(event.target.value);
        setConfig((prev) => ({
          ...prev,
          colors: { ...prev.colors, [key]: normalized },
        }));
      },
    []
  );

  return (
    <main>
      <Meta
        title="Chatbot Designer | React Chat UI Builder | Free & Open Source"
        description="Design a customizable AI chat UI with live preview. Copy React code and JSON config to ship your chatbot fast."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="Chatbot Designer"
          description="Design a customizable AI chat UI and copy the code."
        />
      </section>

      <section className="container max-w-6xl mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Designer</Label>
                <span className="text-xs text-muted-foreground">
                  {layoutLabels[config.layout]}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="mb-2 block">Header title</Label>
                  <Input
                    value={config.title}
                    onChange={handleTextChange("title")}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Header subtitle</Label>
                  <Input
                    value={config.subtitle}
                    onChange={handleTextChange("subtitle")}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={config.showHeader}
                    onCheckedChange={handleToggleChange("showHeader")}
                  />
                  <Label>Show header</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={config.streaming}
                    onCheckedChange={handleToggleChange("streaming")}
                  />
                  <Label>Enable streaming</Label>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <Label className="text-base">Layout</Label>
              <Tabs value={config.layout} onValueChange={handleLayoutChange}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="compact">Compact</TabsTrigger>
                  <TabsTrigger value="spacious">Spacious</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <SliderField
                  label="Container max width"
                  value={config.containerMaxWidth}
                  unit="px"
                  min={320}
                  max={520}
                  step={10}
                  onChange={handleNumberChange("containerMaxWidth")}
                />
                <SliderField
                  label="Container padding"
                  value={config.containerPadding}
                  unit="px"
                  min={8}
                  max={32}
                  step={2}
                  onChange={handleNumberChange("containerPadding")}
                />
                <SliderField
                  label="Message gap"
                  value={config.messageGap}
                  unit="px"
                  min={4}
                  max={20}
                  step={1}
                  onChange={handleNumberChange("messageGap")}
                />
                <SliderField
                  label="Bubble radius"
                  value={config.bubbleRadius}
                  unit="px"
                  min={6}
                  max={24}
                  step={1}
                  onChange={handleNumberChange("bubbleRadius")}
                />
                <SliderField
                  label="Bubble padding X"
                  value={config.bubblePaddingX}
                  unit="px"
                  min={6}
                  max={24}
                  step={1}
                  onChange={handleNumberChange("bubblePaddingX")}
                />
                <SliderField
                  label="Bubble padding Y"
                  value={config.bubblePaddingY}
                  unit="px"
                  min={6}
                  max={20}
                  step={1}
                  onChange={handleNumberChange("bubblePaddingY")}
                />
                <SliderField
                  label="Input radius"
                  value={config.inputRadius}
                  unit="px"
                  min={6}
                  max={24}
                  step={1}
                  onChange={handleNumberChange("inputRadius")}
                />
                <SliderField
                  label="Input padding X"
                  value={config.inputPaddingX}
                  unit="px"
                  min={6}
                  max={24}
                  step={1}
                  onChange={handleNumberChange("inputPaddingX")}
                />
                <SliderField
                  label="Input padding Y"
                  value={config.inputPaddingY}
                  unit="px"
                  min={6}
                  max={20}
                  step={1}
                  onChange={handleNumberChange("inputPaddingY")}
                />
                <SliderField
                  label="Font size"
                  value={config.fontSize}
                  unit="px"
                  min={12}
                  max={20}
                  step={1}
                  onChange={handleNumberChange("fontSize")}
                />
                <div>
                  <Label className="mb-2 block">Font family</Label>
                  <Input
                    value={config.fontFamily}
                    onChange={handleTextChange("fontFamily")}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <Label className="text-base">Colors</Label>
              <div className="grid grid-cols-1 gap-4">
                <ColorField
                  label="Surface"
                  value={config.colors.surface}
                  onInputChange={handleHexInputChange("surface")}
                  onColorChange={handleColorChange("surface")}
                />
                <ColorField
                  label="Border"
                  value={config.colors.border}
                  onInputChange={handleHexInputChange("border")}
                  onColorChange={handleColorChange("border")}
                />
                <ColorField
                  label="Header background"
                  value={config.colors.headerBackground}
                  onInputChange={handleHexInputChange("headerBackground")}
                  onColorChange={handleColorChange("headerBackground")}
                />
                <ColorField
                  label="Header text"
                  value={config.colors.headerText}
                  onInputChange={handleHexInputChange("headerText")}
                  onColorChange={handleColorChange("headerText")}
                />
                <ColorField
                  label="User bubble"
                  value={config.colors.userBubble}
                  onInputChange={handleHexInputChange("userBubble")}
                  onColorChange={handleColorChange("userBubble")}
                />
                <ColorField
                  label="User text"
                  value={config.colors.userText}
                  onInputChange={handleHexInputChange("userText")}
                  onColorChange={handleColorChange("userText")}
                />
                <ColorField
                  label="Bot bubble"
                  value={config.colors.botBubble}
                  onInputChange={handleHexInputChange("botBubble")}
                  onColorChange={handleColorChange("botBubble")}
                />
                <ColorField
                  label="Bot text"
                  value={config.colors.botText}
                  onInputChange={handleHexInputChange("botText")}
                  onColorChange={handleColorChange("botText")}
                />
                <ColorField
                  label="Input background"
                  value={config.colors.inputBackground}
                  onInputChange={handleHexInputChange("inputBackground")}
                  onColorChange={handleColorChange("inputBackground")}
                />
                <ColorField
                  label="Input text"
                  value={config.colors.inputText}
                  onInputChange={handleHexInputChange("inputText")}
                  onColorChange={handleColorChange("inputText")}
                />
                <ColorField
                  label="Input border"
                  value={config.colors.inputBorder}
                  onInputChange={handleHexInputChange("inputBorder")}
                  onColorChange={handleColorChange("inputBorder")}
                />
                <ColorField
                  label="Send button"
                  value={config.colors.sendButton}
                  onInputChange={handleHexInputChange("sendButton")}
                  onColorChange={handleColorChange("sendButton")}
                />
                <ColorField
                  label="Send button text"
                  value={config.colors.sendButtonText}
                  onInputChange={handleHexInputChange("sendButtonText")}
                  onColorChange={handleColorChange("sendButtonText")}
                />
              </div>
            </section>
          </Card>

          <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-4">
            <Label className="text-base">Preview</Label>
            <div
              className="mx-auto w-full"
              style={{
                maxWidth: config.containerMaxWidth,
                fontFamily: config.fontFamily,
                fontSize: config.fontSize,
              }}
            >
              <div
                style={{
                  background: config.colors.surface,
                  border: `1px solid ${config.colors.border}`,
                  borderRadius: config.bubbleRadius,
                  padding: config.containerPadding,
                }}
              >
                {config.showHeader && (
                  <div
                    style={{
                      background: config.colors.headerBackground,
                      color: config.colors.headerText,
                      padding: config.containerPadding,
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
                  {SAMPLE_MESSAGES.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={`${message.role}-${index}`}
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
                            padding: `${config.bubblePaddingY}px ${config.bubblePaddingX}px`,
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
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      background: config.colors.inputBackground,
                      color: config.colors.inputText,
                      border: `1px solid ${config.colors.inputBorder}`,
                      borderRadius: config.inputRadius,
                      padding: `${config.inputPaddingY}px ${config.inputPaddingX}px`,
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      background: config.colors.sendButton,
                      color: config.colors.sendButtonText,
                      borderRadius: config.inputRadius,
                      padding: `${config.inputPaddingY}px ${config.inputPaddingX}px`,
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-4">
            <Label className="text-base">Generated code</Label>
            <Tabs defaultValue="react" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="react" className="space-y-3">
                <Textarea value={reactSnippet} readOnly rows={16} />
                <Button
                  variant="outline"
                  onClick={() => handleReactCopy(reactSnippet)}
                >
                  {reactCopyText}
                </Button>
              </TabsContent>
              <TabsContent value="json" className="space-y-3">
                <Textarea value={jsonSnippet} readOnly rows={16} />
                <Button
                  variant="outline"
                  onClick={() => handleJsonCopy(jsonSnippet)}
                >
                  {jsonCopyText}
                </Button>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      <CallToActionGrid />

      <section className="container max-w-4xl">
        <ChatbotDesignerSEO />
      </section>
    </main>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange: (value: string) => void;
}

const ColorField = ({
  label,
  value,
  onInputChange,
  onColorChange,
}: ColorFieldProps) => {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-3">
        <Input
          value={value}
          onChange={onInputChange}
          className="h-8 text-sm max-w-[120px]"
        />
        <ColorPicker value={value} onChange={onColorChange} />
      </div>
    </div>
  );
};

interface SliderFieldProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const SliderField = ({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: SliderFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );
};
