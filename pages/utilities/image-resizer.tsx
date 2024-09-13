import { useCallback, useState, useMemo, ChangeEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import {
  Format,
  handleResizeImage,
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

  function setOutputAndShowAnimation(output: string) {
    setOutput(output);
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 500);
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      setImageFile(file);
      processImageFile({
        file,
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
    [format, preserveAspectRatio, quality]
  );

  const handleAspectRatioChange = useCallback(() => {
    setPreserveAspectRatio((prev) => {
      const newValue = !prev;

      if (newValue && imageFile && width) {
        updateHeight({ width, file: imageFile, setHeight });
      }

      return newValue;
    });
  }, [imageFile, width]);

  const handleWidthChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let newWidth = parseInt(e.target.value);
      if (newWidth > MAX_DIMENSION) {
        newWidth = MAX_DIMENSION;
      }
      setWidth(newWidth);

      if (preserveAspectRatio && imageFile) {
        updateHeight({ file: imageFile, setHeight, width: newWidth });
      }
    },
    [preserveAspectRatio, imageFile]
  );

  const handleHeightChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let newHeight = parseInt(e.target.value);
      if (newHeight > MAX_DIMENSION) {
        newHeight = MAX_DIMENSION;
      }
      setHeight(newHeight);

      if (preserveAspectRatio && imageFile) {
        updateWidth({ file: imageFile, height: newHeight, setWidth });
      }
    },
    [preserveAspectRatio, imageFile]
  );

  const handleResize = useCallback(() => {
    if (imageFile) {
      handleResizeImage({
        file: imageFile,
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
  }, [imageFile, width, height, format, quality, preserveAspectRatio]);

  const resizedLabel = useMemo(() => {
    const { height, width, format, quality } = resizedImageInfo;

    if (width && height && format) {
      const qualityLabel = format === "jpeg" ? `(Quality: ${quality})` : "";
      return `${format.toUpperCase()} - ${width} x ${height} ${qualityLabel}`;
    }
    return "Click 'Resize' to see the dimensions";
  }, [resizedImageInfo]);

  const handleQualityInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (value > 1) {
      value = 1;
    }
    setQuality(value);
  }, []);

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
                  disabled={!imageFile}
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
                  disabled={!imageFile}
                />
              </div>
            </div>

            <div className="flex items-center mb-6 gap-2">
              <Checkbox
                id="preserve-aspect-ratio"
                checked={preserveAspectRatio}
                onCheckedChange={handleAspectRatioChange}
                disabled={!imageFile}
                className="mr-1"
              />
              <Label
                htmlFor="preserve-aspect-ratio"
                className="mb-0 hover:cursor-pointer"
              >
                Preserve Aspect Ratio
              </Label>
            </div>

            <Divider />

            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label className="mb-2">Format</Label>
                <Combobox
                  data={formatOptions}
                  onSelect={(value) => setFormat(value as Format)}
                  defaultValue={format}
                  disabled={!imageFile}
                />
              </div>

              <div className="flex flex-1 flex-col">{qualityInput}</div>
            </div>

            <Divider />

            <div className={cn(imageFile && "mb-6", "flex w-full gap-4")}>
              <Button
                className="flex flex-1"
                onClick={handleResize}
                disabled={!imageFile}
              >
                Resize
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
                <Divider />
                <div>
                  <div className="flex flex-1 justify-between">
                    <Label>Resized Image</Label>
                    <Label>{resizedLabel}</Label>
                  </div>
                  <div className="flex flex-col flex-1 items-center ring-1 ring-border rounded-lg p-1">
                    <img
                      src={output}
                      alt="Resized output"
                      className={`flex w-auto h-auto max-h-[640px] rounded-sm ${showAnimation ? "animate-grow-from-center" : ""}`}
                    />
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

const Divider = () => {
  return <div className="h-[1px] bg-muted my-6"></div>;
};
