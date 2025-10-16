import React, { useRef, useState, useCallback, useMemo } from "react";
import { HarEntry, FilterType, getFilterType, isBase64 } from "../utils/har-utils";
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
  searchQuery?: string;
}

export const HarWaterfall: React.FC<HarWaterfallProps> = ({
  entries,
  activeFilter,
  className = "",
  searchQuery = "",
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

  // Filter entries based on active filter and search query
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Apply content type filter
    if (activeFilter !== "All") {
      result = result.filter((entry) => getFilterType(entry) === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((entry) => {
        // Search in URL
        if (entry.request.url.toLowerCase().includes(query)) return true;

        // Search in request headers
        const requestHeaderMatch = entry.request.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (requestHeaderMatch) return true;

        // Search in response headers
        const responseHeaderMatch = entry.response.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (responseHeaderMatch) return true;

        // Search in request payload
        if (entry.request.postData?.text) {
          if (entry.request.postData.text.toLowerCase().includes(query))
            return true;
        }

        // Search in response content
        if (entry.response.content.text) {
          // For base64 content, try to decode and search
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
