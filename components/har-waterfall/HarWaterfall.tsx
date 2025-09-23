import React, { useRef, useState, useCallback, useMemo } from "react";
import { HarEntry, FilterType, getFilterType } from "../utils/har-utils";
import { WaterfallSvgView } from "./WaterfallSvgView";
import { WaterfallLegend } from "./WaterfallLegend";
import { WaterfallRequestDetails } from "./WaterfallRequestDetails";
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

  const handleRowHover = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleRowLeave = useCallback(() => {
    setHoveredIndex(-1);
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
