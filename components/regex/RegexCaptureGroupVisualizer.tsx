import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getDetailedMatches,
  RegexMatch,
} from "@/components/utils/regex-tester.utils";
import { cn } from "@/lib/utils";

interface RegexCaptureGroupVisualizerProps {
  pattern: string;
  testString: string;
}

const GROUP_COLORS = [
  "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
  "border-green-400 bg-green-50 dark:bg-green-950/30",
  "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
  "border-orange-400 bg-orange-50 dark:bg-orange-950/30",
  "border-pink-400 bg-pink-50 dark:bg-pink-950/30",
  "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30",
];

export default function RegexCaptureGroupVisualizer({
  pattern,
  testString,
}: RegexCaptureGroupVisualizerProps) {
  const matches: RegexMatch[] = useMemo(() => {
    if (!pattern || !testString) return [];
    try {
      return getDetailedMatches(pattern, testString);
    } catch {
      return [];
    }
  }, [pattern, testString]);

  if (matches.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No capture groups found. Add groups with parentheses () to see them
        here.
      </div>
    );
  }

  const hasGroups = matches.some(
    (m) => m.captureGroups.length > 0 || Object.keys(m.groups).length > 0
  );

  if (!hasGroups) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No capture groups in pattern. Use parentheses () to create capture
        groups.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-4">
        {matches.map((match, matchIndex) => (
          <div key={matchIndex} className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Match {matchIndex + 1} at position {match.index}
            </div>
            <div
              className={cn(
                "p-3 rounded-lg border-2 border-dashed",
                "border-foreground/30 bg-muted/30"
              )}
            >
              <div className="text-xs text-muted-foreground mb-2">
                Full Match
              </div>
              <div className="font-mono text-sm bg-background px-2 py-1 rounded border">
                {match.fullMatch || (
                  <span className="text-muted-foreground italic">empty</span>
                )}
              </div>

              {match.captureGroups.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Capture Groups (CSS Box Model)
                  </div>
                  <div className="relative">
                    {match.captureGroups.map((group, groupIndex) => (
                      <Tooltip key={groupIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "p-2 rounded border-2 transition-all cursor-help",
                              "hover:shadow-md hover:ring-2 hover:ring-ring",
                              GROUP_COLORS[groupIndex % GROUP_COLORS.length]
                            )}
                            style={{
                              marginLeft: `${groupIndex * 8}px`,
                              marginTop: groupIndex > 0 ? "8px" : "0",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-background/80">
                                Group {groupIndex + 1}
                              </span>
                              <span className="font-mono text-sm truncate">
                                {group ?? (
                                  <span className="text-muted-foreground italic">
                                    undefined
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold">
                            Capture Group {groupIndex + 1}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Captured value: {group ?? "undefined"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Access via: match[{groupIndex + 1}] or $
                            {groupIndex + 1}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(match.groups).length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Named Groups
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(match.groups).map(
                      ([name, value], index) => (
                        <Tooltip key={name}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "px-3 py-2 rounded border-2 transition-all cursor-help",
                                "hover:shadow-md hover:ring-2 hover:ring-ring",
                                GROUP_COLORS[index % GROUP_COLORS.length]
                              )}
                            >
                              <div className="text-xs font-medium mb-1">
                                {name}
                              </div>
                              <div className="font-mono text-sm">
                                {value ?? (
                                  <span className="text-muted-foreground italic">
                                    undefined
                                  </span>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-semibold">Named Group: {name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Captured value: {value ?? "undefined"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Access via: match.groups.{name}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
