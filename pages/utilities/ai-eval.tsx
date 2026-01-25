import { useState, useCallback, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ds/ButtonComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import CallToActionGrid from "@/components/CallToActionGrid";
import {
  ComparisonMode,
  ModelConfig,
  CriteriaWeights,
  DEFAULT_CRITERIA_WEIGHTS,
  JudgeEvaluation,
} from "@/components/utils/ai-eval-schemas";
import { chat } from "@/components/utils/ai-eval-providers";
import {
  judgeSingleResponse,
  judgeCompareResponses,
} from "@/components/utils/ai-eval-judge";
import { useApiKeys } from "@/components/hooks/useApiKeys";
import { ApiKeyDialog } from "@/components/ai-eval/ApiKeyDialog";
import { EvalModelSelector } from "@/components/ai-eval/EvalModelSelector";
import { EvalResultCard } from "@/components/ai-eval/EvalResultCard";
import { EvalJudgeConfig } from "@/components/ai-eval/EvalJudgeConfig";
import { Play, Loader2, Settings2 } from "lucide-react";

interface ResultData {
  id: string;
  modelId: string;
  promptId: string;
  output: string | null;
  evaluation: JudgeEvaluation | null;
  isLoading: boolean;
  error: string | null;
  latencyMs?: number;
}

export default function AIEval() {
  const apiKeys = useApiKeys();

  // Mode toggle
  const [mode, setMode] = useState<ComparisonMode>("model-vs-model");

  // Prompt configuration
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [userPrompt, setUserPrompt] = useState("");

  // For prompt-vs-prompt mode
  const [promptVariants, setPromptVariants] = useState<string[]>(["", ""]);

  // Model selection
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);
  const [singleModel, setSingleModel] = useState<ModelConfig | null>(null);

  // Judge settings
  const [judgeModel, setJudgeModel] = useState<ModelConfig | null>(null);
  const [criteriaWeights, setCriteriaWeights] = useState<CriteriaWeights>(
    DEFAULT_CRITERIA_WEIGHTS
  );
  const [autoEvaluate, setAutoEvaluate] = useState(true);
  const [showJudgeSettings, setShowJudgeSettings] = useState(false);

  // Results state
  const [results, setResults] = useState<ResultData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [comparisonReasoning, setComparisonReasoning] = useState<string>("");

  // Determine winners
  const winnerIds = useMemo(() => {
    const completed = results.filter((r) => r.evaluation && !r.isLoading && !r.error);
    if (completed.length < 2) return [];
    const maxScore = Math.max(...completed.map((r) => r.evaluation?.overallScore ?? 0));
    return completed
      .filter((r) => (r.evaluation?.overallScore ?? 0) >= maxScore - 0.5)
      .map((r) => r.id);
  }, [results]);

  // Validate if we can run
  const canRun = useMemo(() => {
    if (isRunning) return false;
    if (mode === "model-vs-model") {
      if (!userPrompt.trim()) return false;
      if (selectedModels.length < 2) return false;
      for (const model of selectedModels) {
        if (!apiKeys.hasKey(model.providerId)) return false;
      }
    } else {
      if (!singleModel) return false;
      if (!apiKeys.hasKey(singleModel.providerId)) return false;
      if (promptVariants.filter((p) => p.trim()).length < 2) return false;
    }
    return true;
  }, [isRunning, mode, userPrompt, selectedModels, singleModel, promptVariants, apiKeys]);

  // Run evaluation
  const runEvaluation = useCallback(async () => {
    if (!canRun) return;
    setIsRunning(true);
    setComparisonReasoning("");

    const initialResults: ResultData[] = [];

    if (mode === "model-vs-model") {
      for (const model of selectedModels) {
        initialResults.push({
          id: model.id,
          modelId: model.id,
          promptId: "main",
          output: null,
          evaluation: null,
          isLoading: true,
          error: null,
        });
      }
    } else {
      promptVariants.forEach((_, index) => {
        if (promptVariants[index].trim()) {
          initialResults.push({
            id: `prompt-${index}`,
            modelId: singleModel!.id,
            promptId: `prompt-${index}`,
            output: null,
            evaluation: null,
            isLoading: true,
            error: null,
          });
        }
      });
    }

    setResults(initialResults);

    // Run generations
    const generationResults: ResultData[] = [];

    for (const result of initialResults) {
      const model =
        mode === "model-vs-model"
          ? selectedModels.find((m) => m.id === result.modelId)
          : singleModel;

      const prompt =
        mode === "model-vs-model"
          ? userPrompt
          : promptVariants[parseInt(result.promptId.split("-")[1])];

      if (!model || !prompt) continue;

      const apiKey = apiKeys.getKey(model.providerId);
      if (!apiKey) {
        generationResults.push({
          ...result,
          isLoading: false,
          error: `No API key for ${model.providerId}`,
        });
        continue;
      }

      const startTime = Date.now();

      try {
        const response = await chat(apiKey, {
          model: model.id,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        });

        const latencyMs = Date.now() - startTime;

        generationResults.push({
          ...result,
          output: response.content,
          isLoading: false,
          latencyMs,
        });

        setResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? { ...r, output: response.content, isLoading: false, latencyMs }
              : r
          )
        );
      } catch (error) {
        generationResults.push({
          ...result,
          isLoading: false,
          error: error instanceof Error ? error.message : "Generation failed",
        });

        setResults((prev) =>
          prev.map((r) =>
            r.id === result.id
              ? {
                  ...r,
                  isLoading: false,
                  error: error instanceof Error ? error.message : "Generation failed",
                }
              : r
          )
        );
      }
    }

    // Run judge evaluation
    if (autoEvaluate && judgeModel) {
      const judgeApiKey = apiKeys.getKey(judgeModel.providerId);
      if (judgeApiKey) {
        const successful = generationResults.filter((r) => r.output && !r.error);

        if (successful.length >= 2) {
          try {
            const fullPrompt = `${systemPrompt}\n\n${mode === "model-vs-model" ? userPrompt : promptVariants[0]}`;

            const comparison = await judgeCompareResponses({
              apiKey: judgeApiKey,
              judgeModel: judgeModel.id,
              originalPrompt: fullPrompt,
              responseA: successful[0].output!,
              responseB: successful[1].output!,
              weights: criteriaWeights,
            });

            setComparisonReasoning(comparison.comparisonReasoning);

            setResults((prev) =>
              prev.map((r) => {
                if (r.id === successful[0].id) return { ...r, evaluation: comparison.evaluationA };
                if (r.id === successful[1].id) return { ...r, evaluation: comparison.evaluationB };
                return r;
              })
            );

            // Evaluate remaining
            for (let i = 2; i < successful.length; i++) {
              const result = successful[i];
              try {
                const evaluation = await judgeSingleResponse({
                  apiKey: judgeApiKey,
                  judgeModel: judgeModel.id,
                  originalPrompt: fullPrompt,
                  response: result.output!,
                  weights: criteriaWeights,
                });
                setResults((prev) =>
                  prev.map((r) => (r.id === result.id ? { ...r, evaluation } : r))
                );
              } catch (e) {
                console.error("Judge failed:", e);
              }
            }
          } catch (e) {
            console.error("Comparison failed:", e);
          }
        }
      }
    }

    setIsRunning(false);
  }, [
    canRun,
    mode,
    selectedModels,
    singleModel,
    systemPrompt,
    userPrompt,
    promptVariants,
    apiKeys,
    autoEvaluate,
    judgeModel,
    criteriaWeights,
  ]);

  const addPromptVariant = () => {
    if (promptVariants.length < 4) {
      setPromptVariants([...promptVariants, ""]);
    }
  };

  const removePromptVariant = (index: number) => {
    if (promptVariants.length > 2) {
      setPromptVariants(promptVariants.filter((_, i) => i !== index));
    }
  };

  const updatePromptVariant = (index: number, value: string) => {
    setPromptVariants(promptVariants.map((p, i) => (i === index ? value : p)));
  };

  return (
    <main className="min-h-screen bg-background">
      <Meta
        title="AI Eval Playground | Compare Models & Prompts | Free & Open Source"
        description="Compare AI models and prompts side-by-side with LLM-as-judge scoring. Evaluate GPT-4, Claude, Gemini responses with automated quality metrics."
      />
      <Header />
      <CMDK />

      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <PageHeader
            title="AI Eval Playground"
            description="Compare models and prompts with automated LLM-as-judge scoring"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode("model-vs-model")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "model-vs-model"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Model vs Model
            </button>
            <button
              onClick={() => setMode("prompt-vs-prompt")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "prompt-vs-prompt"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Prompt vs Prompt
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJudgeSettings(!showJudgeSettings)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                showJudgeSettings
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              <Settings2 className="h-4 w-4" />
              Judge Settings
            </button>
            <ApiKeyDialog apiKeys={apiKeys} />
          </div>
        </div>

        {/* Judge Settings Panel (collapsible) */}
        {showJudgeSettings && (
          <div className="mb-6">
            <EvalJudgeConfig
              judgeModel={judgeModel}
              onJudgeModelChange={setJudgeModel}
              weights={criteriaWeights}
              onWeightsChange={setCriteriaWeights}
              autoEvaluate={autoEvaluate}
              onAutoEvaluateChange={setAutoEvaluate}
              apiKeys={apiKeys}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* System Prompt - Full Width */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                System Prompt
              </span>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              className="w-full px-4 py-4 bg-transparent text-sm font-mono resize-none focus:outline-none min-h-[80px]"
              rows={2}
            />
          </div>

          {mode === "model-vs-model" ? (
            <>
              {/* User Prompt - Full Width */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User Prompt
                  </span>
                </div>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="w-full px-4 py-4 bg-transparent text-sm resize-none focus:outline-none min-h-[120px]"
                  rows={4}
                />
              </div>

              {/* Model Selection */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Select Models to Compare
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedModels.length}/4 selected
                  </span>
                </div>
                <div className="p-4">
                  <EvalModelSelector
                    selectedModels={selectedModels}
                    onModelsChange={setSelectedModels}
                    apiKeys={apiKeys}
                    maxSelections={4}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Single Model Selection */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Select Model
                  </span>
                </div>
                <div className="p-4">
                  <EvalModelSelector
                    selectedModels={singleModel ? [singleModel] : []}
                    onModelsChange={(models) => setSingleModel(models[0] || null)}
                    apiKeys={apiKeys}
                    maxSelections={1}
                  />
                </div>
              </div>

              {/* Prompt Variants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promptVariants.map((prompt, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prompt {String.fromCharCode(65 + index)}
                      </span>
                      {promptVariants.length > 2 && (
                        <button
                          onClick={() => removePromptVariant(index)}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => updatePromptVariant(index, e.target.value)}
                      placeholder={`Enter prompt variant ${String.fromCharCode(65 + index)}...`}
                      className="w-full px-4 py-4 bg-transparent text-sm resize-none focus:outline-none min-h-[120px]"
                      rows={4}
                    />
                  </div>
                ))}
              </div>

              {promptVariants.length < 4 && (
                <button
                  onClick={addPromptVariant}
                  className="w-full py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                >
                  + Add Prompt Variant
                </button>
              )}
            </>
          )}

          {/* Run Button */}
          <Button
            onClick={runEvaluation}
            disabled={!canRun}
            size="lg"
            className="w-full h-12 text-base font-medium"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Running Evaluation...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Run Evaluation
              </>
            )}
          </Button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Results</h2>
                {comparisonReasoning && (
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {comparisonReasoning}
                  </p>
                )}
              </div>

              <div
                className={`grid gap-4 ${
                  results.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : results.length === 3
                      ? "grid-cols-1 md:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {results.map((result, index) => {
                  const model =
                    mode === "model-vs-model"
                      ? selectedModels.find((m) => m.id === result.modelId)
                      : singleModel;

                  return (
                    <EvalResultCard
                      key={result.id}
                      label={
                        mode === "model-vs-model"
                          ? model?.name || "Unknown"
                          : `Prompt ${String.fromCharCode(65 + index)}`
                      }
                      sublabel={mode === "model-vs-model" ? undefined : model?.name}
                      output={result.output}
                      evaluation={result.evaluation}
                      isLoading={result.isLoading}
                      error={result.error}
                      isWinner={winnerIds.includes(result.id)}
                      latencyMs={result.latencyMs}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CallToActionGrid />
    </main>
  );
}
