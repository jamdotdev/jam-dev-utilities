import React, { useState, useCallback } from "react";
import { HarEntry } from "../utils/har-utils";
import {
  WaterfallTiming,
  formatDuration,
  getTimingColor,
} from "./waterfall-utils";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Clock,
  FileText,
  Send,
  Download,
  Code,
} from "lucide-react";
import { Button } from "../ds/ButtonComponent";
import { cn } from "@/lib/utils";
import { TruncatedText } from "./TruncatedText";
import { Dialog, DialogContent } from "../ds/DialogComponent";
import Editor, { BeforeMount } from "@monaco-editor/react";

interface WaterfallRequestDetailsProps {
  entry: HarEntry;
  timing: WaterfallTiming;
  onClose: () => void;
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  timingChart?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  defaultOpen = false,
  children,
  timingChart,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-background border-b border-border last:border-b-0">
      <button
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          <span className="font-medium text-sm">{title}</span>
          {timingChart && (
            <div className="flex-1 max-w-xs ml-2">{timingChart}</div>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

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
> = ({ entry, timing, onClose }) => {
  const url = new URL(entry.request.url);

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-x-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Status Badge */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
                    entry.response.status >= 400
                      ? "bg-red-500/10 text-red-500"
                      : "bg-green-500/10 text-green-500"
                  )}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  {entry.response.status} {entry.response.statusText}
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {entry.request.method}
                </span>
              </div>

              {/* URL Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {url.hostname}
                  </p>
                  <CopyButton text={entry.request.url} />
                </div>
                <div className="text-lg break-all font-mono font-medium text-foreground">
                  <TruncatedText
                    text={url.pathname + url.search}
                    maxLength={200}
                    showWarning={false}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-3 px-3 py-2 bg-background/60 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Size
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {(entry.response.content.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 bg-background/60 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Duration
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatDuration(timing.totalTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 bg-background/60 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Type
                    </span>
                    <span className="text-sm font-medium">
                      {entry.response.content.mimeType
                        .split("/")[1]
                        ?.toUpperCase() || "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 bg-background/60 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Started
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {new Date(entry.startedDateTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          fractionalSecondDigits: 3,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 bg-muted/20">
          {/* Timing Breakdown */}
          <Section
            title="Timing Breakdown"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            timingChart={<TimingChart />}
          >
            <div className="space-y-3">
              {timingBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono">
                    {formatDuration(item.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-medium">Total Time</span>
                <span className="text-sm font-mono font-medium">
                  {formatDuration(timing.totalTime)}
                </span>
              </div>
            </div>
          </Section>

          {/* Request Headers */}
          <Section
            title="Request Headers"
            icon={<Send className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-1">
              {entry.request.headers.map((header, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,200px),minmax(0,1fr)] gap-4 py-1.5"
                >
                  <span className="text-xs break-all font-mono text-muted-foreground">
                    {header.name}:
                  </span>
                  <div className="text-xs font-mono break-all overflow-hidden">
                    <TruncatedText
                      text={header.value}
                      maxLength={300}
                      showWarning={header.value.length > 300}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Response Headers */}
          <Section
            title="Response Headers"
            icon={<Download className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-1">
              {entry.response.headers.map((header, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,200px),minmax(0,1fr)] gap-4 py-1.5"
                >
                  <span className="text-xs break-all font-mono text-muted-foreground">
                    {header.name}:
                  </span>
                  <div className="text-xs font-mono break-all overflow-hidden">
                    <TruncatedText
                      text={header.value}
                      maxLength={300}
                      showWarning={header.value.length > 300}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Request Body */}
          {entry.request.postData && (
            <Section
              title="Request Body"
              icon={<Code className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Type: {entry.request.postData.mimeType}
                  </span>
                  <CopyButton text={entry.request.postData.text} />
                </div>
                <ContentEditor
                  content={entry.request.postData.text}
                  mimeType={entry.request.postData.mimeType}
                  height="300px"
                />
              </div>
            </Section>
          )}

          {/* Response Content */}
          {entry.response.content.text && (
            <Section
              title="Response Content"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Type: {entry.response.content.mimeType}
                  </span>
                  <CopyButton text={entry.response.content.text} />
                </div>
                {entry.response.content.mimeType.startsWith("image/") ? (
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                    <img
                      src={`data:${entry.response.content.mimeType};base64,${entry.response.content.text}`}
                      alt="Response image"
                      className="max-w-full max-h-96 object-contain"
                    />
                  </div>
                ) : (
                  <ContentEditor
                    content={entry.response.content.text}
                    mimeType={entry.response.content.mimeType}
                    height="400px"
                  />
                )}
              </div>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
