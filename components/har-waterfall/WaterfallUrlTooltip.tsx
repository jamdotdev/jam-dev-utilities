import React from "react";

interface WaterfallUrlTooltipProps {
  url: string;
  x: number;
  y: number;
}

export const WaterfallUrlTooltip: React.FC<WaterfallUrlTooltipProps> = ({
  url,
  x,
  y,
}) => {
  // Calculate position to avoid overflow
  const tooltipWidth = 400;
  const offsetX =
    x + tooltipWidth > window.innerWidth ? -tooltipWidth - 10 : 10;
  const offsetY = -30; // Show above cursor

  return (
    <div
      className="fixed z-40 bg-background border border-border rounded px-3 py-2 shadow-lg pointer-events-none"
      style={{
        left: `${x + offsetX}px`,
        top: `${y + offsetY}px`,
        maxWidth: `${tooltipWidth}px`,
      }}
    >
      <p className="text-xs font-mono break-all">{url}</p>
    </div>
  );
};
