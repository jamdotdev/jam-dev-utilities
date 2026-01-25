import {
  JudgeEvaluation,
  ScoreBreakdown,
  getScoreColorClass,
  getScoreBgClass,
} from "@/components/utils/ai-eval-schemas";
import { Trophy } from "lucide-react";

interface ScoreBadgeProps {
  score: number;
  isWinner?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, isWinner, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-3 py-1",
    lg: "text-lg px-4 py-1.5 font-semibold",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${getScoreBgClass(score)}
        ${getScoreColorClass(score)}
      `}
    >
      {isWinner && <Trophy className="h-3.5 w-3.5" />}
      <span>{score.toFixed(1)}</span>
      <span className="opacity-60">/ 10</span>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function ScoreBar({ label, score, maxScore = 10 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 8
              ? "bg-green-500"
              : score >= 5
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-6 text-right ${getScoreColorClass(score)}`}>
        {score}
      </span>
    </div>
  );
}

interface ScoreBreakdownDisplayProps {
  scores: ScoreBreakdown;
  compact?: boolean;
}

export function ScoreBreakdownDisplay({
  scores,
  compact,
}: ScoreBreakdownDisplayProps) {
  const criteria: { key: keyof ScoreBreakdown; label: string }[] = [
    { key: "accuracy", label: "Accuracy" },
    { key: "relevance", label: "Relevance" },
    { key: "clarity", label: "Clarity" },
    { key: "completeness", label: "Completeness" },
    { key: "conciseness", label: "Conciseness" },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2 text-center">
        {criteria.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {label.slice(0, 3)}
            </div>
            <div className={`text-sm font-medium ${getScoreColorClass(scores[key])}`}>
              {scores[key]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {criteria.map(({ key, label }) => (
        <ScoreBar key={key} label={label} score={scores[key]} />
      ))}
    </div>
  );
}

interface EvalScoreDisplayProps {
  evaluation: JudgeEvaluation;
  isWinner?: boolean;
  showBreakdown?: boolean;
}

export function EvalScoreDisplay({
  evaluation,
  isWinner,
  showBreakdown = true,
}: EvalScoreDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Score</span>
        <ScoreBadge
          score={evaluation.overallScore}
          isWinner={isWinner}
          size="md"
        />
      </div>

      {showBreakdown && (
        <div className="pt-2 border-t border-border">
          <ScoreBreakdownDisplay scores={evaluation.scores} />
        </div>
      )}

      {evaluation.reasoning && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {evaluation.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
