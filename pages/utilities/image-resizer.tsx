import { useCallback, useState, ChangeEvent, useRef, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import {
  calculateCropDimensions,
  Format,
  handleResizeImage,
  isPointInCropRect,
  updateHeight,
  updateWidth,
} from "@/components/utils/resize-image.utils";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Input } from "@/components/ds/InputComponent";
import { ImageUploadComponent } from "@/components/ds/ImageUploadComponent";
import { cn } from "@/lib/utils";
import { Crop, DownloadIcon } from "lucide-react";
import GitHubContribution from "@/components/GitHubContribution";
import { CropOverlayComponent } from "@/components/ds/CropOverlayComponent";
import { DividerComponent } from "../../components/ds/DividerComponent";

const MAX_DIMENSION = 1024 * 4;
const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MIN_CROP_SIZE = 24;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface FormatOption {
  value: Format;
  label: string;
}
const formatOptions: FormatOption[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPEG" },
];

interface ResizedImageInfo {
  width?: number;
  height?: number;
  format?: Format;
  quality?: number;
}

interface CropPoint {
  x: number;
  y: number;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type CropHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface CropInteractionState {
  mode: "move" | "resize";
  startPoint: CropPoint;
  startRect: CropRect;
  imageLeft: number;
  imageTop: number;
  imageWidth: number;
  imageHeight: number;
  handle?: CropHandle;
}

const getImageRect = (imageElement: HTMLImageElement | null) => {
  if (!imageElement) {
    return null;
  }

  const rect = imageElement.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  return rect;
};

const getPointerPositionInRect = (
  clientX: number,
  clientY: number,
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  }
): CropPoint => ({
  x: clamp(clientX - rect.left, 0, rect.width),
  y: clamp(clientY - rect.top, 0, rect.height),
});

const areCropRectsEqual = (left: CropRect, right: CropRect) =>
  left.x === right.x &&
  left.y === right.y &&
  left.width === right.width &&
  left.height === right.height;

export default function ImageResize() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [format, setFormat] = useState<Format>("png");
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const [quality, setQuality] = useState<number>(1);
  const [showAnimation, setShowAnimation] = useState(false);
  const [resizedImageInfo, setResizedImageInfo] = useState<ResizedImageInfo>(
    {}
  );

  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [isOriginalOutput, setIsOriginalOutput] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const outputObjectUrlRef = useRef<string | null>(null);
  const cropInteractionRef = useRef<CropInteractionState | null>(null);
  const cropFrameRef = useRef<number | null>(null);
  const pendingCropRectRef = useRef<CropRect | null>(null);

  const clearScheduledCropUpdate = useCallback(() => {
    if (cropFrameRef.current !== null) {
      window.cancelAnimationFrame(cropFrameRef.current);
      cropFrameRef.current = null;
    }
    pendingCropRectRef.current = null;
  }, []);

  const clearCropInteraction = useCallback(() => {
    cropInteractionRef.current = null;
  }, []);

  const releaseOutputObjectUrl = useCallback(() => {
    if (outputObjectUrlRef.current) {
      URL.revokeObjectURL(outputObjectUrlRef.current);
      outputObjectUrlRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      clearScheduledCropUpdate();
      releaseOutputObjectUrl();
    },
    [clearScheduledCropUpdate, releaseOutputObjectUrl]
  );

  const setOutputAndShowAnimation = useCallback((output: string) => {
    setOutput(output);
    setShowAnimation(true);
    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = window.setTimeout(() => {
      setShowAnimation(false);
    }, 500);
  }, []);

  const resetCropStates = useCallback(() => {
    setIsCropping(false);
    setCropRect(null);
    clearScheduledCropUpdate();
    clearCropInteraction();
  }, [clearCropInteraction, clearScheduledCropUpdate]);

  const updateResizedImageInfo = useCallback(
    (width: number, height: number, format: Format, quality: number) => {
      setResizedImageInfo({
        width: Math.round(width),
        height: Math.round(height),
        format,
        quality,
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      releaseOutputObjectUrl();
      resetCropStates();
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      outputObjectUrlRef.current = objectUrl;
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;
        setWidth(originalWidth);
        setHeight(originalHeight);
        setResizedImageInfo({
          width: originalWidth,
          height: originalHeight,
          format: undefined,
        });
        setIsOriginalOutput(true);
        setOutputAndShowAnimation(objectUrl);
      };
      img.onerror = () => {
        releaseOutputObjectUrl();
        setImageFile(null);
        setOutput("");
      };
      img.src = objectUrl;
    },
    [releaseOutputObjectUrl, resetCropStates, setOutputAndShowAnimation]
  );

  const handleAspectRatioChange = useCallback(() => {
    setPreserveAspectRatio((prev) => {
      const newValue = !prev;
      if (newValue && output && width) {
        updateHeight({ source: output, setHeight, width });
      }
      return newValue;
    });
  }, [output, width]);

  const handleWidthChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === "") {
        setWidth(undefined);
        return;
      }

      const parsedValue = Number(e.target.value);

      if (Number.isNaN(parsedValue)) {
        setWidth(undefined);
        return;
      }

      const newWidth = clamp(Math.round(parsedValue), 1, MAX_DIMENSION);
      setWidth(newWidth);

      if (preserveAspectRatio && output) {
        updateHeight({ source: output, setHeight, width: newWidth });
      }
    },
    [preserveAspectRatio, output]
  );

  const handleHeightChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value === "") {
        setHeight(undefined);
        return;
      }

      const parsedValue = Number(e.target.value);

      if (Number.isNaN(parsedValue)) {
        setHeight(undefined);
        return;
      }

      const newHeight = clamp(Math.round(parsedValue), 1, MAX_DIMENSION);
      setHeight(newHeight);

      if (preserveAspectRatio && output) {
        updateWidth({ source: output, height: newHeight, setWidth });
      }
    },
    [preserveAspectRatio, output]
  );

  const commitTransformedOutput = useCallback(
    (nextOutput: string) => {
      if (outputObjectUrlRef.current) {
        releaseOutputObjectUrl();
      }
      setIsOriginalOutput(false);
      setOutputAndShowAnimation(nextOutput);
    },
    [releaseOutputObjectUrl, setOutputAndShowAnimation]
  );

  const handleResize = useCallback(() => {
    if (output) {
      handleResizeImage({
        source: output,
        format,
        height,
        preserveAspectRatio,
        quality,
        width,
        setOutput: (output) => {
          commitTransformedOutput(output);
          setResizedImageInfo({ width, height, format, quality });
        },
      });
    }
  }, [
    commitTransformedOutput,
    output,
    width,
    height,
    format,
    quality,
    preserveAspectRatio,
  ]);

  const resizedLabel = (() => {
    const { height, width, format, quality } = resizedImageInfo;

    if (width && height && format) {
      const qualityLabel = format === "jpeg" ? `(Quality: ${quality})` : "";
      return `${format.toUpperCase()} - ${width} x ${height} ${qualityLabel}`;
    }
    return "Click 'Resize' to see the dimensions";
  })();

  const handleQualityInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsedValue = Number(e.target.value);
      if (Number.isNaN(parsedValue)) {
        return;
      }
      const value = clamp(parsedValue, 0.1, 1);
      setQuality(value);

      if (format === "jpeg" && output) {
        handleResizeImage({
          source: output,
          format,
          height,
          preserveAspectRatio,
          quality: value,
          width,
          setOutput: (output) => {
            commitTransformedOutput(output);
            setResizedImageInfo({ width, height, format, quality: value });
          },
        });
      }
    },
    [
      format,
      output,
      height,
      preserveAspectRatio,
      width,
      commitTransformedOutput,
    ]
  );

  const createInitialCropRect = useCallback(
    (imageWidth: number, imageHeight: number): CropRect => {
      const horizontalInset = Math.max(12, imageWidth * 0.08);
      const verticalInset = Math.max(12, imageHeight * 0.08);

      const minWidth = Math.min(MIN_CROP_SIZE, imageWidth);
      const minHeight = Math.min(MIN_CROP_SIZE, imageHeight);

      const cropWidth = clamp(
        imageWidth - horizontalInset * 2,
        minWidth,
        imageWidth
      );
      const cropHeight = clamp(
        imageHeight - verticalInset * 2,
        minHeight,
        imageHeight
      );

      return {
        x: (imageWidth - cropWidth) / 2,
        y: (imageHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      };
    },
    []
  );

  const handleCropModeToggle = useCallback(() => {
    if (isCropping) {
      clearCropInteraction();
      resetCropStates();
    } else {
      if (!imageRef.current) {
        return;
      }

      const imageRect = imageRef.current.getBoundingClientRect();
      if (!imageRect.width || !imageRect.height) {
        return;
      }

      setIsCropping(true);
      setCropRect(createInitialCropRect(imageRect.width, imageRect.height));
      clearCropInteraction();
    }
  }, [
    clearCropInteraction,
    createInitialCropRect,
    isCropping,
    resetCropStates,
  ]);

  const getCropHandleFromTarget = useCallback(
    (target: EventTarget | null): CropHandle | null => {
      if (!(target instanceof HTMLElement)) {
        return null;
      }

      const handleElement = target.closest("[data-crop-handle]");
      if (!handleElement) {
        return null;
      }

      const handle = handleElement.getAttribute("data-crop-handle");
      if (
        handle === "n" ||
        handle === "s" ||
        handle === "e" ||
        handle === "w" ||
        handle === "ne" ||
        handle === "nw" ||
        handle === "se" ||
        handle === "sw"
      ) {
        return handle;
      }

      return null;
    },
    []
  );

  const queueCropRectUpdate = useCallback((nextRect: CropRect) => {
    pendingCropRectRef.current = nextRect;
    if (cropFrameRef.current !== null) {
      return;
    }

    cropFrameRef.current = window.requestAnimationFrame(() => {
      cropFrameRef.current = null;
      const pendingRect = pendingCropRectRef.current;
      pendingCropRectRef.current = null;
      if (!pendingRect) {
        return;
      }

      setCropRect((currentRect) => {
        if (!currentRect || !areCropRectsEqual(currentRect, pendingRect)) {
          return pendingRect;
        }
        return currentRect;
      });
    });
  }, []);

  const flushPendingCropRect = useCallback(() => {
    if (cropFrameRef.current !== null) {
      window.cancelAnimationFrame(cropFrameRef.current);
      cropFrameRef.current = null;
    }

    const pendingRect = pendingCropRectRef.current;
    pendingCropRectRef.current = null;
    if (!pendingRect) {
      return;
    }

    setCropRect((currentRect) => {
      if (!currentRect || !areCropRectsEqual(currentRect, pendingRect)) {
        return pendingRect;
      }
      return currentRect;
    });
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isCropping || !cropRect) {
        return;
      }

      const imageRect = getImageRect(imageRef.current);
      if (!imageRect) {
        return;
      }

      const position = getPointerPositionInRect(
        e.clientX,
        e.clientY,
        imageRect
      );

      e.preventDefault();
      const handle = getCropHandleFromTarget(e.target);

      if (handle) {
        e.currentTarget.setPointerCapture(e.pointerId);
        cropInteractionRef.current = {
          mode: "resize",
          handle,
          startPoint: position,
          startRect: cropRect,
          imageLeft: imageRect.left,
          imageTop: imageRect.top,
          imageWidth: imageRect.width,
          imageHeight: imageRect.height,
        };
        return;
      }

      if (isPointInCropRect(position.x, position.y, cropRect)) {
        e.currentTarget.setPointerCapture(e.pointerId);
        cropInteractionRef.current = {
          mode: "move",
          startPoint: position,
          startRect: cropRect,
          imageLeft: imageRect.left,
          imageTop: imageRect.top,
          imageWidth: imageRect.width,
          imageHeight: imageRect.height,
        };
      }
    },
    [cropRect, getCropHandleFromTarget, isCropping]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isCropping) {
        return;
      }

      const interaction = cropInteractionRef.current;
      if (!interaction) {
        return;
      }

      const position = getPointerPositionInRect(e.clientX, e.clientY, {
        left: interaction.imageLeft,
        top: interaction.imageTop,
        width: interaction.imageWidth,
        height: interaction.imageHeight,
      });

      const imageWidth = interaction.imageWidth;
      const imageHeight = interaction.imageHeight;
      const minCropWidth = Math.min(MIN_CROP_SIZE, imageWidth);
      const minCropHeight = Math.min(MIN_CROP_SIZE, imageHeight);
      const dx = position.x - interaction.startPoint.x;
      const dy = position.y - interaction.startPoint.y;

      if (interaction.mode === "move") {
        const maxX = Math.max(0, imageWidth - interaction.startRect.width);
        const maxY = Math.max(0, imageHeight - interaction.startRect.height);
        queueCropRectUpdate({
          ...interaction.startRect,
          x: clamp(interaction.startRect.x + dx, 0, maxX),
          y: clamp(interaction.startRect.y + dy, 0, maxY),
        });
        return;
      }

      const { handle, startRect } = interaction;
      if (!handle) {
        return;
      }

      let left = startRect.x;
      let right = startRect.x + startRect.width;
      let top = startRect.y;
      let bottom = startRect.y + startRect.height;

      if (handle.includes("w")) {
        left = clamp(left + dx, 0, right - minCropWidth);
      }
      if (handle.includes("e")) {
        right = clamp(right + dx, left + minCropWidth, imageWidth);
      }
      if (handle.includes("n")) {
        top = clamp(top + dy, 0, bottom - minCropHeight);
      }
      if (handle.includes("s")) {
        bottom = clamp(bottom + dy, top + minCropHeight, imageHeight);
      }

      queueCropRectUpdate({
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      });
    },
    [isCropping, queueCropRectUpdate]
  );

  const stopPointerInteraction = useCallback(() => {
    flushPendingCropRect();
    clearCropInteraction();
  }, [clearCropInteraction, flushPendingCropRect]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      stopPointerInteraction();
    },
    [stopPointerInteraction]
  );

  const handlePointerCancel = useCallback(() => {
    stopPointerInteraction();
  }, [stopPointerInteraction]);

  const applyCroppedOutput = useCallback(
    (croppedDataUrl: string, cropWidth: number, cropHeight: number) => {
      const normalizedWidth = Math.max(1, Math.round(cropWidth));
      const normalizedHeight = Math.max(1, Math.round(cropHeight));
      setWidth(normalizedWidth);
      setHeight(normalizedHeight);
      commitTransformedOutput(croppedDataUrl);
      updateResizedImageInfo(
        normalizedWidth,
        normalizedHeight,
        format,
        quality
      );
      resetCropStates();
    },
    [
      format,
      quality,
      resetCropStates,
      commitTransformedOutput,
      updateResizedImageInfo,
    ]
  );

  const cropSvgImage = useCallback(
    (
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const sourceWidth = img.naturalWidth || img.width;
      const sourceHeight = img.naturalHeight || img.height;
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <image href="${img.src}" x="-${x}" y="-${y}" width="${sourceWidth}" height="${sourceHeight}" />
      </svg>`;
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const reader = new FileReader();
      reader.onload = () => {
        const croppedDataUrl = reader.result as string;
        applyCroppedOutput(croppedDataUrl, width, height);
      };
      reader.readAsDataURL(svgBlob);
    },
    [applyCroppedOutput]
  );

  const cropCanvasImage = useCallback(
    (
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const normalizedWidth = Math.max(1, Math.round(width));
      const normalizedHeight = Math.max(1, Math.round(height));
      const canvas = document.createElement("canvas");
      canvas.width = normalizedWidth;
      canvas.height = normalizedHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          img,
          Math.round(x),
          Math.round(y),
          normalizedWidth,
          normalizedHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const croppedDataUrl = canvas.toDataURL(`image/${format}`, quality);
        applyCroppedOutput(croppedDataUrl, canvas.width, canvas.height);
      }
    },
    [applyCroppedOutput, format, quality]
  );

  const handleApplyCrop = useCallback(() => {
    if (!isCropping || !imageRef.current) {
      return;
    }

    const activeCropRect = pendingCropRectRef.current ?? cropRect;
    if (!activeCropRect) {
      return;
    }

    const currentImageRef = imageRef.current;
    const { x, y, width, height } = calculateCropDimensions(
      currentImageRef,
      currentImageRef,
      activeCropRect
    );

    if (width < 1 || height < 1) {
      return;
    }

    if (format === "svg") {
      cropSvgImage(currentImageRef, x, y, width, height);
    } else {
      cropCanvasImage(currentImageRef, x, y, width, height);
    }
  }, [cropCanvasImage, cropRect, cropSvgImage, format, isCropping]);

  const handleFormatChange = useCallback(
    (value: string) => {
      setFormat(value as Format);
      if (output) {
        handleResizeImage({
          source: output,
          format: value as Format,
          height,
          preserveAspectRatio,
          quality,
          width,
          setOutput: (newOutput) => {
            commitTransformedOutput(newOutput);
            setResizedImageInfo({
              width,
              height,
              format: value as Format,
              quality,
            });
          },
        });
      }
    },
    [
      output,
      height,
      preserveAspectRatio,
      quality,
      width,
      commitTransformedOutput,
    ]
  );

  const cropSelectionLabel = (() => {
    if (!cropRect) {
      return "";
    }

    return `x:${Math.round(cropRect.x)} y:${Math.round(cropRect.y)}  ${Math.round(
      cropRect.width
    )}x${Math.round(cropRect.height)}`;
  })();

  const downloadExtension = (() => {
    if (!isOriginalOutput || !imageFile) {
      return format;
    }

    const fileNamePart = imageFile.name.split(".").pop()?.toLowerCase();
    return fileNamePart || format;
  })();

  return (
    <main>
      <Meta
        title="Image Resizer | Free, Open Source & Ad-free"
        description="Resize images online with Jam's free and open source Image Resizer. Adjust dimensions, maintain aspect ratio, and choose between PNG and JPEG formats."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Image Resizer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <ImageUploadComponent
              maxFileSize={MAX_FILE_SIZE}
              onFileSelect={handleFileSelect}
            />

            <div className="flex justify-between items-center mb-2 pt-6">
              <div className="flex-1 mr-2">
                <Label className="mb-2">Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Enter width"
                  onChange={handleWidthChange}
                  value={width ?? ""}
                  className="mb-2"
                  disabled={!imageFile || isCropping}
                />
              </div>
              <div className="flex-1 ml-2">
                <Label className="mb-2">Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Enter height"
                  onChange={handleHeightChange}
                  value={height ?? ""}
                  className="mb-2"
                  disabled={!imageFile || isCropping}
                />
              </div>
            </div>

            <div className="flex items-center mb-6 gap-2">
              <Checkbox
                id="preserve-aspect-ratio"
                checked={preserveAspectRatio}
                onCheckedChange={handleAspectRatioChange}
                disabled={!imageFile || isCropping}
                className="mr-1"
              />
              <Label
                htmlFor="preserve-aspect-ratio"
                className="mb-0 hover:cursor-pointer"
              >
                Preserve Aspect Ratio
              </Label>
            </div>

            <DividerComponent margin="medium" />

            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label className={format !== "jpeg" ? "mb-2" : undefined}>
                  Format
                </Label>
                <Combobox
                  data={formatOptions}
                  value={format}
                  onSelect={handleFormatChange}
                  disabled={!imageFile || isCropping}
                />
              </div>

              {format === "jpeg" && (
                <div className="flex flex-1 flex-col">
                  <Label>Quality (0.1 to 1.0)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={quality}
                    onChange={handleQualityInput}
                    disabled={!imageFile}
                    className="h-[32px] rounded-md"
                  />
                </div>
              )}
            </div>

            <DividerComponent margin="medium" />

            <div
              className={cn(imageFile && "mb-4", "flex w-full flex-wrap gap-3")}
            >
              <Button
                className="flex flex-1 min-w-[140px]"
                onClick={handleResize}
                disabled={!imageFile || isCropping}
              >
                Resize
              </Button>

              {!isCropping && (
                <Button
                  className="flex flex-1 min-w-[140px]"
                  onClick={handleCropModeToggle}
                  disabled={!output}
                  variant="outline"
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Crop Mode
                </Button>
              )}

              {isCropping && (
                <>
                  <Button
                    className="flex flex-1 min-w-[140px]"
                    onClick={handleCropModeToggle}
                    variant="outline"
                  >
                    Exit Crop Mode
                  </Button>
                </>
              )}

              <Button
                disabled={!imageFile}
                variant="outline"
                className="flex flex-1 min-w-[140px]"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                <a
                  className={cn(!imageFile && "pointer-events-none")}
                  href={output}
                  download={`resized-image.${downloadExtension}`}
                >
                  Download Image
                </a>
              </Button>
            </div>
            {isCropping && (
              <p className="mb-4 text-sm text-muted-foreground">
                Crop mode is active. Drag inside the box to move it, use handles
                to resize, then click Done in the crop box.
                {cropSelectionLabel ? ` Current: ${cropSelectionLabel}` : ""}
              </p>
            )}

            {output && (
              <>
                <DividerComponent margin="medium" />
                <div>
                  <div className="flex flex-1 justify-between">
                    <Label>Resized Image</Label>
                    <Label>{resizedLabel}</Label>
                  </div>
                  <div className="relative flex flex-col flex-1 items-center ring-1 ring-border rounded-lg p-1">
                    <div
                      className="relative inline-block rounded-sm"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      style={isCropping ? { touchAction: "none" } : undefined}
                    >
                      <img
                        src={output}
                        alt="Resized output"
                        ref={imageRef}
                        draggable={false}
                        className={`block w-auto h-auto max-h-[640px] rounded-sm select-none ${
                          showAnimation ? "animate-grow-from-center" : ""
                        }`}
                      />
                      {isCropping && cropRect && (
                        <CropOverlayComponent
                          cropRect={cropRect}
                          onDone={handleApplyCrop}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>

      <GitHubContribution username="EduardoDePatta" />
      <CallToActionGrid />
    </main>
  );
}
