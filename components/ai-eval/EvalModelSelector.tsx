import { useCallback, useMemo } from "react";
import { PROVIDERS, ModelConfig } from "@/components/utils/ai-eval-schemas";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { Check } from "lucide-react";

interface EvalModelSelectorProps {
  selectedModels: ModelConfig[];
  onModelsChange: (models: ModelConfig[]) => void;
  apiKeys: UseApiKeysReturn;
  maxSelections: number;
}

export function EvalModelSelector({
  selectedModels,
  onModelsChange,
  apiKeys,
  maxSelections,
}: EvalModelSelectorProps) {
  const selectedIds = useMemo(
    () => new Set(selectedModels.map((m) => m.id)),
    [selectedModels]
  );

  const handleToggle = useCallback(
    (model: ModelConfig) => {
      if (selectedIds.has(model.id)) {
        onModelsChange(selectedModels.filter((m) => m.id !== model.id));
      } else if (selectedModels.length < maxSelections) {
        onModelsChange([...selectedModels, model]);
      } else if (maxSelections === 1) {
        onModelsChange([model]);
      }
    },
    [selectedModels, onModelsChange, selectedIds, maxSelections]
  );

  return (
    <div className="space-y-6">
      {PROVIDERS.map((provider) => {
        const hasKey = apiKeys.hasKey(provider.id);

        return (
          <div key={provider.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">{provider.name}</span>
              {!hasKey && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                  No API key
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {provider.models.map((model) => {
                const isSelected = selectedIds.has(model.id);
                const isDisabled =
                  !hasKey || (!isSelected && selectedModels.length >= maxSelections && maxSelections > 1);

                return (
                  <button
                    key={model.id}
                    onClick={() => !isDisabled && handleToggle(model)}
                    disabled={isDisabled}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : isDisabled
                            ? "border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                      }
                    `}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4" />
                    )}
                    {model.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
