import React from "react";
import { HarEntry } from "../utils/har-utils";
import {
  WaterfallTiming,
  formatDuration,
  getTimingColor,
} from "./waterfall-utils";

interface WaterfallTooltipProps {
  entry: HarEntry;
  timing: WaterfallTiming;
  x: number;
  y: number;
}

export const WaterfallTooltip: React.FC<WaterfallTooltipProps> = ({
  entry,
  timing,
  x,
  y,
}) => {
  const url = new URL(entry.request.url);
  const size = entry.response.content.size;

  // Position tooltip to avoid edge overflow
  const tooltipWidth = 320;
  const tooltipHeight = 280;
  const offsetX =
    x + tooltipWidth > window.innerWidth ? -tooltipWidth - 10 : 10;
  const offsetY =
    y + tooltipHeight > window.innerHeight ? -tooltipHeight + 40 : 10;

  const timingBreakdown = [
    { label: "DNS Lookup", value: timing.dns, color: getTimingColor("dns") },
    {
      label: "Initial Connection",
      value: timing.connect,
      color: getTimingColor("connect"),
    },
    { label: "SSL", value: timing.ssl, color: getTimingColor("ssl") },
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

  return (
    <div
      className="fixed z-50 bg-background border border-border rounded-lg shadow-2xl p-4"
      style={{
        left: `${x + offsetX}px`,
        top: `${y + offsetY}px`,
        width: `${tooltipWidth}px`,
      }}
    >
      {/* URL and Status */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">{url.hostname}</div>
        <div className="text-sm font-medium text-foreground truncate">
          {url.pathname}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span
            className={`text-xs font-medium ${
              entry.response.status >= 400 ? "text-red-500" : "text-green-500"
            }`}
          >
            {entry.response.status} {entry.response.statusText}
          </span>
          <span className="text-xs text-muted-foreground">
            {entry.request.method}
          </span>
          <span className="text-xs text-muted-foreground">
            {(size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>

      {/* Total Time */}
      <div className="mb-3 pb-3 border-b border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Time</span>
          <span className="text-sm font-semibold text-foreground">
            {formatDuration(timing.totalTime)}
          </span>
        </div>
      </div>

      {/* Timing Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Timing Breakdown
        </div>
        {timingBreakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {formatDuration(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Resource Type */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Type</span>
          <span className="text-xs text-foreground">
            {entry.response.content.mimeType}
          </span>
        </div>
      </div>
    </div>
  );
};
