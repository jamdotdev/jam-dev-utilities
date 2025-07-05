import { HarEntry } from "../utils/har-utils";

export interface WaterfallTiming {
  startTime: number;
  dns: number;
  connect: number;
  ssl: number;
  wait: number;
  receive: number;
  totalTime: number;
}

const TIMING_COLORS = {
  dns: "#0070f3", // Blue
  connect: "#7928ca", // Purple
  ssl: "#ff0080", // Pink
  wait: "#f5a623", // Orange
  receive: "#50e3c2", // Teal
} as const;

export function getTimingColor(type: keyof typeof TIMING_COLORS): string {
  return TIMING_COLORS[type];
}

export function calculateTimings(entries: HarEntry[]): WaterfallTiming[] {
  if (entries.length === 0) return [];

  // Find the earliest start time
  const earliestStartTime = Math.min(
    ...entries.map((entry) => new Date(entry.startedDateTime).getTime())
  );

  return entries.map((entry) => {
    const startTime =
      new Date(entry.startedDateTime).getTime() - earliestStartTime;

    // Extract detailed timings (if available)
    const timings = entry.timings || {};
    const dns = Math.max(0, timings.dns || 0);
    const connect = Math.max(0, timings.connect || 0);
    const ssl = Math.max(0, timings.ssl || 0);
    const wait = Math.max(0, timings.wait || 0);
    const receive = Math.max(0, timings.receive || 0);

    // If detailed timings are not available, use total time
    const totalTime = entry.time || dns + connect + ssl + wait + receive;

    return {
      startTime,
      dns,
      connect,
      ssl,
      wait,
      receive,
      totalTime,
    };
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getRequestTypeColor(mimeType: string): string {
  if (mimeType.includes("javascript")) return "#f7df1e";
  if (mimeType.includes("css")) return "#1572b6";
  if (mimeType.includes("html")) return "#e34c26";
  if (mimeType.includes("image")) return "#00d4ff";
  if (mimeType.includes("json") || mimeType.includes("xml")) return "#00ff88";
  if (mimeType.includes("font")) return "#ff6b6b";
  return "#888888";
}
