import { useCallback, useState, useMemo, ChangeEvent, useRef } from "react";
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
  processImageFile,
  updateHeight,
  updateWidth,
} from "@/components/utils/resize-image.utils";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import { Input } from "@/components/ds/InputComponent";
import { ImageUploadComponent } from "@/components/ds/ImageUploadComponent";
import { cn } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";
import GitHubContribution from "@/components/GitHubContribution";
import { CropOverlayComponent } from "@/components/ds/CropOverlayComponent";
import { DividerComponent } from "../../components/ds/DividerComponent";

const MAX_DIMENSION = 1024 * 4;
const MAX_FILE_SIZE = 40 * 1024 * 1024;
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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [cropRect, setCropRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMovingCropRect, setIsMovingCropRect] = useState(false);
  const [moveStartPoint, setMoveStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const setOutputAndShowAnimation = useCallback((output: string) => {
    setOutput(output);
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 500);
  }, []);

  const resetCropStates = useCallback(() => {
    setIsCropping(false);
    setCropStart(null);
    setCropRect(null);
    setIsDragging(false);
    setIsMovingCropRect(false);
    setMoveStartPoint(null);
  }, []);

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
      setImageFile(file);
      processImageFile({
        source: file,
        format,
        preserveAspectRatio,
        quality,
        setHeight,
        setOutput: (output) => {
          setResizedImageInfo({
            width: undefined,
            height: undefined,
            format: undefined,
          });
          setOutputAndShowAnimation(output);
        },
        setWidth,
      });
    },
    [format, preserveAspectRatio, quality, setOutputAndShowAnimation]
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
      let newWidth = parseInt(e.target.value);
      if (newWidth > MAX_DIMENSION) {
        newWidth = MAX_DIMENSION;
      }
      setWidth(newWidth);

      if (preserveAspectRatio && output) {
        updateHeight({ source: output, setHeight, width: newWidth });
      }
    },
    [preserveAspectRatio, output]
  );

  const handleHeightChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let newHeight = parseInt(e.target.value);
      if (newHeight > MAX_DIMENSION) {
        newHeight = MAX_DIMENSION;
      }
      setHeight(newHeight);

      if (preserveAspectRatio && output) {
        updateWidth({ source: output, height: newHeight, setWidth });
      }
    },
    [preserveAspectRatio, output]
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
          setOutputAndShowAnimation(output);
          setResizedImageInfo({ width, height, format, quality });
        },
      });
    }
  }, [
    output,
    width,
    height,
    format,
    quality,
    preserveAspectRatio,
    setOutputAndShowAnimation,
  ]);

  const resizedLabel = useMemo(() => {
    const { height, width, format, quality } = resizedImageInfo;

    if (width && height && format) {
      const qualityLabel = format === "jpeg" ? `(Quality: ${quality})` : "";
      return `${format.toUpperCase()} - ${width} x ${height} ${qualityLabel}`;
    }
    return "Click 'Resize' to see the dimensions";
  }, [resizedImageInfo]);

  const handleQualityInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let value = parseFloat(e.target.value);
      if (value > 1) {
        value = 1;
      }
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
            setOutputAndShowAnimation(output);
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
      setOutputAndShowAnimation,
    ]
  );

  const qualityInput = useMemo(() => {
    if (format === "jpeg") {
      return (
        <div className="flex flex-col flex-1">
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
      );
    }
    return null;
  }, [format, handleQualityInput, imageFile, quality]);

  const handleCropModeToggle = useCallback(() => {
    if (isCropping) {
      resetCropStates();
    } else {
      setIsCropping(true);
      setCropStart(null);
      setCropRect(null);
    }
  }, [isCropping, resetCropStates]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isCropping || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (cropRect && isPointInCropRect(x, y, cropRect)) {
        startMovingCropRect(x, y, cropRect);
      } else {
        startNewCrop(x, y);
      }
    },
    [isCropping, cropRect]
  );

  const startMovingCropRect = (
    x: number,
    y: number,
    cropRect: { x: number; y: number; width: number; height: number }
  ) => {
    setIsMovingCropRect(true);
    setMoveStartPoint({ x: x - cropRect.x, y: y - cropRect.y });
  };

  const startNewCrop = (x: number, y: number) => {
    setCropStart({ x, y });
    setIsDragging(true);
    setCropRect(null);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isCropping || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x: e.clientX, y: e.clientY });

      if (isDragging && cropStart) {
        updateCropRect(x, y, cropStart);
      } else if (isMovingCropRect && cropRect && moveStartPoint) {
        moveCropRect(x, y, rect, cropRect, moveStartPoint);
      }
    },
    [
      isCropping,
      isDragging,
      cropStart,
      isMovingCropRect,
      cropRect,
      moveStartPoint,
    ]
  );

  const updateCropRect = (
    x: number,
    y: number,
    cropStart: { x: number; y: number }
  ) => {
    const width = x - cropStart.x;
    const height = y - cropStart.y;
    setCropRect({
      x: cropStart.x,
      y: cropStart.y,
      width,
      height,
    });
  };

  const moveCropRect = (
    x: number,
    y: number,
    rect: DOMRect,
    cropRect: { x: number; y: number; width: number; height: number },
    moveStartPoint: { x: number; y: number }
  ) => {
    const newX = x - moveStartPoint.x;
    const newY = y - moveStartPoint.y;

    const boundedX = Math.max(
      0,
      Math.min(newX, rect.width - Math.abs(cropRect.width))
    );
    const boundedY = Math.max(
      0,
      Math.min(newY, rect.height - Math.abs(cropRect.height))
    );

    setCropRect({
      ...cropRect,
      x: boundedX,
      y: boundedY,
    });
  };

  const handleMouseUp = useCallback(() => {
    if (isCropping) {
      if (isDragging) {
        setIsDragging(false);
        setCropStart(null);
      }
      if (isMovingCropRect) {
        setIsMovingCropRect(false);
        setMoveStartPoint(null);
      }
    }
  }, [isCropping, isDragging, isMovingCropRect]);

  const cropSvgImage = useCallback(
    (
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <image href="${img.src}" x="-${x}" y="-${y}" width="${img.width}" height="${img.height}" />
      </svg>`;
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const reader = new FileReader();
      reader.onload = () => {
        const croppedDataUrl = reader.result as string;
        setOutput(croppedDataUrl);
        updateResizedImageInfo(width, height, format, quality);
        resetCropStates();
      };
      reader.readAsDataURL(svgBlob);
    },
    [format, quality, resetCropStates, updateResizedImageInfo]
  );

  const cropCanvasImage = useCallback(
    (
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          img,
          x,
          y,
          width,
          height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const croppedDataUrl = canvas.toDataURL(`image/${format}`, quality);
        setOutput(croppedDataUrl);
        updateResizedImageInfo(canvas.width, canvas.height, format, quality);
        resetCropStates();
      }
    },
    [format, quality, resetCropStates, updateResizedImageInfo]
  );

  const handleImageDoubleClick = useCallback(() => {
    if (cropRect && imageRef.current) {
      const currentImageRef = imageRef.current;
      const img = new Image();
      img.src = output;
      img.onload = () => {
        const { x, y, width, height } = calculateCropDimensions(
          img,
          currentImageRef,
          cropRect
        );

        if (format === "svg") {
          cropSvgImage(img, x, y, width, height);
        } else {
          cropCanvasImage(img, x, y, width, height);
        }
      };
    }
  }, [cropCanvasImage, cropRect, cropSvgImage, format, output]);

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
            setOutputAndShowAnimation(newOutput);
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
      setOutputAndShowAnimation,
    ]
  );

  const mainActionButton = useMemo(
    () => (
      <Button
        className="flex flex-1"
        onClick={handleResize}
        disabled={!imageFile || isCropping}
      >
        Resize
      </Button>
    ),
    [handleResize, imageFile, isCropping]
  );

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
                <Label className="mb-2">Format</Label>
                <Combobox
                  data={formatOptions}
                  value={format}
                  onSelect={handleFormatChange}
                  disabled={!imageFile || isCropping}
                />
              </div>

              <div className="flex flex-1 flex-col">{qualityInput}</div>
            </div>

            <DividerComponent margin="medium" />

            <div className={cn(imageFile && "mb-6", "flex w-full gap-4")}>
              {mainActionButton}

              <Button
                className="flex flex-1"
                onClick={handleCropModeToggle}
                disabled={!imageFile}
              >
                {isCropping ? "Cancel" : "Crop Image"}
              </Button>

              <Button
                disabled={!imageFile}
                variant="outline"
                className="flex flex-1"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                <a
                  className={cn(!imageFile && "pointer-events-none")}
                  href={output}
                  download={`resized-image.${format}`}
                >
                  Download Image
                </a>
              </Button>
            </div>

            {output && (
              <>
                <DividerComponent margin="medium" />
                <div>
                  <div className="flex flex-1 justify-between">
                    <Label>Resized Image</Label>
                    <Label>{resizedLabel}</Label>
                  </div>
                  <div
                    className="relative flex flex-col flex-1 items-center ring-1 ring-border rounded-lg p-1"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: isCropping ? "crosshair" : "default" }}
                  >
                    <img
                      src={output}
                      alt="Resized output"
                      ref={imageRef}
                      draggable={false}
                      onDoubleClick={handleImageDoubleClick}
                      className={`flex w-auto h-auto max-h-[640px] rounded-sm ${
                        showAnimation ? "animate-grow-from-center" : ""
                      }`}
                    />
                    {isCropping && cropRect && (
                      <CropOverlayComponent
                        isCropping={isCropping}
                        cropRect={cropRect}
                        mousePosition={mousePosition}
                      />
                    )}
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
