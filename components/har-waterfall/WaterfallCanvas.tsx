import React, { useRef, useEffect } from "react";
import { HarEntry } from "../utils/har-utils";
import { WaterfallTiming, getTimingColor } from "./waterfall-utils";

interface WaterfallCanvasProps {
  entries: HarEntry[];
  timings: WaterfallTiming[];
  zoomLevel: number;
  width: number;
  height: number;
  scrollOffset: { x: number; y: number };
  hoveredIndex: number;
}

const smallFont = "11px -apple-system, BlinkMacSystemFont, sans-serif";
const mediumFont = "12px -apple-system, BlinkMacSystemFont, sans-serif";

export const WaterfallCanvas: React.FC<WaterfallCanvasProps> = ({
  entries,
  timings,
  zoomLevel,
  width,
  height,
  scrollOffset,
  hoveredIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Configuration
    const rowHeight = 30;
    const headerHeight = 40;
    const leftPadding = 300; // Space for URL
    const rightPadding = 100; // Space for time label
    const chartWidth = (width - leftPadding - rightPadding) * zoomLevel;

    // Calculate time range
    const minTime = Math.min(...timings.map((t) => t.startTime));
    const maxTime = Math.max(...timings.map((t) => t.startTime + t.totalTime));
    const timeRange = maxTime - minTime;

    // Helper function to convert time to x position
    const timeToX = (time: number) => {
      return leftPadding + ((time - minTime) / timeRange) * chartWidth;
    };

    // Draw background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    // Vertical lines (time markers)
    const timeStep = timeRange / 10;
    for (let i = 0; i <= 10; i++) {
      const x = timeToX(minTime + i * timeStep);
      ctx.beginPath();
      ctx.moveTo(x, headerHeight);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw entries (offset by header height)
    entries.forEach((entry, index) => {
      const timing = timings[index];
      const y = index * rowHeight + headerHeight;
      const isHovered = index === hoveredIndex;

      // Row background
      if (isHovered) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
        ctx.fillRect(0, y, width, rowHeight);
        // Add subtle indicator for clickable area
        ctx.fillStyle = "rgba(99, 102, 241, 0.05)";
        ctx.fillRect(0, y, leftPadding, rowHeight);
      } else if (index % 2 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
        ctx.fillRect(0, y, width, rowHeight);
      }

      // Status indicator dot
      const statusColor = entry.response.status >= 400 ? "#ef4444" : "#10b981";
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(15, y + rowHeight / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Status code
      ctx.fillStyle = entry.response.status >= 400 ? "#dc2626" : "#059669";
      ctx.font = smallFont;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(entry.response.status.toString(), 25, y + rowHeight / 2);

      // Timestamp
      const timestamp = new Date(entry.startedDateTime).toLocaleTimeString(
        "en-US",
        {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );

      ctx.fillStyle = "#9ca3af";
      ctx.font = smallFont;
      ctx.fillText(timestamp, 55, y + rowHeight / 2);

      // URL text
      ctx.save();
      ctx.beginPath();
      ctx.rect(120, y, leftPadding - 130, rowHeight);
      ctx.clip();

      ctx.fillStyle = entry.response.status >= 400 ? "#e11d48" : "#1f2937";
      ctx.font = mediumFont;
      ctx.textBaseline = "middle";

      const url = new URL(entry.request.url);
      const displayText = url.pathname + url.search;
      ctx.fillText(displayText, 125, y + rowHeight / 2);

      ctx.restore();

      // Draw timing bars
      const barHeight = 16;
      const barY = y + (rowHeight - barHeight) / 2;

      // Draw each timing segment
      const segments = [
        { type: "dns", time: timing.dns, color: getTimingColor("dns") },
        {
          type: "connect",
          time: timing.connect,
          color: getTimingColor("connect"),
        },
        { type: "ssl", time: timing.ssl, color: getTimingColor("ssl") },
        { type: "wait", time: timing.wait, color: getTimingColor("wait") },
        {
          type: "receive",
          time: timing.receive,
          color: getTimingColor("receive"),
        },
      ];

      let currentX = timeToX(timing.startTime);

      segments.forEach((segment) => {
        if (segment.time > 0) {
          const segmentWidth = (segment.time / timeRange) * chartWidth;

          ctx.fillStyle = segment.color;
          ctx.fillRect(currentX, barY, segmentWidth, barHeight);

          // Add slight border for clarity
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(currentX, barY, segmentWidth, barHeight);

          currentX += segmentWidth;
        }
      });

      // Time label
      ctx.fillStyle = "#9ca3af";
      ctx.font = mediumFont;
      ctx.textAlign = "right";
      ctx.fillText(
        `${timing.totalTime.toFixed(0)}ms`,
        width - 20,
        y + rowHeight / 2
      );
      ctx.textAlign = "left";

      // Separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + rowHeight);
      ctx.lineTo(width, y + rowHeight);
      ctx.stroke();
    });

    // Draw header background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, headerHeight);

    // Header border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(width, headerHeight);
    ctx.stroke();

    // Header labels
    ctx.fillStyle = "#6b7280";
    ctx.font = mediumFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Status", 15, headerHeight / 2);
    ctx.fillText("Time", 65, headerHeight / 2);
    ctx.fillText("Path", 125, headerHeight / 2);

    // Time scale labels
    ctx.textAlign = "center";
    ctx.font = smallFont;

    for (let i = 0; i <= 10; i++) {
      const time = minTime + i * timeStep;
      const x = timeToX(time);
      ctx.fillText(`${(time - minTime).toFixed(0)}ms`, x, headerHeight / 2);
    }
  }, [entries, timings, zoomLevel, width, height, scrollOffset, hoveredIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
};
