import { useState } from "react";
import { JudgeEvaluation, getScoreColorClass } from "@/components/utils/ai-eval-schemas";
import { Loader2, AlertCircle, Copy, Check, Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface EvalResultCardProps {
  label: string;
  sublabel?: string;
  output: string | null;
  evaluation: JudgeEvaluation | null;
  isLoading: boolean;
  error: string | null;
  isWinner?: boolean;
  latencyMs?: number;
}

export function EvalResultCard({
  label,
  sublabel,
  output,
  evaluation,
  isLoading,
  error,
  isWinner,
  latencyMs,
}: EvalResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`
        rounded-xl border-2 bg-card overflow-hidden transition-all
        ${isWinner ? "border-green-500/50 shadow-lg shadow-green-500/10" : "border-border"}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isWinner && <Trophy className="h-4 w-4 text-green-500" />}
          <div>
            <span className="font-semibold text-sm">{label}</span>
            {sublabel && (
              <span className="text-xs text-muted-foreground ml-2">{sublabel}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {latencyMs !== undefined && (
            <span className="text-xs text-muted-foreground">
              {(latencyMs / 1000).toFixed(2)}s
            </span>
          )}
          {evaluation && (
            <div
              className={`
                px-3 py-1 rounded-full text-sm font-bold
                ${isWinner ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted"}
                ${getScoreColorClass(evaluation.overallScore)}
              `}
            >
              {evaluation.overallScore.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            <span className="text-sm">Generating response...</span>
          </div>
        ) : error ? (
          <div className="py-8 px-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : output ? (
          <div className="space-y-4">
            {/* Output Text */}
            <div className="relative group">
              <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{output}</pre>
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-md bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Evaluation Scores */}
            {evaluation && (
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setShowScoreDetails(!showScoreDetails)}
                  className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Score Breakdown</span>
                  {showScoreDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showScoreDetails && (
                  <div className="mt-4 space-y-3">
                    {[
                      { key: "accuracy", label: "Accuracy" },
                      { key: "relevance", label: "Relevance" },
                      { key: "clarity", label: "Clarity" },
                      { key: "completeness", label: "Completeness" },
                      { key: "conciseness", label: "Conciseness" },
                    ].map(({ key, label }) => {
                      const score = evaluation.scores[key as keyof typeof evaluation.scores];
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-24">{label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                score >= 8 ? "bg-green-500" : score >= 5 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium w-6 text-right ${getScoreColorClass(score)}`}>
                            {score}
                          </span>
                        </div>
                      );
                    })}

                    {evaluation.reasoning && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-3">
                        {evaluation.reasoning}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Run evaluation to see output
          </div>
        )}
      </div>
    </div>
  );
}
