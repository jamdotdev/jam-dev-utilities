import { useCallback } from "react";
import { Slider } from "@/components/ds/SliderComponent";
import {
  ModelConfig,
  CriteriaWeights,
  DEFAULT_CRITERIA_WEIGHTS,
  PROVIDERS,
} from "@/components/utils/ai-eval-schemas";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { ChevronDown } from "lucide-react";

interface EvalJudgeConfigProps {
  judgeModel: ModelConfig | null;
  onJudgeModelChange: (model: ModelConfig | null) => void;
  weights: CriteriaWeights;
  onWeightsChange: (weights: CriteriaWeights) => void;
  autoEvaluate: boolean;
  onAutoEvaluateChange: (value: boolean) => void;
  apiKeys: UseApiKeysReturn;
}

const CRITERIA = [
  { key: "accuracy" as const, label: "Accuracy", desc: "Factual correctness" },
  { key: "relevance" as const, label: "Relevance", desc: "Addresses the prompt" },
  { key: "clarity" as const, label: "Clarity", desc: "Clear and organized" },
  { key: "completeness" as const, label: "Completeness", desc: "Comprehensive" },
  { key: "conciseness" as const, label: "Conciseness", desc: "Appropriate length" },
];

export function EvalJudgeConfig({
  judgeModel,
  onJudgeModelChange,
  weights,
  onWeightsChange,
  autoEvaluate,
  onAutoEvaluateChange,
  apiKeys,
}: EvalJudgeConfigProps) {
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    if (!modelId) {
      onJudgeModelChange(null);
      return;
    }
    for (const provider of PROVIDERS) {
      const model = provider.models.find((m) => m.id === modelId);
      if (model) {
        onJudgeModelChange(model);
        return;
      }
    }
  };

  const updateWeight = useCallback(
    (key: keyof CriteriaWeights, value: number) => {
      const newValue = value / 100;
      const newWeights = { ...weights, [key]: newValue };
      const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
      if (total > 0) {
        Object.keys(newWeights).forEach((k) => {
          newWeights[k as keyof CriteriaWeights] /= total;
        });
      }
      onWeightsChange(newWeights);
    },
    [weights, onWeightsChange]
  );

  const resetWeights = () => onWeightsChange(DEFAULT_CRITERIA_WEIGHTS);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Judge Configuration
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Judge Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Judge Model</label>
            <div className="relative">
              <select
                value={judgeModel?.id || ""}
                onChange={handleModelChange}
                className="w-full h-11 pl-4 pr-10 rounded-lg border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select judge model...</option>
                {PROVIDERS.map((provider) => (
                  <optgroup
                    key={provider.id}
                    label={`${provider.name}${!apiKeys.hasKey(provider.id) ? " (no key)" : ""}`}
                  >
                    {provider.models.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        disabled={!apiKeys.hasKey(provider.id)}
                      >
                        {model.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Use a different model than compared models
            </p>
          </div>

          {/* Auto-evaluate Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Auto-evaluate</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => onAutoEvaluateChange(!autoEvaluate)}
                className={`
                  relative w-11 h-6 rounded-full transition-colors cursor-pointer
                  ${autoEvaluate ? "bg-primary" : "bg-muted"}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform
                    ${autoEvaluate ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                Score responses after generation
              </span>
            </label>
          </div>

          {/* Reset Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Criteria Weights</label>
              <button
                onClick={resetWeights}
                className="text-xs text-primary hover:underline"
              >
                Reset to default
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Adjust how each criterion affects the overall score
            </p>
          </div>
        </div>

        {/* Criteria Sliders */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          {CRITERIA.map(({ key, label, desc }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round(weights[key] * 100)}%
                </span>
              </div>
              <Slider
                value={[Math.round(weights[key] * 100)]}
                onValueChange={(values) => updateWeight(key, values[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
