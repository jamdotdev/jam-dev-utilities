import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { resizeImage } from "../../components/utils/resize-image.utils";
import ImageResizeSEO from "../../components/seo/ImageResizeSEO";

export default function ImageResize() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            resizeImage(img, width, height, format).then(setOutput);
          };
        };
        reader.readAsDataURL(file);
      }
    },
    [width, height, format]
  );

  const handleResize = useCallback(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          resizeImage(img, width, height, format).then(setOutput);
        };
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, width, height, format]);

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

            <div className="flex justify-between items-center mb-2">
              <div className="flex-1 mr-2">
                <Label className="mb-1">Width (px)</Label>
                <Textarea
                  rows={1}
                  placeholder="Enter width"
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="mb-2"
                />
              </div>
              <div className="flex-1 ml-2">
                <Label className="mb-1">Height (px)</Label>
                <Textarea
                  rows={1}
                  placeholder="Enter height"
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="mb-2"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Label className="mb-0">Format</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}
                className="border rounded p-2"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>

            <Button variant="outline" onClick={handleResize}>
              Resize and Download
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
