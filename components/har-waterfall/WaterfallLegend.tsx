import React from "react";
import { getTimingColor } from "./waterfall-utils";

const timingTypes = [
  { key: "dns", label: "DNS Lookup" },
  { key: "connect", label: "Initial Connection" },
  { key: "ssl", label: "SSL/TLS Negotiation" },
  { key: "wait", label: "Waiting (TTFB)" },
  { key: "receive", label: "Content Download" },
] as const;

export const WaterfallLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 text-xs">
      {timingTypes.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getTimingColor(key) }}
          />
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
};
