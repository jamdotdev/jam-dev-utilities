import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import SvgViewerSEO from "@/components/seo/SvgViewerSEO";

export default function SVGViewer() {
  const [input, setInput] = useState("");
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      if (value.trim() === "") {
        setSvgContent(null);
        return;
      }

      setSvgContent(event.target.value);
    },
    []
  );

  return (
    <main>
      <Meta
        title="SVG Viewer | Free, Open Source & Ad-free"
        description="View SVG files quickly and easily with Jam's free online SVG viewer. Just paste your SVG file and get the SVG result. That's it."
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
            <Label>SVG</Label>
            <Textarea
              rows={6}
              placeholder="Paste SVG here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <div className="flex justify-between items-center mb-2">
              {svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              ) : (
                <Label className="mb-0">No SVG loaded yet</Label>
              )}
            </div>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <SvgViewerSEO />
      </section>
    </main>
  );
}
