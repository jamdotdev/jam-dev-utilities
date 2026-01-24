import React from "react";
import { Platform, PLATFORM_INFO } from "@/components/utils/config-doctor.utils";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
}

const platforms: Platform[] = ["netlify", "vercel", "cloudflare"];

export default function PlatformSelector({
  selected,
  onSelect,
}: PlatformSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const info = PLATFORM_INFO[platform];
        const isSelected = selected === platform;

        return (
          <button
            key={platform}
            onClick={() => onSelect(platform)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {info.name}
          </button>
        );
      })}
    </div>
  );
}
