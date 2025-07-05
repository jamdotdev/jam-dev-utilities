import React, { useRef, useState, useCallback, useMemo } from "react";
import { HarEntry, FilterType, getFilterType } from "../utils/har-utils";
import { WaterfallCanvas } from "./WaterfallCanvas";
import { WaterfallTooltip } from "./WaterfallTooltip";
import { WaterfallLegend } from "./WaterfallLegend";
import { WaterfallRequestDetails } from "./WaterfallRequestDetails";
import { WaterfallUrlTooltip } from "./WaterfallUrlTooltip";
import { calculateTimings, WaterfallTiming } from "./waterfall-utils";

interface HarWaterfallProps {
  entries: HarEntry[];
  activeFilter: FilterType;
  className?: string;
}

export const HarWaterfall: React.FC<HarWaterfallProps> = ({
  entries,
  activeFilter,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEntry, setHoveredEntry] = useState<{
    entry: HarEntry;
    timing: WaterfallTiming;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredUrl, setHoveredUrl] = useState<{
    url: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: HarEntry;
    timing: WaterfallTiming;
  } | null>(null);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  // Filter entries based on active filter
  const filteredEntries = useMemo(() => {
    if (activeFilter === "All") return entries;
    return entries.filter((entry) => getFilterType(entry) === activeFilter);
  }, [entries, activeFilter]);

  // Calculate timings for all entries
  const timings = useMemo(() => {
    return calculateTimings(filteredEntries);
  }, [filteredEntries]);

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top + scrollOffset.y;

      // Find which entry is being hovered (accounting for header)
      const rowHeight = 30;
      const headerHeight = 40;
      const adjustedY = y - headerHeight;
      const entryIndex = Math.floor(adjustedY / rowHeight);

      if (entryIndex >= 0 && entryIndex < filteredEntries.length) {
        setHoveredEntry({
          entry: filteredEntries[entryIndex],
          timing: timings[entryIndex],
          x: event.clientX,
          y: event.clientY,
        });

        // Check if hovering over URL area (left portion)
        if (x < 300) {
          setHoveredUrl({
            url: filteredEntries[entryIndex].request.url,
            x: event.clientX,
            y: event.clientY,
          });
        } else {
          setHoveredUrl(null);
        }
      } else {
        setHoveredEntry(null);
        setHoveredUrl(null);
      }
    },
    [filteredEntries, timings, scrollOffset]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredEntry(null);
    setHoveredUrl(null);
  }, []);

  // Handle click on request
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = event.clientY - rect.top + scrollOffset.y;

      // Find which entry was clicked
      const rowHeight = 30;
      const headerHeight = 40;
      const adjustedY = y - headerHeight;
      const entryIndex = Math.floor(adjustedY / rowHeight);

      if (entryIndex >= 0 && entryIndex < filteredEntries.length) {
        setSelectedEntry({
          entry: filteredEntries[entryIndex],
          timing: timings[entryIndex],
        });
      }
    },
    [filteredEntries, timings, scrollOffset]
  );

  return (
    <div className={`relative ${className}`}>
      <WaterfallLegend />

      <div
        ref={containerRef}
        className="relative overflow-auto bg-background border border-border rounded-lg cursor-pointer"
        style={{ height: "600px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setScrollOffset({ x: target.scrollLeft, y: target.scrollTop });
        }}
      >
        <WaterfallCanvas
          entries={filteredEntries}
          timings={timings}
          zoomLevel={1}
          width={containerRef.current?.clientWidth || 1200}
          height={Math.max(600, filteredEntries.length * 30 + 40)}
          scrollOffset={scrollOffset}
          hoveredIndex={
            hoveredEntry ? filteredEntries.indexOf(hoveredEntry.entry) : -1
          }
        />
      </div>

      {hoveredUrl && (
        <WaterfallUrlTooltip
          url={hoveredUrl.url}
          x={hoveredUrl.x}
          y={hoveredUrl.y}
        />
      )}

      {hoveredEntry && !hoveredUrl && (
        <WaterfallTooltip
          entry={hoveredEntry.entry}
          timing={hoveredEntry.timing}
          x={hoveredEntry.x}
          y={hoveredEntry.y}
        />
      )}

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
