import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import ImageResizeSEO from "../../components/seo/ImageResizeSEO";
import { resizeImage } from "../../components/utils/resize-image.utils";
import { Combobox } from "../../components/ds/ComboboxComponent";
import { Checkbox } from "../../components/ds/CheckboxComponent";
import { Input } from "../../components/ds/InputComponent";

type Format = "png" | "jpeg";
interface FormatOption {
  value: Format;
  label: string;
}

const formatOptions: FormatOption[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

export default function ImageResize() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [format, setFormat] = useState<Format>("png");
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [quality, setQuality] = useState<number>(1);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            resizeImage({
              img,
              width: img.width,
              height: img.height,
              format,
              quality,
              maintainAspectRatio,
            }).then(setOutput);
          };
        };
        reader.readAsDataURL(file);
      }
    },
    [format, maintainAspectRatio, quality]
  );

  const handleAspectRatioChange = useCallback(() => {
    setMaintainAspectRatio((prev) => {
      const newValue = !prev;

      if (newValue && imageFile && width) {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
          img.onload = () => {
            const newHeight = Math.round(width / (img.width / img.height));
            setHeight(newHeight);
          };
        };
        reader.readAsDataURL(imageFile);
      }

      return newValue;
    });
  }, [imageFile, width]);

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newWidth = parseInt(e.target.value);
      setWidth(newWidth);

      if (maintainAspectRatio && imageFile) {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
          img.onload = () => {
            const newHeight = Math.round(newWidth / (img.width / img.height));
            setHeight(newHeight);
          };
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [maintainAspectRatio, imageFile]
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newHeight = parseInt(e.target.value);
      setHeight(newHeight);

      if (maintainAspectRatio && imageFile) {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
          img.onload = () => {
            const newWidth = Math.round(newHeight * (img.width / img.height));
            setWidth(newWidth);
          };
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [maintainAspectRatio, imageFile]
  );

  const handleResize = useCallback(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          resizeImage({
            img,
            width,
            height,
            format,
            quality,
            maintainAspectRatio,
          }).then(setOutput);
        };
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, width, height, format, quality, maintainAspectRatio]);

  const qualityInput = useMemo(() => {
    if (format === "png") {
      return null;
    }
    return (
      <div className="flex justify-between items-center mb-4">
        <Label className="mb-1">Quality (0.1 to 1.0)</Label>
        <Input
          type="number"
          min="0.1"
          max="1.0"
          step="0.1"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-[88] border rounded p-2 text-right"
          disabled={!imageFile}
        />
      </div>
    );
  }, [format, imageFile, quality]);

  return (
    <main>
      <Meta
        title="Image Resizer by Jam.dev | Free, Open Source & Ad-free"
        description="Resize images online with Jam's free and open source Image Resizer. Adjust dimensions, maintain aspect ratio, and choose between PNG and JPEG formats."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Image Resizer"
          description="Resize images while maintaining aspect ratio and choose between PNG and JPEG formats."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Upload Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-6"
            />

            <div className="flex items-center mb-6 gap-2">
              <Checkbox
                id="mantain-aspect-ratio"
                checked={maintainAspectRatio}
                onCheckedChange={handleAspectRatioChange}
                disabled={!imageFile}
                className="mr-1"
              />
              <label
                htmlFor="mantain-aspect-ratio"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Maintain Aspect Ratio
              </label>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="flex-1 mr-2">
                <Label className="mb-1">Width (px)</Label>
                <Textarea
                  rows={1}
                  placeholder="Enter width"
                  onChange={handleWidthChange}
                  value={width || ""}
                  className="mb-2"
                  disabled={!imageFile}
                />
              </div>
              <div className="flex-1 ml-2">
                <Label className="mb-1">Height (px)</Label>
                <Textarea
                  rows={1}
                  placeholder="Enter height"
                  onChange={handleHeightChange}
                  value={height || ""}
                  className="mb-2"
                  disabled={!imageFile}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <Label className="mb-0">Format</Label>
              <Combobox
                data={formatOptions}
                onSelect={(value) => setFormat(value as Format)}
                defaultValue={format}
                disabled={!imageFile}
              />
            </div>

            {qualityInput}

            <Button
              variant="outline"
              onClick={handleResize}
              disabled={!imageFile}
            >
              Resize
            </Button>

            {output && (
              <div className="mt-6">
                <Label>Resized Image</Label>
                <img
                  src={output}
                  alt="Resized output"
                  className="w-full h-auto mb-4"
                />
                <a
                  href={output}
                  download={`resized-image.${format}`}
                  className="text-blue-500"
                >
                  Download Image
                </a>
              </div>
            )}
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <ImageResizeSEO />
      </section>
    </main>
  );
}
