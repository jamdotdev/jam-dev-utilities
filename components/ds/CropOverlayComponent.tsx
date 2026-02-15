"use client";
interface CropOverlayProps {
  cropRect: { x: number; y: number; width: number; height: number } | null;
  onDone?: () => void;
}

const CropOverlayComponent: React.FC<CropOverlayProps> = ({
  cropRect,
  onDone,
}) => {
  if (!cropRect) return null;

  const left = Math.min(cropRect.x, cropRect.x + cropRect.width);
  const top = Math.min(cropRect.y, cropRect.y + cropRect.height);
  const width = Math.abs(cropRect.width);
  const height = Math.abs(cropRect.height);
  const handleBaseClass =
    "absolute h-3.5 w-3.5 rounded-full border border-white bg-primary shadow pointer-events-auto";

  return (
    <div
      className="absolute border-2 border-white/90 pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
      }}
    >
      <div className="absolute left-1/3 top-0 h-full w-px bg-white/70" />
      <div className="absolute left-2/3 top-0 h-full w-px bg-white/70" />
      <div className="absolute top-1/3 left-0 h-px w-full bg-white/70" />
      <div className="absolute top-2/3 left-0 h-px w-full bg-white/70" />

      <div
        data-crop-area="true"
        className="absolute inset-0 pointer-events-auto cursor-move bg-transparent"
      />

      {onDone && (
        <button
          type="button"
          data-crop-action="done"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
          className="absolute right-2 top-2 pointer-events-auto rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Done
        </button>
      )}

      <div
        data-crop-handle="nw"
        className={`${handleBaseClass} -left-2 -top-2 cursor-nwse-resize`}
      />
      <div
        data-crop-handle="n"
        className={`${handleBaseClass} left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize`}
      />
      <div
        data-crop-handle="ne"
        className={`${handleBaseClass} -right-2 -top-2 cursor-nesw-resize`}
      />
      <div
        data-crop-handle="e"
        className={`${handleBaseClass} -right-2 top-1/2 -translate-y-1/2 cursor-ew-resize`}
      />
      <div
        data-crop-handle="se"
        className={`${handleBaseClass} -right-2 -bottom-2 cursor-nwse-resize`}
      />
      <div
        data-crop-handle="s"
        className={`${handleBaseClass} left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize`}
      />
      <div
        data-crop-handle="sw"
        className={`${handleBaseClass} -left-2 -bottom-2 cursor-nesw-resize`}
      />
      <div
        data-crop-handle="w"
        className={`${handleBaseClass} -left-2 top-1/2 -translate-y-1/2 cursor-ew-resize`}
      />
    </div>
  );
};

export { CropOverlayComponent };
