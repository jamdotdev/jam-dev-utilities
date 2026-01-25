import { useCallback, useEffect, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "../../components/CallToActionGrid";
import Meta from "@/components/Meta";
import SQLMinifierSEO from "@/components/seo/SQLMinifierSEO";
import {
  minifySQL,
  validateSQLInput,
} from "@/components/utils/sql-minifier.utils";
import {
  deriveSqlRisks,
  SqlRiskFlag,
  SqlSummaryProvider,
  summarizeSqlWithLLM,
} from "@/components/utils/sql-summary.utils";
import GitHubContribution from "@/components/GitHubContribution";

export default function SQLMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();
  const [provider, setProvider] = useState<SqlSummaryProvider>("openai");
  const [openAiKey, setOpenAiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [analysisCautions, setAnalysisCautions] = useState<string[]>([]);
  const [riskFlags, setRiskFlags] = useState<SqlRiskFlag[]>([]);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedProvider = window.localStorage.getItem("sql-summary-provider");
    const storedOpenAiKey = window.localStorage.getItem("sql-summary-openai-key");
    const storedAnthropicKey = window.localStorage.getItem(
      "sql-summary-anthropic-key"
    );

    if (storedProvider === "openai" || storedProvider === "anthropic") {
      setProvider(storedProvider);
    }
    if (storedOpenAiKey) setOpenAiKey(storedOpenAiKey);
    if (storedAnthropicKey) setAnthropicKey(storedAnthropicKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sql-summary-provider", provider);
  }, [provider]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sql-summary-openai-key", openAiKey);
  }, [openAiKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sql-summary-anthropic-key", anthropicKey);
  }, [anthropicKey]);

  const activeApiKey = provider === "openai" ? openAiKey : anthropicKey;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);
      setError("");

      if (value.trim() === "") {
        setOutput("");
        setAnalysisSummary("");
        setAnalysisCautions([]);
        setRiskFlags([]);
        setAnalysisError("");
        setHasAnalyzed(false);
        return;
      }

      const validation = validateSQLInput(value);
      if (!validation.isValid) {
        setError(validation.error || "Invalid input");
        setOutput("");
        setAnalysisSummary("");
        setAnalysisCautions([]);
        setRiskFlags([]);
        setAnalysisError("");
        setHasAnalyzed(false);
        return;
      }

      try {
        const minified = minifySQL(value);
        setOutput(minified);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to minify SQL";
        setError(errorMessage);
        setOutput("");
        setAnalysisError("");
      }
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || error || !activeApiKey) return;
    setIsAnalyzing(true);
    setAnalysisError("");
    setHasAnalyzed(true);
    try {
      const risks = deriveSqlRisks(input);
      setRiskFlags(risks);
      const summary = await summarizeSqlWithLLM(input, provider, activeApiKey);
      setAnalysisSummary(summary.summary);
      setAnalysisCautions(summary.cautions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze SQL";
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeApiKey, error, input, provider]);

  const summaryPlaceholder = isAnalyzing
    ? "Analyzing SQL..."
    : hasAnalyzed
      ? "Summary unavailable."
      : "Run analysis to get a human summary.";

  const riskPlaceholder = isAnalyzing
    ? "Scanning for common SQL risks..."
    : hasAnalyzed
      ? "No obvious risks found."
      : "Run analysis to see risk flags.";

  return (
    <main>
      <Meta
        title="SQL Minifier | Free, Open Source & Ad-free"
        description="Minify SQL by removing comments, extra spaces, and formatting for cleaner, optimized queries."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="SQL Minifier"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-6">
            <Label>SQL</Label>
            <Textarea
              rows={6}
              placeholder="Paste SQL here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>Minified SQL</Label>
            <Textarea
              value={error ? `Error: ${error}` : output}
              rows={6}
              readOnly
              className={`mb-4 ${error ? "text-red-500" : ""}`}
            />
            <Button
              variant="outline"
              onClick={() => handleCopy(output)}
              disabled={!output || !!error}
            >
              {buttonText}
            </Button>

            <div className="border-t border-border pt-6 space-y-5">
              <div>
                <Label className="mb-2 block">Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Generate a human summary and highlight common risks using your
                  own API key.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={provider === "openai" ? "default" : "outline"}
                      onClick={() => setProvider("openai")}
                    >
                      OpenAI
                    </Button>
                    <Button
                      size="sm"
                      variant={provider === "anthropic" ? "default" : "outline"}
                      onClick={() => setProvider("anthropic")}
                    >
                      Anthropic
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {provider === "openai"
                      ? "OpenAI API Key"
                      : "Anthropic API Key"}
                  </Label>
                  <Input
                    type="password"
                    placeholder="Paste your API key"
                    value={activeApiKey}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (provider === "openai") {
                        setOpenAiKey(value);
                      } else {
                        setAnthropicKey(value);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={!input.trim() || !!error || !activeApiKey || isAnalyzing}
                >
                  {isAnalyzing ? "Running Analysis..." : "Run Analysis"}
                </Button>
                {!activeApiKey && (
                  <p className="text-sm text-muted-foreground">
                    Add an API key to enable AI summary.
                  </p>
                )}
                {analysisError && (
                  <p className="text-sm text-red-500">Error: {analysisError}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-input bg-muted px-4 py-3 text-sm space-y-2">
                  <Label>Human Summary</Label>
                  <p className={analysisSummary ? "" : "text-muted-foreground"}>
                    {analysisSummary || summaryPlaceholder}
                  </p>
                  {analysisCautions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Caution notes
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisCautions.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-input bg-muted px-4 py-3 text-sm space-y-2">
                  <Label>Risk Flags</Label>
                  {riskFlags.length === 0 ? (
                    <p className="text-muted-foreground">{riskPlaceholder}</p>
                  ) : (
                    <div className="space-y-2">
                      {riskFlags.map((risk) => (
                        <div
                          key={risk.id}
                          className="flex items-start justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
                        >
                          <div>
                            <p className="font-medium">{risk.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {risk.description}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${riskSeverityClass(risk.severity)}`}
                          >
                            {risk.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="prasang-s" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <SQLMinifierSEO />
      </section>
    </main>
  );
}

const riskSeverityClass = (severity: SqlRiskFlag["severity"]) => {
  switch (severity) {
    case "high":
      return "bg-red-500/15 text-red-600 dark:text-red-400";
    case "medium":
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
    case "low":
    default:
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
};
