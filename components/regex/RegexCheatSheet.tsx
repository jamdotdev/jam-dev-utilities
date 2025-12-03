import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CHEAT_SHEET } from "@/components/utils/regex-tester.utils";
import { cn } from "@/lib/utils";

interface RegexCheatSheetProps {
  onInsert?: (syntax: string) => void;
}

export default function RegexCheatSheet({ onInsert }: RegexCheatSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Character Classes"]));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-accent transition-colors"
      >
        <span className="font-medium text-sm">Regex Cheat Sheet</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-background">
          {Object.entries(CHEAT_SHEET).map(([category, items]) => (
            <div key={category} className="border border-border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(category)}
                className="w-full px-3 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <span className="text-sm font-medium">{category}</span>
                {expandedSections.has(category) ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>

              {expandedSections.has(category) && (
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {items.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onInsert?.(item.syntax)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                        "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                        onInsert ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono min-w-[60px]">
                        {item.syntax}
                      </code>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {onInsert && (
            <p className="text-xs text-muted-foreground text-center">
              Click any syntax to insert it into your pattern
            </p>
          )}
        </div>
      )}
    </div>
  );
}
