import React, { useRef, useState, useCallback, useMemo } from "react";
import { HarEntry, FilterType, getFilterType } from "../utils/har-utils";
import { WaterfallSvgView } from "./WaterfallSvgView";
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
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
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

  // Filter entries based on active filter
  const filteredEntries = useMemo(() => {
    if (activeFilter === "All") return entries;
    return entries.filter((entry) => getFilterType(entry) === activeFilter);
  }, [entries, activeFilter]);

  // Calculate timings for all entries
  const timings = useMemo(() => {
    return calculateTimings(filteredEntries);
  }, [filteredEntries]);

  // Handle row interactions
  const handleRowClick = useCallback((index: number) => {
    if (index >= 0 && index < filteredEntries.length) {
      setSelectedEntry({
        entry: filteredEntries[index],
        timing: timings[index],
      });
    }
  }, [filteredEntries, timings]);

  const handleRowHover = useCallback((index: number, x: number, y: number, isUrlHover: boolean = false) => {
    setHoveredIndex(index);
    
    if (index >= 0 && index < filteredEntries.length) {
      if (isUrlHover) {
        setHoveredUrl({
          url: filteredEntries[index].request.url,
          x,
          y,
        });
        setHoveredEntry(null);
      } else {
        setHoveredEntry({
          entry: filteredEntries[index],
          timing: timings[index],
          x,
          y,
        });
        setHoveredUrl(null);
      }
    }
  }, [filteredEntries, timings]);

  const handleRowLeave = useCallback(() => {
    setHoveredIndex(-1);
    setHoveredEntry(null);
    setHoveredUrl(null);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <WaterfallLegend />

      <WaterfallSvgView
        entries={filteredEntries}
        timings={timings}
        zoomLevel={1}
        width={containerRef.current?.clientWidth || 1200}
        height={600}
        scrollOffset={{ x: 0, y: 0 }}
        hoveredIndex={hoveredIndex}
        onRowClick={handleRowClick}
        onRowHover={handleRowHover}
        onRowLeave={handleRowLeave}
      />

      {/* Tooltips */}
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
