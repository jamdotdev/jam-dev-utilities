import React from "react";
import { getTimingColor } from "./waterfall-utils";

const timingTypes = [
  { key: "dns", label: "DNS Lookup" },
  { key: "connect", label: "Initial Connection" },
  { key: "ssl", label: "SSL/TLS" },
  { key: "wait", label: "Waiting (TTFB)" },
  { key: "receive", label: "Content Download" },
] as const;

export const WaterfallLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Legend
      </span>
      {timingTypes.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: getTimingColor(key) }}
            aria-hidden="true"
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
