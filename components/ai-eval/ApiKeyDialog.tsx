import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ds/DialogComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Input } from "@/components/ds/InputComponent";
import { Label } from "@/components/ds/LabelComponent";
import { PROVIDERS, ProviderId } from "@/components/utils/ai-eval-schemas";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { Key, Check, X, Loader2, Eye, EyeOff } from "lucide-react";

interface ApiKeyDialogProps {
  apiKeys: UseApiKeysReturn;
  children?: React.ReactNode;
}

interface ProviderKeyInputProps {
  providerId: ProviderId;
  providerName: string;
  apiKeys: UseApiKeysReturn;
}

function ProviderKeyInput({
  providerId,
  providerName,
  apiKeys,
}: ProviderKeyInputProps) {
  const [value, setValue] = useState(apiKeys.getKey(providerId) || "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const hasKey = apiKeys.hasKey(providerId);

  const handleSave = useCallback(() => {
    if (value.trim()) {
      apiKeys.setKey(providerId, value.trim());
      setTestResult(null);
    }
  }, [apiKeys, providerId, value]);

  const handleRemove = useCallback(() => {
    apiKeys.removeKey(providerId);
    setValue("");
    setTestResult(null);
  }, [apiKeys, providerId]);

  const handleTest = useCallback(async () => {
    if (!value.trim()) return;

    // First save the key
    apiKeys.setKey(providerId, value.trim());

    setTesting(true);
    setTestResult(null);

    try {
      const result = await apiKeys.testKey(providerId);
      setTestResult(result);
    } catch {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  }, [apiKeys, providerId, value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{providerName}</Label>
        <div className="flex items-center gap-1">
          {hasKey && testResult === null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Configured
            </span>
          )}
          {testResult === true && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Valid
            </span>
          )}
          {testResult === false && (
            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <X className="h-3 w-3" />
              Invalid
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={`Enter ${providerName} API key`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setTestResult(null);
            }}
            onBlur={handleSave}
            className="pr-10 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={!value.trim() || testing}
          className="shrink-0"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Test"
          )}
        </Button>

        {hasKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export function ApiKeyDialog({ apiKeys, children }: ApiKeyDialogProps) {
  const configuredCount = PROVIDERS.filter((p) =>
    apiKeys.hasKey(p.id)
  ).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
            {configuredCount > 0 && (
              <span className="ml-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-1.5 py-0.5 rounded-full">
                {configuredCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Your API keys are stored in session storage and cleared when you
            close the browser. Keys never leave your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {PROVIDERS.map((provider) => (
            <ProviderKeyInput
              key={provider.id}
              providerId={provider.id}
              providerName={provider.name}
              apiKeys={apiKeys}
            />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Need API keys?{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenAI
            </a>{" "}
            ·{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Anthropic
            </a>{" "}
            ·{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
