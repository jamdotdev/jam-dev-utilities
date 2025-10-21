import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { ImageUploadComponent } from "@/components/ds/ImageUploadComponent";
import ImageToBase64SEO from "@/components/seo/ImageToBase64SEO";
import { DividerComponent } from "../../components/ds/DividerComponent";

export default function ImageToBase64() {
  const [base64, setBase64] = useState("");
  const copyHooks = [
    useCopyToClipboard(),
    useCopyToClipboard(),
    useCopyToClipboard(),
  ];
  const [
    { buttonText: buttonBase64, handleCopy: handleCopyBase64 },
    { buttonText: buttonImgTag, handleCopy: handleCopyImgTag },
    { buttonText: buttonCSS, handleCopy: handleCopyCSS },
  ] = copyHooks;

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <main>
      <Meta
        title="Image to Base64 Converter | Free, Open Source & Ad-free"
        description="Convert images to Base64 format quickly and easily with Jam's free online image to Base64 converter. Just drag and drop your image and get the Base64 result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Image to Base64 Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <ImageUploadComponent onFileSelect={handleFileSelect} />
          <div className="pt-8">
            <Label>Base64 Output</Label>
            <Textarea
              value={base64}
              rows={6}
              readOnly
              className="mb-4 overflow-x-hidden"
            />
            <Button variant="outline" onClick={() => handleCopyBase64(base64)}>
              {buttonBase64}
            </Button>

            <DividerComponent margin="medium" />

            <Label>Use in {"<img>"} tag:</Label>
            <Textarea
              value={truncate(`<img src="${base64}" alt="Base64 Image" />`, 60)}
              rows={1}
              readOnly
              className="min-h-0 mb-4 whitespace-nowrap overflow-hidden"
            />
            <Button
              variant="outline"
              onClick={() => {
                handleCopyImgTag(`<img src="${base64}" alt="Base64 Image" />`);
              }}
            >
              {buttonImgTag}
            </Button>

            <DividerComponent margin="medium" />

            <Label>Use in CSS</Label>
            <Textarea
              value={truncate(`background-image: url(${base64});`, 60)}
              rows={1}
              readOnly
              className="min-h-0 mb-4 whitespace-nowrap overflow-hidden"
            />
            <Button
              variant="outline"
              onClick={() => {
                handleCopyCSS(`background-image: url(${base64});`);
              }}
            >
              {buttonCSS}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <ImageToBase64SEO />
      </section>
    </main>
  );
}

const truncate = (input: string, maxLength: number) => {
  if (input.length <= maxLength) {
    return input;
  }

  return input.substring(0, maxLength) + "...";
};
