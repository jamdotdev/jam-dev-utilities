import React from "react";
import { HarEntry } from "../utils/har-utils";
import { WaterfallTiming, formatDuration } from "./waterfall-utils";
import { WaterfallSvgTimingChart } from "./WaterfallSvgTimingChart";

interface WaterfallSvgRowProps {
  entry: HarEntry;
  timing: WaterfallTiming;
  index: number;
  minTime: number;
  timeRange: number;
  chartWidth: number;
  leftPadding: number;
  rightPadding: number;
  rowHeight: number;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const WaterfallSvgRowComponent: React.FC<WaterfallSvgRowProps> = ({
  entry,
  timing,
  index,
  minTime,
  timeRange,
  chartWidth,
  leftPadding,
  rightPadding,
  rowHeight,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const url = new URL(entry.request.url);
  const displayText = url.pathname + url.search;
  const timestamp = new Date(entry.startedDateTime).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const textColor = entry.response.status >= 400 ? "text-destructive" : "text-foreground";

  return (
    <div
      className={`
        flex items-center
        border-b border-border/30 
        cursor-pointer 
        transition-colors duration-200
        ${isHovered ? 'bg-accent/50' : index % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
        hover:bg-accent/30
      `}
      style={{ height: rowHeight }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="row"
      tabIndex={0}
      aria-label={`Request to ${entry.request.url}, status ${entry.response.status}, duration ${formatDuration(timing.totalTime)}`}
    >
      {/* Left section with status, time, and URL */}
      <div 
        className="flex items-center gap-3 px-4 min-w-0"
        style={{ width: leftPadding }}
      >
        {/* Status indicator dot */}
        <div
          className={`w-2 h-2 rounded-full ${
            entry.response.status >= 400 
              ? 'bg-destructive' 
              : 'bg-green-500'
          }`}
          aria-hidden="true"
        />
        
        {/* Status code */}
        <span className={`text-sm font-mono min-w-[3ch] ${textColor}`}>
          {entry.response.status}
        </span>
        
        {/* Timestamp */}
        <span className="text-xs text-muted-foreground font-mono min-w-[5.5ch]">
          {timestamp}
        </span>
        
        {/* URL */}
        <span 
          className={`text-sm truncate ${textColor}`}
          title={entry.request.url}
        >
          {displayText}
        </span>
      </div>

      {/* Timing chart section */}
      <div className="flex-1 relative flex items-center">
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2"
          style={{ width: chartWidth }}
        >
          <WaterfallSvgTimingChart
            timing={timing}
            minTime={minTime}
            timeRange={timeRange}
            chartWidth={chartWidth}
            barHeight={16}
            isHovered={isHovered}
          />
        </div>
      </div>

      {/* Right section with duration */}
      <div 
        className="flex items-center justify-end px-4"
        style={{ width: rightPadding }}
      >
        <span className="text-sm text-muted-foreground font-mono">
          {formatDuration(timing.totalTime)}
        </span>
      </div>
    </div>
  );
};

WaterfallSvgRowComponent.displayName = 'WaterfallSvgRow';

export const WaterfallSvgRow = React.memo(WaterfallSvgRowComponent);