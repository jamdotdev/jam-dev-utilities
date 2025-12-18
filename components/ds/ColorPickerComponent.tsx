import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ds/PopoverComponent";
import { SketchPicker } from "react-color";
import { cn } from "@/lib/utils";
import {
  normalizeHexForDisplay,
  isValidHex,
} from "@/components/utils/wcag-color-contrast.utils";
import { X } from "lucide-react";

const DEFAULT_COLOR = "#000000" as const;

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, className, disabled = false }, ref) => {
    const [open, setOpen] = useState(false);

    const isValid = value ? isValidHex(value) : false;
    const displayValue = normalizeHexForDisplay(value) ?? DEFAULT_COLOR;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-12 h-12 border-2 rounded-md flex-none cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative flex items-center justify-center",
              className
            )}
            style={{
              backgroundColor: isValid ? displayValue : "transparent",
            }}
            aria-label="Pick a color"
          >
            {!isValid && value && (
              <X
                className="w-6 h-6 text-red-500 dark:text-red-400"
                strokeWidth={2.5}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" ref={ref}>
          <SketchPicker
            color={displayValue}
            onChange={(color) => onChange(color.hex.toUpperCase())}
            disableAlpha
            presetColors={[]}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

ColorPicker.displayName = "ColorPicker";
