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
import { PROVIDERS, ProviderId } from "@/components/utils/ai-eval-schemas";
import { UseApiKeysReturn } from "@/components/hooks/useApiKeys";
import { Key, Check, X, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface ApiKeyDialogProps {
  apiKeys: UseApiKeysReturn;
  children?: React.ReactNode;
}

interface ProviderKeyRowProps {
  providerId: ProviderId;
  providerName: string;
  apiKeys: UseApiKeysReturn;
  keyUrl: string;
}

function ProviderKeyRow({ providerId, providerName, apiKeys, keyUrl }: ProviderKeyRowProps) {
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
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{providerName}</span>
          {hasKey && testResult === null && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Configured
            </span>
          )}
          {testResult === true && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Valid
            </span>
          )}
          {testResult === false && (
            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <X className="h-3 w-3" />
              Invalid
            </span>
          )}
        </div>
        <a
          href={keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Get key
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            placeholder={`Enter ${providerName} API key`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setTestResult(null);
            }}
            onBlur={handleSave}
            className="w-full h-10 pl-3 pr-10 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={!value.trim() || testing}
          className="h-10 px-4"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
        </Button>

        {hasKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="h-10 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

const PROVIDER_KEY_URLS: Record<ProviderId, string> = {
  openai: "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  google: "https://aistudio.google.com/app/apikey",
};

export function ApiKeyDialog({ apiKeys, children }: ApiKeyDialogProps) {
  const configuredCount = PROVIDERS.filter((p) => apiKeys.hasKey(p.id)).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 h-10">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
            {configuredCount > 0 && (
              <span className="ml-1 flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                {configuredCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Keys are stored in session storage and cleared when you close the browser.
            Your keys never leave your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {PROVIDERS.map((provider) => (
            <ProviderKeyRow
              key={provider.id}
              providerId={provider.id}
              providerName={provider.name}
              apiKeys={apiKeys}
              keyUrl={PROVIDER_KEY_URLS[provider.id]}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
