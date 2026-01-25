import { useState } from "react";
import { Card } from "@/components/ds/CardComponent";
import {
  ModelConfig,
  JudgeEvaluation,
  getProviderById,
} from "@/components/utils/ai-eval-schemas";
import { EvalScoreDisplay, ScoreBadge } from "./EvalScoreDisplay";
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface EvalResultCellProps {
  label: string;
  model: ModelConfig;
  output: string | null;
  evaluation: JudgeEvaluation | null;
  isLoading: boolean;
  error: string | null;
  isWinner?: boolean;
  latencyMs?: number;
}

export function EvalResultCell({
  label,
  model,
  output,
  evaluation,
  isLoading,
  error,
  isWinner,
  latencyMs,
}: EvalResultCellProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const provider = getProviderById(model.providerId);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={`
        p-4 hover:shadow-none shadow-none rounded-xl transition-all
        ${isWinner ? "ring-2 ring-green-500/50" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {isWinner && (
            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              Winner
            </span>
          )}
        </div>
        {evaluation && (
          <ScoreBadge
            score={evaluation.overallScore}
            isWinner={isWinner}
            size="sm"
          />
        )}
      </div>

      {/* Model Info */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <span className="font-medium">{provider?.name}</span>
        <span>·</span>
        <span>{model.name}</span>
        {latencyMs !== undefined && (
          <>
            <span>·</span>
            <span>{(latencyMs / 1000).toFixed(2)}s</span>
          </>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Generating...</span>
        </div>
      ) : error ? (
        <div className="py-4 px-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : output ? (
        <div className="space-y-3">
          {/* Output */}
          <div className="relative">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Output
            </button>
            
            {expanded && (
              <div className="relative group">
                <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">{output}</pre>
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Evaluation */}
          {evaluation && (
            <div className="pt-3 border-t border-border">
              <EvalScoreDisplay
                evaluation={evaluation}
                isWinner={isWinner}
                showBreakdown={true}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm">
          Run evaluation to see output
        </div>
      )}
    </Card>
  );
}
