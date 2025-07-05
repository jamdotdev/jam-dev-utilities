import React from "react";
import { Button } from "../ds/ButtonComponent";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface WaterfallControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const WaterfallControls: React.FC<WaterfallControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Zoom controls */}
        <div className="inline-flex items-center bg-background border border-border rounded-full shadow-sm p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.5}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div className="px-3 py-1 min-w-[80px] text-center">
            <span className="text-sm font-medium tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomIn}
            disabled={zoomLevel >= 5}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Reset button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onZoomReset}
          className="h-9 px-3 gap-2 font-medium"
          aria-label="Reset view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <span>Press</span>
        <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
          {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
        </kbd>
        <span>+</span>
        <kbd className="px-1.5 py-1 text-xs font-mono bg-muted border border-border rounded">
          +
        </kbd>
        <span>or</span>
        <kbd className="px-1.5 py-1 text-xs font-mono bg-muted border border-border rounded">
          −
        </kbd>
        <span>to zoom</span>
      </div>
    </div>
  );
};
