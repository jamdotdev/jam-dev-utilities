import React from "react";

interface WaterfallSvgHeaderProps {
  width: number;
  headerHeight: number;
  leftPadding: number;
  chartWidth: number;
  minTime: number;
  timeRange: number;
}

export const WaterfallSvgHeader: React.FC<WaterfallSvgHeaderProps> = ({
  width,
  headerHeight,
  leftPadding,
  chartWidth,
  minTime,
  timeRange,
}) => {
  // Helper function to convert time to x position
  const timeToX = (time: number) => {
    return leftPadding + ((time - minTime) / timeRange) * chartWidth;
  };

  const timeStep = timeRange / 10;

  return (
    <div 
      className="sticky top-0 z-10 bg-muted border-b border-border"
      style={{ height: headerHeight }}
    >
      {/* Header Background */}
      <div className="absolute inset-0 bg-muted" />
      
      {/* Header Labels */}
      <div className="relative flex items-center h-full text-muted-foreground text-sm">
        <div className="absolute left-4 flex items-center gap-8">
          <span>Status</span>
          <span>Time</span>
          <span>Path</span>
        </div>
      </div>

      {/* Time Scale SVG */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={width}
        height={headerHeight}
        style={{ overflow: 'visible' }}
      >
        {/* Vertical grid lines */}
        {Array.from({ length: 11 }, (_, i) => {
          const time = minTime + i * timeStep;
          const x = timeToX(time);
          return (
            <g key={i}>
              <line
                x1={x}
                y1={headerHeight}
                x2={x}
                y2={headerHeight + 600} // Extend down to cover chart area
                stroke="hsl(var(--border))"
                strokeWidth={1}
                opacity={0.3}
              />
              <text
                x={x}
                y={headerHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
              >
                {(time - minTime).toFixed(0)}ms
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};