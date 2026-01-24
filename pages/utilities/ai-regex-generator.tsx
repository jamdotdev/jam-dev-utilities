import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Input } from "@/components/ds/InputComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import CallToActionGrid from "@/components/CallToActionGrid";
import RegexHighlightText from "@/components/RegexHighlightText";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { createRegex } from "@/components/utils/regex-tester.utils";
import AiRegexGeneratorSEO from "@/components/seo/AiRegexGeneratorSEO";
import {
  AiProvider,
  AiRegexResult,
  generateAiRegex,
  getDefaultModel,
} from "@/components/utils/ai-regex-generator.utils";

const STORAGE_PREFIX = "jam-ai-regex";

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
];

const modelOptions: Record<AiProvider, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "gpt-4o-mini (fast)" },
    { value: "gpt-4o", label: "gpt-4o (quality)" },
  ],
  anthropic: [
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    { value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet" },
  ],
};

const loadStoredKey = (provider: AiProvider) => {
  if (typeof window === "undefined") return { key: "", remember: false };
  const localKey = localStorage.getItem(`${STORAGE_PREFIX}:${provider}:key`);
  if (localKey) {
    return { key: localKey, remember: true };
  }
  const sessionKey = sessionStorage.getItem(`${STORAGE_PREFIX}:${provider}:key`);
  if (sessionKey) {
    return { key: sessionKey, remember: false };
  }
  return { key: "", remember: false };
};

const persistKey = (
  provider: AiProvider,
  apiKey: string,
  remember: boolean
) => {
  if (typeof window === "undefined") return;
  const localKey = `${STORAGE_PREFIX}:${provider}:key`;
  const sessionKey = `${STORAGE_PREFIX}:${provider}:key`;

  if (!apiKey) {
    localStorage.removeItem(localKey);
    sessionStorage.removeItem(sessionKey);
    return;
  }

  if (remember) {
    localStorage.setItem(localKey, apiKey);
    sessionStorage.removeItem(sessionKey);
  } else {
    sessionStorage.setItem(sessionKey, apiKey);
    localStorage.removeItem(localKey);
  }
};

export default function AiRegexGenerator() {
  const [description, setDescription] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [expectedMatches, setExpectedMatches] = useState("");
  const [provider, setProvider] = useState<AiProvider>("openai");
  const [model, setModel] = useState(getDefaultModel("openai"));
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [result, setResult] = useState<AiRegexResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [testString, setTestString] = useState("");
  const [testResult, setTestResult] = useState<string>("");
  const [testMatches, setTestMatches] = useState<string[] | null>(null);

  const {
    buttonText: copyRegexText,
    handleCopy: handleCopyRegex,
  } = useCopyToClipboard();
  const {
    buttonText: copyExplanationText,
    handleCopy: handleCopyExplanation,
  } = useCopyToClipboard();

  const activeRegex = result?.regex || "";

  useEffect(() => {
    const stored = loadStoredKey(provider);
    setApiKey(stored.key);
    setRememberKey(stored.remember);
    setModel((current) => {
      const available = modelOptions[provider].some(
        (option) => option.value === current
      );
      return available ? current : getDefaultModel(provider);
    });
  }, [provider]);

  useEffect(() => {
    persistKey(provider, apiKey, rememberKey);
  }, [provider, apiKey, rememberKey]);

  useEffect(() => {
    if (!activeRegex || !testString) {
      setTestResult("");
      setTestMatches(null);
      return;
    }

    try {
      const regex = createRegex(activeRegex);
      let matches: string[] = [];

      if (regex.flags.includes("g")) {
        matches = Array.from(testString.matchAll(regex)).map((m) => m[0]);
      } else {
        const match = testString.match(regex);
        if (match) {
          matches = [match[0]];
        }
      }

      if (matches.length > 0) {
        const suffix = matches.length > 1 ? "matches" : "match";
        setTestResult(`Match found: ${matches.length} ${suffix}`);
        setTestMatches(matches);
      } else {
        setTestResult("No match found");
        setTestMatches(null);
      }
    } catch (testError) {
      if (testError instanceof Error) {
        setTestResult(testError.message);
      } else {
        setTestResult("Regex test failed.");
      }
      setTestMatches(null);
    }
  }, [activeRegex, testString]);

  const selectedModelOptions = useMemo(
    () => modelOptions[provider],
    [provider]
  );

  const handleGenerate = useCallback(async () => {
    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const output = await generateAiRegex({
        provider,
        apiKey,
        model,
        description,
        sampleText,
        expectedMatches,
      });
      setResult(output);
      if (!testString && sampleText) {
        setTestString(sampleText);
      }
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Request failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    provider,
    apiKey,
    model,
    description,
    sampleText,
    expectedMatches,
    testString,
  ]);

  const handleClear = useCallback(() => {
    setDescription("");
    setSampleText("");
    setExpectedMatches("");
    setResult(null);
    setError("");
    setTestString("");
  }, []);

  const canGenerate = description.trim().length > 0 && apiKey.trim().length > 0;

  return (
    <main>
      <Meta
        title="AI Regex Generator | Free, Open Source & Ad-free"
        description="Generate regex patterns from natural language using your own API key. Get explanations, examples, and test matches instantly."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="AI Regex Generator"
          description="Describe what you need to match, and generate a regex pattern with explanations."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-6">
          <div>
            <Label className="mb-2 block">Description</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Match email addresses and optional +tags"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2 block">Sample text (optional)</Label>
            <Textarea
              rows={4}
              placeholder="Paste example text that should match"
              value={sampleText}
              onChange={(event) => setSampleText(event.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2 block">Expected matches (optional)</Label>
            <Textarea
              rows={3}
              placeholder="List the expected matches from your sample text"
              value={expectedMatches}
              onChange={(event) => setExpectedMatches(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Combobox
                data={providerOptions}
                value={provider}
                onSelect={(value) => setProvider(value as AiProvider)}
              />
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Combobox
                data={selectedModelOptions}
                value={model}
                onSelect={(value) => setModel(value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>API key</Label>
            <Input
              type="password"
              placeholder="Paste your API key"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={rememberKey}
                onCheckedChange={(checked) => setRememberKey(checked === true)}
              />
              <span>Remember my key on this device</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Keys stay in your browser and are never sent to Jam.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleGenerate} disabled={!canGenerate || isLoading}>
              {isLoading ? "Generating..." : "Generate regex"}
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={isLoading}>
              Clear
            </Button>
          </div>
        </Card>
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-6">
          <div className="space-y-2">
            <Label>Generated regex</Label>
            <Input readOnly value={activeRegex || ""} />
            <Button
              variant="outline"
              onClick={() => handleCopyRegex(activeRegex || "")}
              disabled={!activeRegex}
            >
              {copyRegexText}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea readOnly rows={4} value={result?.explanation || ""} />
            <Button
              variant="outline"
              onClick={() => handleCopyExplanation(result?.explanation || "")}
              disabled={!result?.explanation}
            >
              {copyExplanationText}
            </Button>
          </div>

          {result?.warnings?.length ? (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-700 dark:text-orange-300">
              <Label className="mb-1 block text-orange-700 dark:text-orange-300">
                Warnings
              </Label>
              <ul className="list-disc pl-4 space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result?.examples?.length ? (
            <div className="rounded-lg border border-input bg-muted px-3 py-2 text-sm">
              <Label className="mb-2 block">Examples</Label>
              <div className="space-y-3">
                {result.examples.map((example, index) => (
                  <div key={`${example.text}-${index}`}>
                    <p className="text-xs text-muted-foreground">Text</p>
                    <p className="mb-1">{example.text}</p>
                    <p className="text-xs text-muted-foreground">Matches</p>
                    <p>{example.matches.join(", ") || "None"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl space-y-4">
          <div>
            <Label className="mb-2 block">Test your regex</Label>
            <Textarea
              rows={4}
              placeholder="Paste text to test the generated regex"
              value={testString}
              onChange={(event) => setTestString(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-input bg-muted px-3 py-2 text-sm">
            <div
              className={
                testResult.startsWith("Match found")
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : testResult.startsWith("No match")
                    ? "text-orange-600 dark:text-orange-400"
                    : testResult
                      ? "text-red-600 dark:text-red-400"
                      : ""
              }
            >
              {testResult || "Add test text to see matches"}
            </div>
            {testMatches && (
              <>
                <div className="bg-border h-[1px] my-2"></div>
                <RegexHighlightText text={testString} matches={testMatches} />
              </>
            )}
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-4xl">
        <AiRegexGeneratorSEO />
      </section>
    </main>
  );
}
