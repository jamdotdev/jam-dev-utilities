import React, { useState } from "react";
import {
  EnvVariable,
  getSecuritySummary,
} from "@/components/utils/config-doctor.utils";
import { cn } from "@/lib/utils";
import AIExplainer from "./AIExplainer";

interface SecurityWarningsProps {
  variables: EnvVariable[];
}

const RiskIcon = ({ level }: { level: EnvVariable["riskLevel"] }) => {
  switch (level) {
    case "danger":
      return (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          className="w-4 h-4 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "safe":
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

const RiskBadge = ({ level }: { level: EnvVariable["riskLevel"] }) => {
  const colors = {
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    safe: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  const labels = {
    danger: "Secret",
    warning: "Review",
    safe: "Safe",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        colors[level]
      )}
    >
      {labels[level]}
    </span>
  );
};

export default function SecurityWarnings({ variables }: SecurityWarningsProps) {
  const [expandedVar, setExpandedVar] = useState<string | null>(null);
  const summary = getSecuritySummary(variables);

  if (variables.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Paste your .env file above to see security analysis
      </div>
    );
  }

  // Sort by risk level: danger first, then warning, then safe
  const sortedVariables = [...variables].sort((a, b) => {
    const order = { danger: 0, warning: 1, safe: 2 };
    return order[a.riskLevel] - order[b.riskLevel];
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium">{summary.total}</span>
          <span className="text-muted-foreground">variables</span>
        </div>
        {summary.danger > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <RiskIcon level="danger" />
            <span className="font-medium">{summary.danger}</span>
            <span>secrets</span>
          </div>
        )}
        {summary.warning > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400">
            <RiskIcon level="warning" />
            <span className="font-medium">{summary.warning}</span>
            <span>to review</span>
          </div>
        )}
        {summary.safe > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <RiskIcon level="safe" />
            <span className="font-medium">{summary.safe}</span>
            <span>safe</span>
          </div>
        )}
      </div>

      {/* Variables list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sortedVariables.map((variable) => {
          const isExpanded = expandedVar === variable.key;

          return (
            <div
              key={`${variable.key}-${variable.line}`}
              className={cn(
                "rounded-lg border transition-colors",
                variable.riskLevel === "danger"
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                  : variable.riskLevel === "warning"
                    ? "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10"
                    : "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10"
              )}
            >
              <button
                onClick={() => setExpandedVar(isExpanded ? null : variable.key)}
                className="w-full px-3 py-2 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <RiskIcon level={variable.riskLevel} />
                  <span className="font-mono text-sm truncate">
                    {variable.key}
                  </span>
                  <RiskBadge level={variable.riskLevel} />
                </div>
                <svg
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                    isExpanded && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Type:</span>{" "}
                    {variable.secretType.replace(/_/g, " ")}
                  </div>
                  {variable.recommendation && (
                    <div className="text-sm">
                      <span className="font-medium">Recommendation:</span>{" "}
                      {variable.recommendation}
                    </div>
                  )}
                  {variable.riskLevel !== "safe" && (
                    <AIExplainer variable={variable} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
