import { useState, useCallback, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import Meta from "@/components/Meta";
import CallToActionGrid from "@/components/CallToActionGrid";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";
import {
  ComparisonMode,
  ModelConfig,
  CriteriaWeights,
  DEFAULT_CRITERIA_WEIGHTS,
  JudgeEvaluation,
  resolveTemplate,
} from "@/components/utils/ai-eval-schemas";
import { chat } from "@/components/utils/ai-eval-providers";
import { judgeSingleResponse, judgeCompareResponses } from "@/components/utils/ai-eval-judge";
import { useApiKeys } from "@/components/hooks/useApiKeys";
import { ApiKeyDialog } from "@/components/ai-eval/ApiKeyDialog";
import { EvalConfigPanel } from "@/components/ai-eval/EvalConfigPanel";
import { EvalMultiModelSelector } from "@/components/ai-eval/EvalModelSelector";
import { EvalJudgePanel } from "@/components/ai-eval/EvalJudgePanel";
import { EvalComparisonGrid, ComparisonSummary } from "@/components/ai-eval/EvalComparisonGrid";
import { Play, Loader2 } from "lucide-react";

interface PromptVariant {
  id: string;
  systemPrompt: string;
  userPrompt: string;
}

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
  const [prompts, setPrompts] = useState<PromptVariant[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Model selection
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);

  // Judge settings
  const [judgeModel, setJudgeModel] = useState<ModelConfig | null>(null);
  const [criteriaWeights, setCriteriaWeights] = useState<CriteriaWeights>(
    DEFAULT_CRITERIA_WEIGHTS
  );
  const [autoEvaluate, setAutoEvaluate] = useState(true);

  // Results state
  const [results, setResults] = useState<ResultData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [comparisonReasoning, setComparisonReasoning] = useState<string>("");

  // Determine winners based on evaluation scores
  const winnerIds = useMemo(() => {
    const completedResults = results.filter(
      (r) => r.evaluation && !r.isLoading && !r.error
    );

    if (completedResults.length < 2) return [];

    const maxScore = Math.max(
      ...completedResults.map((r) => r.evaluation?.overallScore ?? 0)
    );

    // Consider it a winner if within 0.5 of max score (accounting for ties)
    return completedResults
      .filter((r) => (r.evaluation?.overallScore ?? 0) >= maxScore - 0.5)
      .map((r) => r.id);
  }, [results]);

  // Validate if we can run evaluation
  const canRun = useMemo(() => {
    if (isRunning) return false;
    if (prompts.length === 0) return false;

    if (mode === "model-vs-model") {
      if (selectedModels.length < 2) return false;
      // Check if we have API keys for all selected models
      for (const model of selectedModels) {
        if (!apiKeys.hasKey(model.providerId)) return false;
      }
    } else {
      if (selectedModels.length < 1) return false;
      if (prompts.length < 2) return false;
      if (!apiKeys.hasKey(selectedModels[0].providerId)) return false;
    }

    return true;
  }, [isRunning, prompts, mode, selectedModels, apiKeys]);

  // Run evaluation
  const runEvaluation = useCallback(async () => {
    if (!canRun) return;

    setIsRunning(true);
    setComparisonReasoning("");

    // Initialize results
    const initialResults: ResultData[] = [];

    if (mode === "model-vs-model") {
      // One result per model
      for (const model of selectedModels) {
        initialResults.push({
          id: `${model.id}-${prompts[0].id}`,
          modelId: model.id,
          promptId: prompts[0].id,
          output: null,
          evaluation: null,
          isLoading: true,
          error: null,
        });
      }
    } else {
      // One result per prompt
      for (const prompt of prompts) {
        initialResults.push({
          id: `${selectedModels[0].id}-${prompt.id}`,
          modelId: selectedModels[0].id,
          promptId: prompt.id,
          output: null,
          evaluation: null,
          isLoading: true,
          error: null,
        });
      }
    }

    setResults(initialResults);

    // Run generations
    const generationResults: ResultData[] = [];

    for (const result of initialResults) {
      const model = selectedModels.find((m) => m.id === result.modelId);
      const prompt = prompts.find((p) => p.id === result.promptId);

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

      const resolvedUserPrompt = resolveTemplate(prompt.userPrompt, variables);
      const startTime = Date.now();

      try {
        const response = await chat(apiKey, {
          model: model.id,
          messages: [
            { role: "system", content: prompt.systemPrompt },
            { role: "user", content: resolvedUserPrompt },
          ],
        });

        const latencyMs = Date.now() - startTime;

        generationResults.push({
          ...result,
          output: response.content,
          isLoading: false,
          latencyMs,
        });

        // Update UI with generation result
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
                  error:
                    error instanceof Error
                      ? error.message
                      : "Generation failed",
                }
              : r
          )
        );
      }
    }

    // Run evaluation if auto-evaluate is on and we have a judge model
    if (autoEvaluate && judgeModel) {
      const judgeApiKey = apiKeys.getKey(judgeModel.providerId);

      if (judgeApiKey) {
        const successfulResults = generationResults.filter(
          (r) => r.output && !r.error
        );

        if (successfulResults.length >= 2) {
          // Use pairwise comparison for 2 results
          try {
            const prompt = prompts[0];
            const resolvedPrompt = resolveTemplate(prompt.userPrompt, variables);
            const fullPrompt = `${prompt.systemPrompt}\n\n${resolvedPrompt}`;

            const comparison = await judgeCompareResponses({
              apiKey: judgeApiKey,
              judgeModel: judgeModel.id,
              originalPrompt: fullPrompt,
              responseA: successfulResults[0].output!,
              responseB: successfulResults[1].output!,
              weights: criteriaWeights,
            });

            setComparisonReasoning(comparison.comparisonReasoning);

            // Update results with evaluations
            setResults((prev) =>
              prev.map((r) => {
                if (r.id === successfulResults[0].id) {
                  return { ...r, evaluation: comparison.evaluationA };
                }
                if (r.id === successfulResults[1].id) {
                  return { ...r, evaluation: comparison.evaluationB };
                }
                return r;
              })
            );

            // Evaluate remaining results individually
            for (let i = 2; i < successfulResults.length; i++) {
              const result = successfulResults[i];
              try {
                const evaluation = await judgeSingleResponse({
                  apiKey: judgeApiKey,
                  judgeModel: judgeModel.id,
                  originalPrompt: fullPrompt,
                  response: result.output!,
                  weights: criteriaWeights,
                });

                setResults((prev) =>
                  prev.map((r) =>
                    r.id === result.id ? { ...r, evaluation } : r
                  )
                );
              } catch (error) {
                console.error("Judge evaluation failed:", error);
              }
            }
          } catch (error) {
            console.error("Comparison failed:", error);
          }
        } else if (successfulResults.length === 1) {
          // Single result, evaluate individually
          const result = successfulResults[0];
          const prompt = prompts.find((p) => p.id === result.promptId);
          if (prompt) {
            try {
              const resolvedPrompt = resolveTemplate(prompt.userPrompt, variables);
              const fullPrompt = `${prompt.systemPrompt}\n\n${resolvedPrompt}`;

              const evaluation = await judgeSingleResponse({
                apiKey: judgeApiKey,
                judgeModel: judgeModel.id,
                originalPrompt: fullPrompt,
                response: result.output!,
                weights: criteriaWeights,
              });

              setResults((prev) =>
                prev.map((r) =>
                  r.id === result.id ? { ...r, evaluation } : r
                )
              );
            } catch (error) {
              console.error("Judge evaluation failed:", error);
            }
          }
        }
      }
    }

    setIsRunning(false);
  }, [
    canRun,
    mode,
    selectedModels,
    prompts,
    variables,
    apiKeys,
    autoEvaluate,
    judgeModel,
    criteriaWeights,
  ]);

  return (
    <main>
      <Meta
        title="AI Eval Playground | Compare Models & Prompts | Free & Open Source"
        description="Compare AI models and prompts side-by-side with LLM-as-judge scoring. Evaluate GPT-4, Claude, Gemini responses with automated quality metrics. BYOK - your keys stay in your browser."
      />
      <Header />
      <CMDK />

      <section className="container max-w-6xl mb-12">
        <PageHeader
          title="AI Eval Playground"
          description="Compare prompts and models side-by-side with LLM-as-judge scoring"
        />
      </section>

      {/* Mode Toggle & API Keys */}
      <section className="container max-w-6xl mb-6">
        <Card className="p-4 hover:shadow-none shadow-none rounded-xl">
          <div className="flex items-center justify-between">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as ComparisonMode)}
            >
              <TabsList>
                <TabsTrigger value="model-vs-model">Model vs Model</TabsTrigger>
                <TabsTrigger value="prompt-vs-prompt">
                  Prompt vs Prompt
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <ApiKeyDialog apiKeys={apiKeys} />
          </div>
        </Card>
      </section>

      {/* Configuration Grid */}
      <section className="container max-w-6xl mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prompt Configuration - Takes 2 columns */}
          <div className="lg:col-span-2">
            <EvalConfigPanel
              mode={mode}
              onPromptsChange={setPrompts}
              onVariablesChange={setVariables}
            />
          </div>

          {/* Judge Settings - Takes 1 column */}
          <div>
            <EvalJudgePanel
              judgeModel={judgeModel}
              onJudgeModelChange={setJudgeModel}
              comparedModelIds={selectedModels.map((m) => m.id)}
              weights={criteriaWeights}
              onWeightsChange={setCriteriaWeights}
              autoEvaluate={autoEvaluate}
              onAutoEvaluateChange={setAutoEvaluate}
              apiKeys={apiKeys}
            />
          </div>
        </div>
      </section>

      {/* Model Selection */}
      <section className="container max-w-6xl mb-6">
        <Card className="p-6 hover:shadow-none shadow-none rounded-xl">
          <EvalMultiModelSelector
            values={selectedModels}
            onChange={setSelectedModels}
            apiKeys={apiKeys}
            label={
              mode === "model-vs-model"
                ? "Select Models to Compare"
                : "Select Model"
            }
            maxSelections={mode === "model-vs-model" ? 4 : 1}
          />
        </Card>
      </section>

      {/* Run Button */}
      <section className="container max-w-6xl mb-6">
        <Button
          onClick={runEvaluation}
          disabled={!canRun}
          size="lg"
          className="w-full gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Running Evaluation...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Run Evaluation
            </>
          )}
        </Button>
      </section>

      {/* Results Grid */}
      {results.length > 0 && (
        <section className="container max-w-6xl mb-6">
          <EvalComparisonGrid
            mode={mode}
            models={selectedModels}
            results={results}
            winnerIds={winnerIds}
          />

          {comparisonReasoning && (
            <div className="mt-4">
              <ComparisonSummary
                results={results}
                winnerIds={winnerIds}
                comparisonReasoning={comparisonReasoning}
              />
            </div>
          )}
        </section>
      )}

      <CallToActionGrid />
    </main>
  );
}
