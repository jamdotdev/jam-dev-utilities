import { useCallback, useMemo } from "react";
import {
  PROVIDERS,
  ModelConfig,
} from "@/components/utils/ai-eval-schemas";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { ChevronDown, AlertCircle } from "lucide-react";

interface EvalModelSelectorProps {
  value: ModelConfig | null;
  onChange: (model: ModelConfig | null) => void;
  apiKeys: UseApiKeysReturn;
  label?: string;
  excludeModels?: string[];
  showWarning?: boolean;
  warningText?: string;
}

export function EvalModelSelector({
  value,
  onChange,
  apiKeys,
  label,
  excludeModels = [],
  showWarning = false,
  warningText,
}: EvalModelSelectorProps) {
  // Group models by provider with availability status
  const providerGroups = useMemo(() => {
    return PROVIDERS.map((provider) => ({
      ...provider,
      hasKey: apiKeys.hasKey(provider.id),
      models: provider.models.filter((m) => !excludeModels.includes(m.id)),
    }));
  }, [apiKeys, excludeModels]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const modelId = e.target.value;
      if (!modelId) {
        onChange(null);
        return;
      }

      for (const provider of PROVIDERS) {
        const model = provider.models.find((m) => m.id === modelId);
        if (model) {
          onChange(model);
          return;
        }
      }
    },
    [onChange]
  );

  const selectedProviderId = value?.providerId;
  const hasKeyForSelected = selectedProviderId
    ? apiKeys.hasKey(selectedProviderId)
    : true;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value?.id || ""}
          onChange={handleChange}
          className="w-full h-10 pl-3 pr-10 rounded-lg border border-input bg-muted text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
        >
          <option value="">Select a model...</option>
          {providerGroups.map((provider) => (
            <optgroup
              key={provider.id}
              label={`${provider.name}${!provider.hasKey ? " (no API key)" : ""}`}
            >
              {provider.models.map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  disabled={!provider.hasKey}
                >
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {!hasKeyForSelected && value && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Add API key for {value.providerId} to use this model
        </p>
      )}

      {showWarning && warningText && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {warningText}
        </p>
      )}
    </div>
  );
}

// Multi-select version for selecting multiple models
interface EvalMultiModelSelectorProps {
  values: ModelConfig[];
  onChange: (models: ModelConfig[]) => void;
  apiKeys: UseApiKeysReturn;
  label?: string;
  maxSelections?: number;
}

export function EvalMultiModelSelector({
  values,
  onChange,
  apiKeys,
  label,
  maxSelections = 4,
}: EvalMultiModelSelectorProps) {
  const selectedIds = useMemo(() => new Set(values.map((m) => m.id)), [values]);

  const providerGroups = useMemo(() => {
    return PROVIDERS.map((provider) => ({
      ...provider,
      hasKey: apiKeys.hasKey(provider.id),
    }));
  }, [apiKeys]);

  const handleToggle = useCallback(
    (model: ModelConfig) => {
      if (selectedIds.has(model.id)) {
        onChange(values.filter((m) => m.id !== model.id));
      } else if (values.length < maxSelections) {
        onChange([...values, model]);
      }
    },
    [values, onChange, selectedIds, maxSelections]
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          <span className="text-muted-foreground font-normal ml-2">
            ({values.length}/{maxSelections})
          </span>
        </label>
      )}

      <div className="space-y-4">
        {providerGroups.map((provider) => (
          <div key={provider.id}>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              {provider.name}
              {!provider.hasKey && (
                <span className="text-amber-600 dark:text-amber-400">
                  (no API key)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.models.map((model) => {
                const isSelected = selectedIds.has(model.id);
                const isDisabled =
                  !provider.hasKey ||
                  (!isSelected && values.length >= maxSelections);

                return (
                  <button
                    key={model.id}
                    onClick={() => !isDisabled && handleToggle(model)}
                    disabled={isDisabled}
                    className={`
                      px-3 py-1.5 text-sm rounded-lg border transition-colors
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : isDisabled
                            ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                            : "bg-background text-foreground border-border hover:border-primary hover:bg-accent"
                      }
                    `}
                  >
                    {model.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
