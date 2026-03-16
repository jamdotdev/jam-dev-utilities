import { useState, useEffect, useCallback } from "react";
import {
  StoredApiKeys,
  ProviderId,
  StoredApiKeysSchema,
} from "@/components/utils/ai-eval-schemas";
import { validateApiKey } from "@/components/utils/ai-eval-providers";

const STORAGE_KEY = "jam-ai-eval-keys";

export interface UseApiKeysReturn {
  keys: StoredApiKeys;
  setKey: (providerId: ProviderId, key: string) => void;
  removeKey: (providerId: ProviderId) => void;
  hasKey: (providerId: ProviderId) => boolean;
  getKey: (providerId: ProviderId) => string | undefined;
  testKey: (providerId: ProviderId) => Promise<boolean>;
  isLoaded: boolean;
}

export function useApiKeys(): UseApiKeysReturn {
  const [keys, setKeys] = useState<StoredApiKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = StoredApiKeysSchema.safeParse(parsed);
        if (validated.success) {
          setKeys(validated.data);
        }
      }
    } catch (error) {
      console.error("Failed to load API keys from sessionStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to sessionStorage whenever keys change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save API keys to sessionStorage:", error);
    }
  }, [keys, isLoaded]);

  const setKey = useCallback((providerId: ProviderId, key: string) => {
    setKeys((prev) => ({
      ...prev,
      [providerId]: key,
    }));
  }, []);

  const removeKey = useCallback((providerId: ProviderId) => {
    setKeys((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });
  }, []);

  const hasKey = useCallback(
    (providerId: ProviderId) => {
      return Boolean(keys[providerId]);
    },
    [keys]
  );

  const getKey = useCallback(
    (providerId: ProviderId) => {
      return keys[providerId];
    },
    [keys]
  );

  const testKey = useCallback(
    async (providerId: ProviderId): Promise<boolean> => {
      const key = keys[providerId];
      if (!key) return false;
      return validateApiKey(providerId, key);
    },
    [keys]
  );

  return {
    keys,
    setKey,
    removeKey,
    hasKey,
    getKey,
    testKey,
    isLoaded,
  };
}
