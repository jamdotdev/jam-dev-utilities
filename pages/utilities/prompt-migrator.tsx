import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Input } from "@/components/ds/InputComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import {
  NormalizedMessage,
  ProviderKey,
  PROVIDER_OPTIONS,
  convertToProvider,
  createMessagesFromTemplate,
  formatJson,
  normalizeMessagesFromInput,
  PromptFormat,
} from "@/components/utils/prompt-migrator";

type MigrationOutput = Record<ProviderKey, string>;

const AI_PROVIDER_OPTIONS = PROVIDER_OPTIONS.filter(
  (provider) => provider.value !== "azure-openai"
);

const DEFAULT_TARGETS: ProviderKey[] = [
  "openai",
  "anthropic",
  "gemini",
];

const buildApiKeyStorageKey = (provider: ProviderKey) =>
  `prompt-migrator-key-${provider}`;

const extractJsonFromText = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const firstIndex = text.indexOf("{");
    const lastIndex = text.lastIndexOf("}");
    if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
      return JSON.parse(text.slice(firstIndex, lastIndex + 1));
    }
    throw new Error("Failed to parse JSON from AI response.");
  }
};

const callOpenAI = async (
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
) => {
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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
};

const callMistral = async (
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
) => {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
};

const callAnthropic = async (
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;
  return content ?? "";
};

const callGemini = async (
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};

const callAiProvider = async (
  provider: ProviderKey,
  model: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
) => {
  switch (provider) {
    case "anthropic":
      return callAnthropic(model, apiKey, systemPrompt, userPrompt);
    case "gemini":
      return callGemini(model, apiKey, systemPrompt, userPrompt);
    case "mistral":
      return callMistral(model, apiKey, systemPrompt, userPrompt);
    case "openai":
    default:
      return callOpenAI(model, apiKey, systemPrompt, userPrompt);
  }
};

export default function PromptMigrator() {
  const [sourceProvider, setSourceProvider] =
    useState<ProviderKey>("openai");
  const [sourceFormat, setSourceFormat] =
    useState<PromptFormat>("messages");
  const [promptInput, setPromptInput] = useState("");
  const [templateIsSystem, setTemplateIsSystem] = useState(false);
  const [targetProviders, setTargetProviders] =
    useState<ProviderKey[]>(DEFAULT_TARGETS);
  const [useAiRewrite, setUseAiRewrite] = useState(false);
  const [aiProvider, setAiProvider] = useState<ProviderKey>("openai");
  const [aiModel, setAiModel] = useState(
    AI_PROVIDER_OPTIONS[0]?.models[0] ?? "gpt-4o-mini"
  );
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<MigrationOutput>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<ProviderKey | null>(null);
  const [activeOutput, setActiveOutput] = useState<ProviderKey | null>(
    DEFAULT_TARGETS[0]
  );

  const aiModelOptions = useMemo(() => {
    const provider = AI_PROVIDER_OPTIONS.find(
      (option) => option.value === aiProvider
    );
    return provider?.models ?? [];
  }, [aiProvider]);

  useEffect(() => {
    if (aiModelOptions.length > 0) {
      setAiModel((current) =>
        aiModelOptions.includes(current) ? current : aiModelOptions[0]
      );
    }
  }, [aiModelOptions]);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(
        buildApiKeyStorageKey(aiProvider)
      );
      if (storedKey) {
        setApiKey(storedKey);
        setRememberKey(true);
      } else {
        setApiKey("");
        setRememberKey(false);
      }
    } catch {
      setApiKey("");
      setRememberKey(false);
    }
  }, [aiProvider]);

  useEffect(() => {
    try {
      if (!rememberKey) {
        localStorage.removeItem(buildApiKeyStorageKey(aiProvider));
        return;
      }
      if (apiKey) {
        localStorage.setItem(buildApiKeyStorageKey(aiProvider), apiKey);
      }
    } catch {
      // Ignore localStorage failures.
    }
  }, [aiProvider, apiKey, rememberKey]);

  const toggleTargetProvider = (provider: ProviderKey) => {
    setTargetProviders((prev) => {
      if (prev.includes(provider)) {
        return prev.filter((item) => item !== provider);
      }
      return [...prev, provider];
    });
  };

  const deterministicOutputs = useCallback(() => {
    let messages: NormalizedMessage[] = [];
    let parseError: string | undefined;

    if (sourceFormat === "messages") {
      const result = normalizeMessagesFromInput(promptInput);
      messages = result.messages;
      parseError = result.error;
    } else {
      messages = createMessagesFromTemplate(promptInput, templateIsSystem);
      if (messages.length === 0) {
        parseError = "Please paste a template to migrate.";
      }
    }

    if (parseError) {
      setError(parseError);
      setOutputs({});
      return { messages: [], outputs: {} as MigrationOutput, error: parseError };
    }

    const nextOutputs: MigrationOutput = {};
    targetProviders.forEach((provider) => {
      const converted = convertToProvider(messages, provider);
      nextOutputs[provider] = formatJson(converted);
    });

    setOutputs(nextOutputs);
    return { messages, outputs: nextOutputs };
  }, [promptInput, sourceFormat, targetProviders, templateIsSystem]);

  const handleCopy = (provider: ProviderKey) => {
    const value = outputs[provider];
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedTarget(provider);
      setTimeout(() => setCopiedTarget(null), 1200);
    });
  };

  const handleClear = () => {
    setPromptInput("");
    setOutputs({});
    setError(null);
  };

  const handleMigrate = async () => {
    setError(null);
    setIsLoading(true);
    setCopiedTarget(null);

    const deterministic = deterministicOutputs();
    if (deterministic.error || !useAiRewrite) {
      setIsLoading(false);
      return;
    }

    if (!apiKey) {
      setError("Add an API key or disable AI rewrite.");
      setIsLoading(false);
      return;
    }

    const systemPrompt =
      "You are a prompt migrator. Return only valid JSON matching the target provider schema.";

    const results: MigrationOutput = { ...deterministic.outputs };

    await Promise.all(
      targetProviders.map(async (targetProvider) => {
        const userPrompt = [
          `Source provider: ${sourceProvider}`,
          `Source format: ${sourceFormat}`,
          `Target provider: ${targetProvider}`,
          "Input:",
          promptInput,
        ].join("\n");

        try {
          const responseText = await callAiProvider(
            aiProvider,
            aiModel,
            apiKey,
            systemPrompt,
            userPrompt
          );
          const parsed = extractJsonFromText(responseText);
          results[targetProvider] = formatJson(parsed);
        } catch (aiError) {
          setError(
            aiError instanceof Error
              ? aiError.message
              : "AI rewrite failed."
          );
        }
      })
    );

    setOutputs(results);
    setIsLoading(false);
  };

  const selectedTargetTabs = useMemo(() => {
    const activeTargets = targetProviders.length
      ? targetProviders
      : DEFAULT_TARGETS;
    return PROVIDER_OPTIONS.map((provider) => provider.value).filter((value) =>
      activeTargets.includes(value)
    );
  }, [targetProviders]);

  useEffect(() => {
    if (!activeOutput || !selectedTargetTabs.includes(activeOutput)) {
      setActiveOutput(selectedTargetTabs[0]);
    }
  }, [activeOutput, selectedTargetTabs]);

  return (
    <main>
      <Meta
        title="Prompt Migrator | Free, Open Source & Ad-free"
        description="Migrate prompts across OpenAI, Anthropic, Gemini, Mistral, and Azure OpenAI formats. BYOK AI rewrite or deterministic conversion."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="Prompt Migrator"
          description="Convert prompts across providers with optional BYOK AI rewrite."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Source format</Label>
              <Tabs
                value={sourceFormat}
                onValueChange={(value) =>
                  setSourceFormat(value as PromptFormat)
                }
                className="w-full"
              >
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="messages">Chat messages</TabsTrigger>
                  <TabsTrigger value="template">Template</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Source provider</Label>
                <Combobox
                  data={PROVIDER_OPTIONS.map((provider) => ({
                    value: provider.value,
                    label: provider.label,
                  }))}
                  value={sourceProvider}
                  onSelect={(value) => setSourceProvider(value as ProviderKey)}
                />
              </div>
              <div>
                <Label className="mb-2 block">Target providers</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PROVIDER_OPTIONS.map((provider) => (
                    <label
                      key={provider.value}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Checkbox
                        checked={targetProviders.includes(provider.value)}
                        onCheckedChange={() =>
                          toggleTargetProvider(provider.value)
                        }
                      />
                      {provider.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                {sourceFormat === "messages"
                  ? "Prompt messages"
                  : "Prompt template"}
              </Label>
              <Textarea
                rows={6}
                placeholder={
                  sourceFormat === "messages"
                    ? "Paste JSON messages (OpenAI, Anthropic, or Gemini)."
                    : "Paste a template string to migrate."
                }
                value={promptInput}
                onChange={(event) => setPromptInput(event.target.value)}
              />
              {sourceFormat === "template" && (
                <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={templateIsSystem}
                    onCheckedChange={() =>
                      setTemplateIsSystem((prev) => !prev)
                    }
                  />
                  Treat template as system prompt
                </label>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="mb-2 block">Use AI rewrite (BYOK)</Label>
                  <p className="text-sm text-muted-foreground">
                    Optional AI rewrite for cleaner provider-specific output.
                  </p>
                </div>
                <Checkbox
                  checked={useAiRewrite}
                  onCheckedChange={() => setUseAiRewrite((prev) => !prev)}
                />
              </div>

              {useAiRewrite && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Provider</Label>
                      <Combobox
                        data={AI_PROVIDER_OPTIONS.map((provider) => ({
                          value: provider.value,
                          label: provider.label,
                        }))}
                        value={aiProvider}
                        onSelect={(value) =>
                          setAiProvider(value as ProviderKey)
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Model</Label>
                      <Combobox
                        data={aiModelOptions.map((model) => ({
                          value: model,
                          label: model,
                        }))}
                        value={aiModel}
                        onSelect={(value) => setAiModel(value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">API key</Label>
                    <Input
                      type="password"
                      placeholder="Paste your API key"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                    />
                    <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox
                        checked={rememberKey}
                        onCheckedChange={() =>
                          setRememberKey((prev) => !prev)
                        }
                      />
                      Remember my key on this device
                    </label>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Keys stay in your browser and are never sent to Jam.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button onClick={handleMigrate} disabled={isLoading}>
                {isLoading ? "Migrating..." : "Migrate prompt"}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <Label className="mb-2 block">Output</Label>
          <Tabs
            value={activeOutput ?? selectedTargetTabs[0]}
            onValueChange={(value) =>
              setActiveOutput(value as ProviderKey)
            }
          >
            <TabsList className="w-full justify-start flex-wrap">
              {selectedTargetTabs.map((provider) => {
                const label =
                  PROVIDER_OPTIONS.find((option) => option.value === provider)
                    ?.label ?? provider;
                return (
                  <TabsTrigger key={provider} value={provider}>
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {selectedTargetTabs.map((provider) => (
              <TabsContent key={provider} value={provider}>
                <Textarea
                  rows={8}
                  readOnly
                  value={outputs[provider] ?? ""}
                  placeholder="Your migrated prompt will appear here."
                  className="mb-3 font-mono"
                />
                <Button
                  variant="outline"
                  onClick={() => handleCopy(provider)}
                  disabled={!outputs[provider]}
                >
                  {copiedTarget === provider ? "Copied!" : "Copy"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </section>

      <GitHubContribution username="jamdotdev" />
      <CallToActionGrid />
    </main>
  );
}
