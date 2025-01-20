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

type Status = "idle" | "invalid" | "error";

const getStatusMessage = (status: Status) => {
  switch (status) {
    case "invalid":
      return "Input does not contain an SVG tag";
    case "error":
      return "Failed to process SVG. Please check your input.";
    default:
      return null;
  }
};

export default function SVGViewer() {
  const [input, setInput] = useState("");
  const [base64, setBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setBase64(null);
        setStatus("idle");
        return;
      }

      try {
        if (!value.toLowerCase().includes("<svg")) {
          setStatus("invalid");
          setBase64(null);
          return;
        }

        const blob = new Blob([value], { type: "image/svg+xml" });
        const reader = new FileReader();

        reader.onload = () => {
          setBase64(reader.result as string);
          setStatus("idle");
        };

        reader.onerror = () => {
          setStatus("error");
          setBase64(null);
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Failed to process SVG:", err);
        setStatus("error");
        setBase64(null);
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="SVG Viewer | Free, Open Source & Ad-free"
        description="View SVG quickly and easily with Jam's free online SVG viewer. Just paste your SVG code and get the SVG result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="SVG Viewer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>SVG Code</Label>
            <Textarea
              rows={6}
              placeholder="Paste SVG code here"
              onChange={handleChange}
              value={input}
              aria-label="SVG code input"
            />

            {status !== "idle" && (
              <div className="mt-6 flex text-red-600 text-sm" role="alert">
                {getStatusMessage(status)}
              </div>
            )}

            <div className="w-full">
              {base64 && (
                <div className="mt-6 border rounded p-4 overflow-auto">
                  <img
                    src={base64}
                    alt="SVG Preview"
                    className="w-full h-auto"
                    onError={() => {
                      setStatus("error");
                      setBase64(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="samiashi" />
      <CallToActionGrid />
    </main>
  );
}
