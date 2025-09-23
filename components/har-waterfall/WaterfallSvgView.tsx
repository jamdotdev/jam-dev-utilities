import React, { useMemo } from "react";
import { HarEntry } from "../utils/har-utils";
import { WaterfallTiming } from "./waterfall-utils";
import { WaterfallSvgHeader } from "./WaterfallSvgHeader";
import { WaterfallSvgRow } from "./WaterfallSvgRow";

interface WaterfallSvgViewProps {
  entries: HarEntry[];
  timings: WaterfallTiming[];
  zoomLevel: number;
  width: number;
  height: number;
  scrollOffset: { x: number; y: number };
  hoveredIndex: number;
  onRowClick: (index: number) => void;
  onRowHover: (index: number) => void;
  onRowLeave: () => void;
}

export const WaterfallSvgView: React.FC<WaterfallSvgViewProps> = ({
  entries,
  timings,
  zoomLevel,
  width,
  height,
  hoveredIndex,
  onRowClick,
  onRowHover,
  onRowLeave,
}) => {
  // Configuration constants
  const rowHeight = 30;
  const headerHeight = 40;
  const leftPadding = 300;
  const rightPadding = 100;
  const chartWidth = (width - leftPadding - rightPadding) * zoomLevel;

  // Calculate time range for all timings
  const { minTime, timeRange } = useMemo(() => {
    if (timings.length === 0) {
      return { minTime: 0, timeRange: 0 };
    }
    
    const min = Math.min(...timings.map((t) => t.startTime));
    const max = Math.max(...timings.map((t) => t.startTime + t.totalTime));
    const range = max - min;
    
    return { minTime: min, timeRange: range };
  }, [timings]);

  // Calculate total content height
  const contentHeight = Math.max(height, entries.length * rowHeight + headerHeight);

  return (
    <div 
      className="relative overflow-auto bg-background border border-border rounded-lg"
      style={{ height, width }}
    >
      {/* Header */}
      <WaterfallSvgHeader
        width={width}
        headerHeight={headerHeight}
        leftPadding={leftPadding}
        chartWidth={chartWidth}
        minTime={minTime}
        timeRange={timeRange}
      />

      {/* Content area */}
      <div 
        className="relative"
        style={{ 
          height: contentHeight - headerHeight,
          marginTop: 0
        }}
      >
        {/* Rows */}
        {entries.map((entry, index) => {
          const timing = timings[index];
          if (!timing) return null;

          return (
            <WaterfallSvgRow
              key={`${entry.request.url}-${index}`}
              entry={entry}
              timing={timing}
              index={index}
              minTime={minTime}
              timeRange={timeRange}
              chartWidth={chartWidth}
              leftPadding={leftPadding}
              rightPadding={rightPadding}
              rowHeight={rowHeight}
              isHovered={index === hoveredIndex}
              onClick={() => onRowClick(index)}
              onMouseEnter={() => onRowHover(index)}
              onMouseLeave={onRowLeave}
            />
          );
        })}

        {/* Virtual scrolling optimization would go here for large datasets */}
      </div>
    </div>
  );
};