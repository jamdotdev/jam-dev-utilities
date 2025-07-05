import React, { useState } from "react";
import { Button } from "../ds/ButtonComponent";
import { Copy, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showWarning?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 300,
  className = "",
  showWarning = true,
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
      </div>
      {showWarning && (
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          <span>
            This content is very long ({text.length.toLocaleString()}{" "}
            characters). Copy and paste into your editor to view the full
            content.
          </span>
        </div>
      )}
    </div>
  );
};
