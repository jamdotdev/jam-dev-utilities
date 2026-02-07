import { cn } from "@/lib/utils";
import Editor, { BeforeMount } from "@monaco-editor/react";
import { Check, Clock, Copy } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Button } from "../ds/ButtonComponent";
import { HarEntry } from "../utils/har-utils";
import { TruncatedText } from "./TruncatedText";
import {
  WaterfallTiming,
  formatDuration,
  getTimingColor,
} from "./waterfall-utils";

interface WaterfallRequestDetailsProps {
  entry: HarEntry;
  timing: WaterfallTiming;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 w-6 p-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
}> = ({ label, value, helper }) => {
  return (
    <div className="rounded-xl border border-border bg-background/80 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground tabular-nums">
        {value}
      </div>
      {helper && (
        <div className="mt-1 text-[11px] text-muted-foreground">{helper}</div>
      )}
    </div>
  );
};

// Helper function to decode and format content
const decodeContent = (content: string): string => {
  try {
    // Check if content is base64 encoded
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(content.replace(/\s/g, ""))) {
      const decoded = atob(content);
      try {
        return JSON.stringify(JSON.parse(decoded), null, 2);
      } catch {
        return decoded;
      }
    }
    // Try to parse as JSON
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  } catch {
    return content;
  }
};

// Monaco Editor component for content display
const ContentEditor: React.FC<{
  content: string;
  mimeType: string;
  height?: string;
}> = ({ content, mimeType, height = "400px" }) => {
  const beforeMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme("customTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#e4e4e7",
        "editor.lineHighlightBackground": "#18181b",
        "editor.selectionBackground": "#3f3f46",
        "editorCursor.foreground": "#e4e4e7",
        "editorWhitespace.foreground": "#3f3f46",
      },
    });
  }, []);

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 12,
    scrollBeyondLastLine: false,
    padding: { top: 16, bottom: 16 },
    readOnly: true,
    wordWrap: "on" as const,
    wrappingIndent: "indent" as const,
    scrollbar: {
      vertical: "auto" as const,
      horizontal: "auto" as const,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  };

  // Determine language based on mime type
  let language = "plaintext";
  if (mimeType.includes("json")) {
    language = "json";
  } else if (mimeType.includes("xml")) {
    language = "xml";
  } else if (mimeType.includes("html")) {
    language = "html";
  } else if (mimeType.includes("javascript")) {
    language = "javascript";
  } else if (mimeType.includes("css")) {
    language = "css";
  }

  const formattedContent = decodeContent(content);

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <Editor
        value={formattedContent}
        height={height}
        theme="customTheme"
        language={language}
        options={editorOptions}
        beforeMount={beforeMount}
      />
    </div>
  );
};

export const WaterfallRequestDetails: React.FC<
  WaterfallRequestDetailsProps
> = ({ entry, timing }) => {
  const url = new URL(entry.request.url);
  const startedTime = new Date(entry.startedDateTime).toLocaleTimeString(
    "en-US",
    {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    }
  );
  const sizeLabel = `${(entry.response.content.size / 1024).toFixed(1)} KB`;
  const protocolLabel = entry.request.httpVersion || "Not provided";
  const serverIpLabel = entry.serverIPAddress || "Server IP unavailable";
  const mimeTypeLabel =
    entry.response.content.mimeType?.split(";")[0] || "Unknown";

  const timingBreakdown = [
    { label: "DNS Lookup", value: timing.dns, color: getTimingColor("dns") },
    {
      label: "Initial Connection",
      value: timing.connect,
      color: getTimingColor("connect"),
    },
    { label: "SSL/TLS", value: timing.ssl, color: getTimingColor("ssl") },
    {
      label: "Waiting (TTFB)",
      value: timing.wait,
      color: getTimingColor("wait"),
    },
    {
      label: "Content Download",
      value: timing.receive,
      color: getTimingColor("receive"),
    },
  ].filter((item) => item.value > 0);

  // Create timing chart
  const TimingChart = () => {
    const total = timingBreakdown.reduce((sum, item) => sum + item.value, 0);
    return (
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        {timingBreakdown.map((item, index) => (
          <div
            key={index}
            className="h-full"
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border-t border-border bg-muted/10">
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
                  entry.response.status >= 400
                    ? "bg-red-500/10 text-red-500"
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
                {entry.response.status} {entry.response.statusText}
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {entry.request.method}
              </span>
              <span className="text-xs text-muted-foreground">
                {protocolLabel}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{url.hostname}</span>
                <span aria-hidden="true">•</span>
                <span>{serverIpLabel}</span>
              </div>
              <div className="text-lg break-all font-mono font-medium text-foreground">
                <TruncatedText
                  text={url.pathname + url.search}
                  maxLength={200}
                  showWarning={false}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CopyButton text={entry.request.url} />
                <span>Copy full URL</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Size" value={sizeLabel} />
            <MetricCard
              label="Total Time"
              value={formatDuration(timing.totalTime)}
            />
            <MetricCard label="Type" value={mimeTypeLabel} />
            <MetricCard label="Started" value={startedTime} />
            <MetricCard label="Protocol" value={protocolLabel} />
            <MetricCard label="Server IP" value={serverIpLabel} />
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Timing Breakdown
            </div>
            <div className="mt-3">
              <TimingChart />
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              {timingBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-foreground">
                    {formatDuration(item.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-medium text-foreground">
                <span>Total</span>
                <span className="font-mono">
                  {formatDuration(timing.totalTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Request Headers
            </div>
            <div className="mt-3 space-y-2">
              {entry.request.headers.map((header, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,200px),minmax(0,1fr)] gap-4 text-xs"
                >
                  <span className="break-all font-mono text-muted-foreground">
                    {header.name}:
                  </span>
                  <div className="font-mono break-all text-foreground">
                    <TruncatedText
                      text={header.value}
                      maxLength={300}
                      showWarning={header.value.length > 300}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {entry.request.postData && (
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Request Body
                </div>
                <CopyButton text={entry.request.postData.text} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {entry.request.postData.mimeType}
              </div>
              <div className="mt-3">
                <ContentEditor
                  content={entry.request.postData.text}
                  mimeType={entry.request.postData.mimeType}
                  height="260px"
                />
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Response Headers
            </div>
            <div className="mt-3 space-y-2">
              {entry.response.headers.map((header, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,200px),minmax(0,1fr)] gap-4 text-xs"
                >
                  <span className="break-all font-mono text-muted-foreground">
                    {header.name}:
                  </span>
                  <div className="font-mono break-all text-foreground">
                    <TruncatedText
                      text={header.value}
                      maxLength={300}
                      showWarning={header.value.length > 300}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {entry.response.content.text && (
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Response Content
                </div>
                <CopyButton text={entry.response.content.text} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {entry.response.content.mimeType}
              </div>
              <div className="mt-3">
                {entry.response.content.mimeType.startsWith("image/") ? (
                  <div className="flex items-center justify-center rounded-xl border border-border bg-background p-4">
                    <img
                      src={`data:${entry.response.content.mimeType};base64,${entry.response.content.text}`}
                      alt="Response content"
                      className="max-h-96 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <ContentEditor
                    content={entry.response.content.text}
                    mimeType={entry.response.content.mimeType}
                    height="320px"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
