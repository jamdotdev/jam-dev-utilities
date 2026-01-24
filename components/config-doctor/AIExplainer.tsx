import React, { useState, useCallback, useRef, useEffect } from "react";
import { EnvVariable } from "@/components/utils/config-doctor.utils";
import { Button } from "@/components/ds/ButtonComponent";

interface AIExplainerProps {
  variable: EnvVariable;
}

type LoadingState = "idle" | "loading-model" | "generating" | "done" | "error";

// WebLLM types
interface ChatCompletionMessageParam {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MLCEngine {
  reload: (model: string) => Promise<void>;
  chat: {
    completions: {
      create: (params: {
        messages: ChatCompletionMessageParam[];
        max_tokens?: number;
        temperature?: number;
      }) => Promise<{ choices: Array<{ message: { content: string } }> }>;
    };
  };
}

interface InitProgressReport {
  progress: number;
  text: string;
}

// Global engine instance to reuse across components
let globalEngine: MLCEngine | null = null;
let engineLoadPromise: Promise<MLCEngine> | null = null;

const MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";

async function getOrCreateEngine(
  onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngine> {
  if (globalEngine) {
    return globalEngine;
  }

  if (engineLoadPromise) {
    return engineLoadPromise;
  }

  engineLoadPromise = (async () => {
    // Dynamically import WebLLM
    const webllm = await import("@mlc-ai/web-llm");
    const engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback: onProgress,
    });
    globalEngine = engine;
    return engine;
  })();

  return engineLoadPromise;
}

function buildPrompt(variable: EnvVariable): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: `You are a security expert reviewing deployment configuration for a web application. Be concise and helpful. Respond in 2-3 short sentences.`,
    },
    {
      role: "user",
      content: `I have an environment variable in my .env file:
Key: ${variable.key}
Detected as: ${variable.secretType.replace(/_/g, " ")}
Risk level: ${variable.riskLevel}

Explain briefly:
1. Why this might be sensitive
2. What could happen if it's exposed
3. How to handle it securely`,
    },
  ];
}

export default function AIExplainer({ variable }: AIExplainerProps) {
  const [state, setState] = useState<LoadingState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(
    null
  );
  const abortRef = useRef(false);

  // Check WebGPU support on mount
  useEffect(() => {
    const checkWebGPU = async () => {
      try {
        if (!navigator.gpu) {
          setIsWebGPUSupported(false);
          return;
        }
        const adapter = await navigator.gpu.requestAdapter();
        setIsWebGPUSupported(adapter !== null);
      } catch {
        setIsWebGPUSupported(false);
      }
    };
    checkWebGPU();
  }, []);

  const handleExplain = useCallback(async () => {
    if (state === "loading-model" || state === "generating") {
      return;
    }

    abortRef.current = false;
    setError(null);
    setExplanation(null);

    try {
      setState("loading-model");
      setProgress(0);
      setProgressText("Initializing AI model...");

      const engine = await getOrCreateEngine((report) => {
        if (abortRef.current) return;
        setProgress(Math.round(report.progress * 100));
        setProgressText(report.text);
      });

      if (abortRef.current) return;

      setState("generating");
      setProgressText("Analyzing security implications...");

      const messages = buildPrompt(variable);
      const response = await engine.chat.completions.create({
        messages,
        max_tokens: 256,
        temperature: 0.7,
      });

      if (abortRef.current) return;

      const content = response.choices[0]?.message?.content;
      if (content) {
        setExplanation(content);
        setState("done");
      } else {
        throw new Error("No response from model");
      }
    } catch (err) {
      if (abortRef.current) return;
      console.error("AI Explainer error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate explanation"
      );
      setState("error");
    }
  }, [variable, state]);

  // Reset when variable changes
  useEffect(() => {
    setExplanation(null);
    setError(null);
    setState("idle");
  }, [variable.key]);

  // WebGPU not supported
  if (isWebGPUSupported === false) {
    return (
      <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
        <p className="font-medium mb-1">AI Explanation unavailable</p>
        <p>
          Your browser doesn&apos;t support WebGPU, which is required for
          client-side AI. Try Chrome 113+ or Edge 113+.
        </p>
      </div>
    );
  }

  // Still checking WebGPU
  if (isWebGPUSupported === null) {
    return null;
  }

  return (
    <div className="mt-2">
      {state === "idle" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExplain}
          className="text-xs"
        >
          <SparklesIcon className="w-3 h-3 mr-1.5" />
          Explain with AI
        </Button>
      )}

      {(state === "loading-model" || state === "generating") && (
        <div className="p-3 rounded-md bg-muted/50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <LoadingSpinner />
            <span>
              {state === "loading-model"
                ? "Loading AI model..."
                : "Generating explanation..."}
            </span>
          </div>
          {state === "loading-model" && (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {progressText}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              abortRef.current = true;
              setState("idle");
            }}
            className="text-xs"
          >
            Cancel
          </Button>
        </div>
      )}

      {state === "done" && explanation && (
        <div className="p-3 rounded-md bg-muted/50 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="w-3 h-3" />
            AI Security Analysis
          </div>
          <p className="text-sm leading-relaxed">{explanation}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExplanation(null);
              setState("idle");
            }}
            className="text-xs"
          >
            Dismiss
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="p-3 rounded-md bg-destructive/10 text-sm">
          <p className="text-destructive font-medium">
            Failed to generate explanation
          </p>
          {error && (
            <p className="text-muted-foreground text-xs mt-1">{error}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExplain}
            className="text-xs mt-2"
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
