import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RegexFlags,
  FLAG_DESCRIPTIONS,
} from "@/components/utils/regex-tester.utils";

interface RegexFlagToggleProps {
  flags: RegexFlags;
  onFlagChange: (flag: keyof RegexFlags) => void;
}

export default function RegexFlagToggle({
  flags,
  onFlagChange,
}: RegexFlagToggleProps) {
  const flagKeys = Object.keys(flags) as (keyof RegexFlags)[];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-2">
        {flagKeys.map((flag) => (
          <Tooltip key={flag}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onFlagChange(flag)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-all",
                  "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  flags[flag]
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {flag}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold">{FLAG_DESCRIPTIONS[flag].name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {FLAG_DESCRIPTIONS[flag].description}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
