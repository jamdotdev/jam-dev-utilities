"use client";
import { FollowingTooltipComponent } from "./FollowingTooltipComponent";

interface CropOverlayProps {
  isCropping: boolean;
  cropRect: { x: number; y: number; width: number; height: number } | null;
  mousePosition: { x: number; y: number };
}

const CropOverlayComponent: React.FC<CropOverlayProps> = ({
  isCropping,
  cropRect,
  mousePosition,
}) => {
  if (!isCropping || !cropRect) return null;

  const left = Math.min(cropRect.x, cropRect.x + cropRect.width);
  const top = Math.min(cropRect.y, cropRect.y + cropRect.height);
  const width = Math.abs(cropRect.width);
  const height = Math.abs(cropRect.height);

  return (
    <>
      <div
        className="absolute border-2 border-dashed border-black bg-white bg-opacity-30 pointer-events-none"
        style={{ left, top, width, height }}
      ></div>
      <FollowingTooltipComponent
        message="Double-click inside the overlay to accept"
        position={mousePosition}
      />
    </>
  );
};

export { CropOverlayComponent };
