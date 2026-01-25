import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Input } from "@/components/ds/InputComponent";
import {
  extractVariables,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_USER_PROMPT,
  ComparisonMode,
} from "@/components/utils/ai-eval-schemas";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ds/ButtonComponent";

interface PromptVariant {
  id: string;
  systemPrompt: string;
  userPrompt: string;
}

interface EvalConfigPanelProps {
  mode: ComparisonMode;
  onPromptsChange: (prompts: PromptVariant[]) => void;
  onVariablesChange: (variables: Record<string, string>) => void;
}

export function EvalConfigPanel({
  mode,
  onPromptsChange,
  onVariablesChange,
}: EvalConfigPanelProps) {
  // For model-vs-model mode, we have a single prompt
  // For prompt-vs-prompt mode, we have multiple prompt variants
  const [prompts, setPrompts] = useState<PromptVariant[]>([
    {
      id: "prompt-1",
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userPrompt: DEFAULT_USER_PROMPT,
    },
  ]);

  const [variables, setVariables] = useState<Record<string, string>>({
    question: "",
  });

  // Extract all variables from all prompts
  const allVariables = useMemo(() => {
    const vars = new Set<string>();
    prompts.forEach((p) => {
      extractVariables(p.systemPrompt).forEach((v) => vars.add(v));
      extractVariables(p.userPrompt).forEach((v) => vars.add(v));
    });
    return Array.from(vars);
  }, [prompts]);

  // Update variables state when new variables are detected
  useEffect(() => {
    setVariables((prev) => {
      const next: Record<string, string> = {};
      allVariables.forEach((v) => {
        next[v] = prev[v] ?? "";
      });
      return next;
    });
  }, [allVariables]);

  // Notify parent of changes
  useEffect(() => {
    onPromptsChange(prompts);
  }, [prompts, onPromptsChange]);

  useEffect(() => {
    onVariablesChange(variables);
  }, [variables, onVariablesChange]);

  const updatePrompt = useCallback(
    (id: string, field: "systemPrompt" | "userPrompt", value: string) => {
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  const addPromptVariant = useCallback(() => {
    const newId = `prompt-${Date.now()}`;
    setPrompts((prev) => [
      ...prev,
      {
        id: newId,
        systemPrompt: prev[0]?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        userPrompt: prev[0]?.userPrompt || DEFAULT_USER_PROMPT,
      },
    ]);
  }, []);

  const removePromptVariant = useCallback((id: string) => {
    setPrompts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const updateVariable = useCallback((name: string, value: string) => {
    setVariables((prev) => ({ ...prev, [name]: value }));
  }, []);

  // In model-vs-model mode, show single prompt config
  if (mode === "model-vs-model") {
    const prompt = prompts[0];
    return (
      <Card className="p-6 hover:shadow-none shadow-none rounded-xl">
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              System Prompt
            </Label>
            <Textarea
              rows={3}
              placeholder="You are a helpful assistant..."
              value={prompt.systemPrompt}
              onChange={(e) =>
                updatePrompt(prompt.id, "systemPrompt", e.target.value)
              }
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              User Prompt
            </Label>
            <Textarea
              rows={4}
              placeholder="Enter your prompt here. Use {{variable}} for dynamic values."
              value={prompt.userPrompt}
              onChange={(e) =>
                updatePrompt(prompt.id, "userPrompt", e.target.value)
              }
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use {"{{variableName}}"} to create dynamic inputs
            </p>
          </div>

          {allVariables.length > 0 && (
            <div>
              <Label className="mb-3 block text-sm font-medium">Variables</Label>
              <div className="space-y-3">
                {allVariables.map((varName) => (
                  <div key={varName} className="flex items-center gap-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono min-w-[100px]">
                      {"{{"}{varName}{"}}"}
                    </code>
                    <Input
                      placeholder={`Enter value for ${varName}`}
                      value={variables[varName] || ""}
                      onChange={(e) => updateVariable(varName, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // In prompt-vs-prompt mode, show multiple prompt editors
  return (
    <div className="space-y-4">
      {prompts.map((prompt, index) => (
        <Card
          key={prompt.id}
          className="p-6 hover:shadow-none shadow-none rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Prompt Variant {String.fromCharCode(65 + index)}
            </h3>
            {prompts.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePromptVariant(prompt.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                System Prompt
              </Label>
              <Textarea
                rows={2}
                placeholder="You are a helpful assistant..."
                value={prompt.systemPrompt}
                onChange={(e) =>
                  updatePrompt(prompt.id, "systemPrompt", e.target.value)
                }
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                User Prompt
              </Label>
              <Textarea
                rows={3}
                placeholder="Enter your prompt variant here..."
                value={prompt.userPrompt}
                onChange={(e) =>
                  updatePrompt(prompt.id, "userPrompt", e.target.value)
                }
                className="font-mono text-sm"
              />
            </div>
          </div>
        </Card>
      ))}

      {prompts.length < 4 && (
        <Button
          variant="outline"
          onClick={addPromptVariant}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Prompt Variant
        </Button>
      )}

      {allVariables.length > 0 && (
        <Card className="p-6 hover:shadow-none shadow-none rounded-xl">
          <Label className="mb-3 block text-sm font-medium">
            Shared Variables
          </Label>
          <div className="space-y-3">
            {allVariables.map((varName) => (
              <div key={varName} className="flex items-center gap-3">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono min-w-[100px]">
                  {"{{"}{varName}{"}}"}
                </code>
                <Input
                  placeholder={`Enter value for ${varName}`}
                  value={variables[varName] || ""}
                  onChange={(e) => updateVariable(varName, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
