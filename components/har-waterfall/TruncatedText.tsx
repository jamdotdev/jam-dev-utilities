import { cn } from "@/lib/utils";
import { AlertCircle, Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ds/ButtonComponent";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showWarning?: boolean;
  showCopy?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 300,
  className = "",
  showWarning = true,
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? text.substring(0, maxLength) + "..." : text;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 min-w-0">
        <span className={cn("break-all flex-1", className)}>{displayText}</span>
        {showCopy && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 p-0 flex-shrink-0"
            title="Copy full text"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {showWarning && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200/70 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
          <span className="min-w-0 whitespace-normal break-normal leading-relaxed">
            This content is long ({text.length.toLocaleString()} characters).
            Copy the value to view the full content.
          </span>
        </div>
      )}
    </div>
  );
};
