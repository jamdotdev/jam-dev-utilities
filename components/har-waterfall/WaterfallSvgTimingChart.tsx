import React from "react";
import { WaterfallTiming, getTimingColor } from "./waterfall-utils";

interface WaterfallSvgTimingChartProps {
  timing: WaterfallTiming;
  minTime: number;
  timeRange: number;
  chartWidth: number;
  barHeight: number;
  isHovered?: boolean;
}

export const WaterfallSvgTimingChart: React.FC<WaterfallSvgTimingChartProps> = ({
  timing,
  minTime,
  timeRange,
  chartWidth,
  barHeight,
  isHovered = false,
}) => {
  // Helper function to convert time to x position
  const timeToX = (time: number) => {
    return ((time - minTime) / timeRange) * chartWidth;
  };

  // Define timing segments with colors
  const segments = [
    { type: "dns" as const, time: timing.dns, color: getTimingColor("dns") },
    { type: "connect" as const, time: timing.connect, color: getTimingColor("connect") },
    { type: "ssl" as const, time: timing.ssl, color: getTimingColor("ssl") },
    { type: "wait" as const, time: timing.wait, color: getTimingColor("wait") },
    { type: "receive" as const, time: timing.receive, color: getTimingColor("receive") },
  ];

  const startX = timeToX(timing.startTime);
  let currentX = startX;

  return (
    <svg
      width={chartWidth}
      height={barHeight}
      className={`transition-opacity duration-200 ${isHovered ? 'opacity-90' : 'opacity-100'}`}
      style={{ overflow: 'visible' }}
    >
      {segments.map((segment, index) => {
        if (segment.time <= 0) return null;

        const segmentWidth = (segment.time / timeRange) * chartWidth;
        const rect = (
          <rect
            key={index}
            x={currentX}
            y={0}
            width={segmentWidth}
            height={barHeight}
            fill={segment.color}
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth={0.5}
            className={`transition-all duration-200 ${
              isHovered ? 'brightness-110' : ''
            }`}
            rx={1} // Small border radius for modern look
          />
        );

        currentX += segmentWidth;
        return rect;
      })}
    </svg>
  );
};