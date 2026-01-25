import {
  ModelConfig,
  JudgeEvaluation,
  ComparisonMode,
} from "@/components/utils/ai-eval-schemas";
import { EvalResultCell } from "./EvalResultCell";

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

interface EvalComparisonGridProps {
  mode: ComparisonMode;
  models: ModelConfig[];
  results: ResultData[];
  winnerIds: string[];
}

export function EvalComparisonGrid({
  mode,
  models,
  results,
  winnerIds,
}: EvalComparisonGridProps) {
  // Determine grid columns based on number of items
  const gridCols =
    models.length === 2
      ? "grid-cols-2"
      : models.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4";

  if (mode === "model-vs-model") {
    // In model-vs-model mode, we show one column per model
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {models.map((model, index) => {
          const result = results.find((r) => r.modelId === model.id);
          const label = `Model ${String.fromCharCode(65 + index)}`;

          return (
            <EvalResultCell
              key={model.id}
              label={label}
              model={model}
              output={result?.output ?? null}
              evaluation={result?.evaluation ?? null}
              isLoading={result?.isLoading ?? false}
              error={result?.error ?? null}
              isWinner={result ? winnerIds.includes(result.id) : false}
              latencyMs={result?.latencyMs}
            />
          );
        })}
      </div>
    );
  }

  // In prompt-vs-prompt mode, we show one column per prompt variant
  // Group results by promptId
  const promptIds = Array.from(new Set(results.map((r) => r.promptId)));
  const model = models[0]; // Single model in prompt-vs-prompt mode

  return (
    <div className={`grid ${promptIds.length === 2 ? "grid-cols-2" : promptIds.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"} gap-4`}>
      {promptIds.map((promptId, index) => {
        const result = results.find((r) => r.promptId === promptId);
        const label = `Prompt ${String.fromCharCode(65 + index)}`;

        return (
          <EvalResultCell
            key={promptId}
            label={label}
            model={model}
            output={result?.output ?? null}
            evaluation={result?.evaluation ?? null}
            isLoading={result?.isLoading ?? false}
            error={result?.error ?? null}
            isWinner={result ? winnerIds.includes(result.id) : false}
            latencyMs={result?.latencyMs}
          />
        );
      })}
    </div>
  );
}

// Summary component for showing overall comparison results
interface ComparisonSummaryProps {
  results: ResultData[];
  winnerIds: string[];
  comparisonReasoning?: string;
}

export function ComparisonSummary({
  results,
  winnerIds,
  comparisonReasoning,
}: ComparisonSummaryProps) {
  const completedResults = results.filter(
    (r) => r.output && r.evaluation && !r.isLoading
  );

  if (completedResults.length < 2) {
    return null;
  }

  // Sort by overall score
  const sorted = [...completedResults].sort(
    (a, b) =>
      (b.evaluation?.overallScore ?? 0) - (a.evaluation?.overallScore ?? 0)
  );

  return (
    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold">Comparison Summary</h3>

      <div className="flex items-center gap-4 text-sm">
        {sorted.map((result, index) => {
          const isWinner = winnerIds.includes(result.id);
          return (
            <div
              key={result.id}
              className={`flex items-center gap-2 ${
                isWinner
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <span className="font-mono">#{index + 1}</span>
              <span>{result.modelId}</span>
              <span className="font-semibold">
                {result.evaluation?.overallScore.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {comparisonReasoning && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          {comparisonReasoning}
        </p>
      )}
    </div>
  );
}
