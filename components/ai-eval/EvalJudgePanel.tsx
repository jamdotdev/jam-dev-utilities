import { useCallback, useMemo } from "react";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Slider } from "@/components/ds/SliderComponent";
import {
  ModelConfig,
  CriteriaWeights,
  DEFAULT_CRITERIA_WEIGHTS,
} from "@/components/utils/ai-eval-schemas";
import { EvalModelSelector } from "./EvalModelSelector";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { AlertCircle, Scale } from "lucide-react";

interface EvalJudgePanelProps {
  judgeModel: ModelConfig | null;
  onJudgeModelChange: (model: ModelConfig | null) => void;
  comparedModelIds: string[];
  weights: CriteriaWeights;
  onWeightsChange: (weights: CriteriaWeights) => void;
  autoEvaluate: boolean;
  onAutoEvaluateChange: (value: boolean) => void;
  apiKeys: UseApiKeysReturn;
}

const CRITERIA_INFO: {
  key: keyof CriteriaWeights;
  label: string;
  description: string;
}[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    description: "Factual correctness",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Addresses the prompt",
  },
  {
    key: "clarity",
    label: "Clarity",
    description: "Well-organized and clear",
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Comprehensive coverage",
  },
  {
    key: "conciseness",
    label: "Conciseness",
    description: "Appropriately detailed",
  },
];

export function EvalJudgePanel({
  judgeModel,
  onJudgeModelChange,
  comparedModelIds,
  weights,
  onWeightsChange,
  autoEvaluate,
  onAutoEvaluateChange,
  apiKeys,
}: EvalJudgePanelProps) {
  // Check if judge model is same as compared models
  const judgeMatchesCompared = useMemo(() => {
    if (!judgeModel) return false;
    return comparedModelIds.includes(judgeModel.id);
  }, [judgeModel, comparedModelIds]);

  // Calculate total weight percentage
  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((sum, w) => sum + w, 0);
  }, [weights]);

  const updateWeight = useCallback(
    (key: keyof CriteriaWeights, value: number) => {
      // Normalize value to percentage (0-1)
      const newValue = value / 100;
      const newWeights = { ...weights, [key]: newValue };

      // Normalize all weights to sum to 1
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

  const resetWeights = useCallback(() => {
    onWeightsChange(DEFAULT_CRITERIA_WEIGHTS);
  }, [onWeightsChange]);

  return (
    <Card className="p-6 hover:shadow-none shadow-none rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Judge Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Judge Model Selection */}
        <div>
          <EvalModelSelector
            value={judgeModel}
            onChange={onJudgeModelChange}
            apiKeys={apiKeys}
            label="Judge Model"
            showWarning={judgeMatchesCompared}
            warningText="Using same model as compared - consider using a different judge"
          />
        </div>

        {/* Auto-evaluate toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Auto-evaluate</Label>
            <p className="text-xs text-muted-foreground">
              Automatically score responses after generation
            </p>
          </div>
          <Checkbox
            checked={autoEvaluate}
            onCheckedChange={(checked) =>
              onAutoEvaluateChange(checked === true)
            }
          />
        </div>

        {/* Criteria Weights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm">Criteria Weights</Label>
            <button
              onClick={resetWeights}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {CRITERIA_INFO.map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {description}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
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
              </div>
            ))}
          </div>

          {Math.abs(totalWeight - 1) > 0.01 && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Weights will be normalized to sum to 100%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
