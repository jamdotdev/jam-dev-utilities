import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { explainPattern } from "@/components/utils/regex-tester.utils";
import { cn } from "@/lib/utils";

interface RegexPatternExplainerProps {
  pattern: string;
}

const getComponentColor = (type: string): string => {
  switch (type) {
    case "escape":
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
    case "characterClass":
      return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300";
    case "groupStart":
    case "groupEnd":
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
    case "quantifier":
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
    case "special":
      return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
    default:
      return "bg-muted text-foreground";
  }
};

export default function RegexPatternExplainer({
  pattern,
}: RegexPatternExplainerProps) {
  const components = useMemo(() => {
    if (!pattern) return [];
    try {
      return explainPattern(pattern);
    } catch {
      return [];
    }
  }, [pattern]);

  if (components.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Enter a pattern to see explanation
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-0.5 font-mono text-sm p-3 bg-muted rounded-lg">
          {components.map((component, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "px-1 py-0.5 rounded cursor-help transition-all hover:ring-2 hover:ring-ring",
                    getComponentColor(component.type)
                  )}
                >
                  {component.value}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold capitalize">{component.type}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {component.explanation}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Legend:
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={cn("px-2 py-0.5 rounded", getComponentColor("escape"))}
            >
              Escape
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded",
                getComponentColor("characterClass")
              )}
            >
              Character Class
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded",
                getComponentColor("groupStart")
              )}
            >
              Group
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded",
                getComponentColor("quantifier")
              )}
            >
              Quantifier
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded",
                getComponentColor("special")
              )}
            >
              Special
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded",
                getComponentColor("literal")
              )}
            >
              Literal
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
