import React, { useMemo, useState } from "react";
import {
  HarEntry,
  FilterType,
  getFilterType,
  isBase64,
} from "../utils/har-utils";
import { WaterfallLegend } from "./WaterfallLegend";
import { WaterfallRequestDetails } from "./WaterfallRequestDetails";
import {
  calculateTimings,
  formatDuration,
  getTimingColor,
  WaterfallTiming,
} from "./waterfall-utils";
import { cn } from "@/lib/utils";
import SearchHighlightText from "@/components/SearchHighlightText";

interface HarWaterfallProps {
  entries: HarEntry[];
  activeFilter: FilterType;
  className?: string;
  searchQuery?: string;
}

type WaterfallSegment = {
  key: "dns" | "connect" | "ssl" | "wait" | "receive";
  label: string;
  time: number;
  color: string;
};

const segmentDefinitions: WaterfallSegment[] = [
  { key: "dns", label: "DNS", time: 0, color: getTimingColor("dns") },
  {
    key: "connect",
    label: "Connect",
    time: 0,
    color: getTimingColor("connect"),
  },
  { key: "ssl", label: "SSL", time: 0, color: getTimingColor("ssl") },
  { key: "wait", label: "Wait", time: 0, color: getTimingColor("wait") },
  {
    key: "receive",
    label: "Receive",
    time: 0,
    color: getTimingColor("receive"),
  },
];

export const HarWaterfall: React.FC<HarWaterfallProps> = ({
  entries,
  activeFilter,
  className = "",
  searchQuery = "",
}) => {
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: HarEntry;
    timing: WaterfallTiming;
  } | null>(null);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (activeFilter !== "All") {
      result = result.filter((entry) => getFilterType(entry) === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((entry) => {
        if (entry.request.url.toLowerCase().includes(query)) return true;

        const requestHeaderMatch = entry.request.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (requestHeaderMatch) return true;

        const responseHeaderMatch = entry.response.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (responseHeaderMatch) return true;

        if (entry.request.postData?.text) {
          if (entry.request.postData.text.toLowerCase().includes(query))
            return true;
        }

        if (entry.response.content.text) {
          let contentToSearch = entry.response.content.text;
          if (isBase64(contentToSearch)) {
            try {
              contentToSearch = atob(contentToSearch);
            } catch (e) {
              // If decode fails, search in original
            }
          }
          if (contentToSearch.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    return result;
  }, [entries, activeFilter, searchQuery]);

  const timings = useMemo(() => {
    return calculateTimings(filteredEntries);
  }, [filteredEntries]);

  const timeRange = useMemo(() => {
    if (timings.length === 0) return 1;
    const maxTime = Math.max(
      ...timings.map((timing) => timing.startTime + timing.totalTime)
    );
    return maxTime > 0 ? maxTime : 1;
  }, [timings]);

  const tickCount = 6;
  const ticks = useMemo(() => {
    return Array.from({ length: tickCount + 1 }, (_, index) => {
      const value = (timeRange / tickCount) * index;
      return {
        label: formatDuration(value),
        value,
        position: (index / tickCount) * 100,
      };
    });
  }, [timeRange, tickCount]);

  const gridStyle = useMemo(
    () => ({
      backgroundImage:
        "linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px)",
      backgroundSize: `${100 / tickCount}% 100%`,
    }),
    [tickCount]
  );

  const getSegments = (timing: WaterfallTiming) => {
    const segments = segmentDefinitions
      .map((segment) => ({
        ...segment,
        time: timing[segment.key],
      }))
      .filter((segment) => segment.time > 0);

    let cursor = timing.startTime;
    return segments.map((segment) => {
      const left = (cursor / timeRange) * 100;
      const width = (segment.time / timeRange) * 100;
      cursor += segment.time;
      return {
        ...segment,
        left,
        width,
      };
    });
  };

  const getTimingLabel = (timing: WaterfallTiming) => {
    const parts = segmentDefinitions
      .map((segment) => ({
        ...segment,
        time: timing[segment.key],
      }))
      .filter((segment) => segment.time > 0)
      .map((segment) => `${segment.label} ${formatDuration(segment.time)}`);

    if (parts.length === 0) {
      return `Total ${formatDuration(timing.totalTime)}`;
    }

    return `${parts.join(", ")}. Total ${formatDuration(timing.totalTime)}.`;
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <WaterfallLegend />
        <div className="text-xs text-muted-foreground">
          Timeline range {formatDuration(timeRange)} · {filteredEntries.length}{" "}
          requests
        </div>
      </div>

      <div
        className="border border-border rounded-xl bg-background overflow-x-auto"
        role="region"
        aria-label="HAR waterfall timeline"
      >
        <div className="min-w-[980px]">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
            <div className="grid grid-cols-[120px,110px,minmax(0,1.6fr),minmax(260px,2.4fr),100px] gap-4 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <div>Status</div>
              <div>Started</div>
              <div>Request</div>
              <div className="relative">
                <span className="sr-only">Waterfall timeline</span>
                {ticks.map((tick, index) => (
                  <span
                    key={index}
                    className={cn(
                      "absolute top-0",
                      index === 0 && "translate-x-0",
                      index !== 0 && "-translate-x-1/2"
                    )}
                    style={{ left: `${tick.position}%` }}
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
              <div className="text-right">Total</div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No requests match your current filters.
            </div>
          ) : (
            <div role="list" className="divide-y divide-border">
              {filteredEntries.map((entry, index) => {
                const timing = timings[index];
                const url = new URL(entry.request.url);
                const displayPath = url.pathname + url.search;
                const segments = getSegments(timing);
                const isError = entry.response.status >= 400;
                const rowLabel = `${entry.request.method} ${displayPath} ${entry.response.status} ${formatDuration(
                  timing.totalTime
                )}`;

                return (
                  <button
                    key={`${entry.request.url}-${entry.startedDateTime}-${index}`}
                    type="button"
                    role="listitem"
                    onClick={() => setSelectedEntry({ entry, timing })}
                    aria-label={`Open request details for ${rowLabel}`}
                    aria-haspopup="dialog"
                    className={cn(
                      "group w-full text-left transition-colors",
                      index % 2 === 0 ? "bg-muted/15" : "bg-background",
                      "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                    )}
                  >
                    <div className="grid grid-cols-[120px,110px,minmax(0,1.6fr),minmax(260px,2.4fr),100px] items-center gap-4 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            isError ? "bg-red-500" : "bg-emerald-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isError ? "text-red-500" : "text-emerald-500"
                          )}
                        >
                          {entry.response.status}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {entry.request.method}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground tabular-nums">
                        {new Date(entry.startedDateTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )}
                      </div>

                      <div className="min-w-0" title={entry.request.url}>
                        <div className="text-xs text-muted-foreground">
                          {url.hostname}
                        </div>
                        <div className="truncate text-sm font-medium text-foreground">
                          {searchQuery ? (
                            <SearchHighlightText
                              text={displayPath}
                              searchQuery={searchQuery}
                            />
                          ) : (
                            displayPath
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="uppercase tracking-wider">
                            {entry.response.content.mimeType.split(";")[0]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {(entry.response.content.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        <div
                          className="relative h-3 rounded-full bg-muted/50"
                          style={gridStyle}
                          aria-hidden="true"
                        >
                          {segments.map((segment) => (
                            <span
                              key={`${segment.key}-${index}`}
                              className="absolute h-full rounded-full"
                              style={{
                                left: `${segment.left}%`,
                                width: `${segment.width}%`,
                                backgroundColor: segment.color,
                              }}
                            />
                          ))}
                        </div>
                        <span className="sr-only">
                          {getTimingLabel(timing)}
                        </span>
                      </div>

                      <div className="text-xs tabular-nums text-right text-muted-foreground">
                        {formatDuration(timing.totalTime)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <WaterfallRequestDetails
          entry={selectedEntry.entry}
          timing={selectedEntry.timing}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};
