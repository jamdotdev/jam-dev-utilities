import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ds/PopoverComponent";
import { SketchPicker } from "react-color";
import { cn } from "@/lib/utils";

const HEX_COLOR_WITH_HASH_PATTERN: RegExp = /^#[0-9A-F]{6}$/i;

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

    const displayValue = value && HEX_COLOR_WITH_HASH_PATTERN.test(value) ? value : DEFAULT_COLOR;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-12 h-12 border-2 rounded-md block flex-none cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            style={{
              backgroundColor: displayValue,
            }}
            aria-label="Pick a color"
          />
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

