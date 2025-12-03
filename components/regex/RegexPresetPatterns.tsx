import { PRESET_PATTERNS } from "@/components/utils/regex-tester.utils";
import { cn } from "@/lib/utils";

interface RegexPresetPatternsProps {
  onSelect: (pattern: string, testString: string) => void;
  selectedPattern: string;
}

export default function RegexPresetPatterns({
  onSelect,
  selectedPattern,
}: RegexPresetPatternsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_PATTERNS.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onSelect(preset.pattern, preset.testString)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            selectedPattern === preset.pattern
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
