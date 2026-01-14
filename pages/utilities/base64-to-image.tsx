import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import GitHubContribution from "@/components/GitHubContribution";
import Base64ToImageSEO from "@/components/seo/Base64ToImageSEO";
import Link from "next/link";

type Status = "idle" | "invalid" | "error";

const getStatusMessage = (status: Status) => {
  switch (status) {
    case "invalid":
      return "Invalid Base64 string. Please provide a valid Base64-encoded image.";
    case "error":
      return "Failed to decode image. Please check your input.";
    default:
      return null;
  }
};

export default function Base64ToImage() {
  const [input, setInput] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const processBase64 = useCallback((value: string) => {
    if (value.trim() === "") {
      setImageSrc(null);
      setStatus("idle");
      return;
    }

    try {
      let dataUri = value.trim();

      // If it's already a data URI, use it directly
      if (dataUri.startsWith("data:image/")) {
        setImageSrc(dataUri);
        setStatus("idle");
        return;
      }

      // Try to detect if it's a valid base64 string
      // Remove any whitespace that might have been added
      const cleanBase64 = dataUri.replace(/\s/g, "");

      // Check if it looks like valid base64
      if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
        setStatus("invalid");
        setImageSrc(null);
        return;
      }

      // Try to decode to verify it's valid base64
      try {
        atob(cleanBase64);
      } catch {
        setStatus("invalid");
        setImageSrc(null);
        return;
      }

      // Create a data URI with a generic image type
      // The browser will handle the actual image type detection
      dataUri = `data:image/png;base64,${cleanBase64}`;
      setImageSrc(dataUri);
      setStatus("idle");
    } catch (err) {
      console.error("Failed to process Base64:", err);
      setStatus("error");
      setImageSrc(null);
    }
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);
      processBase64(value);
    },
    [processBase64]
  );

  const handleImageError = useCallback(() => {
    setStatus("error");
    setImageSrc(null);
  }, []);

  return (
    <main>
      <Meta
        title="Base64 to Image Converter | Free, Open Source & Ad-free"
        description="Convert Base64 strings to images instantly with Jam's free online tool. Just paste your Base64-encoded image data and see the preview. Fast, free, and developer-friendly."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Base64 to Image Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Base64 String</Label>
            <Textarea
              rows={6}
              placeholder="Paste Base64-encoded image data here (with or without data URI prefix)"
              onChange={handleChange}
              value={input}
              aria-label="Base64 input"
            />
          </div>

          {status !== "idle" && (
            <div className="mt-6 flex text-red-600 text-sm" role="alert">
              {getStatusMessage(status)}
            </div>
          )}

          <div className="w-full">
            {imageSrc && (
              <div className="mt-6 border rounded p-4 overflow-auto">
                <Label>Image Preview</Label>
                <img
                  src={imageSrc}
                  alt="Decoded Base64 Image"
                  className="w-full h-auto mt-2"
                  onError={handleImageError}
                />
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              Looking to convert an image to Base64?{" "}
              <Link
                href="/utilities/image-to-base64"
                className="text-primary underline hover:no-underline"
              >
                Use our Image to Base64 Converter
              </Link>
            </p>
          </div>
        </Card>
      </section>

      <GitHubContribution username="devin-ai-integration" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <Base64ToImageSEO />
      </section>
    </main>
  );
}
