import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ds/TabsComponent";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import UrlEncoderSEO from "../../components/seo/UrlEncoderSEO";
import CallToActionGrid from "../../components/CallToActionGrid";

export default function URLEncoder() {
  const [type, setType] = useState<"encoder" | "decoder">("encoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setInput(value);

      try {
        const output = type === "encoder" ? encode(value) : decode(value);
        setOutput(output);
      } catch (error) {
        setOutput("Invalid input");
      }
    },
    [type]
  );

  const setActiveTab = (type: "encoder" | "decoder") => {
    setType(type);
    setOutput("");
    setInput("");
  };

  return (
    <main>
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="URL encoder/decoder"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <Tabs defaultValue="encoder" className="mb-6">
            <TabsList className="flex">
              <TabsTrigger
                className="flex flex-1"
                value="encoder"
                onClick={() => setActiveTab("encoder")}
              >
                Encode
              </TabsTrigger>
              <TabsTrigger
                className="flex flex-1"
                onClick={() => setActiveTab("decoder")}
                value="decoder"
              >
                Decode
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <Label>
              {type === "encoder" ? "Text to encode" : "Encoded URL"}
            </Label>
            <Textarea
              rows={6}
              placeholder="Paste here"
              onChange={handleInput}
              className="mb-6"
              value={input}
            />
            <Label>{type === "encoder" ? "Encoded URL" : "Decoded URL"}</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <UrlEncoderSEO />
      </section>
    </main>
  );
}

function encode(input: string): string {
  try {
    const url = new URL(input);
    return encodeURI(url.toString());
  } catch {
    return encodeURIComponent(input);
  }
}

function decode(input: string): string {
  try {
    const hasProtocol = /^https?:\/\//i.test(input);

    if (hasProtocol) {
      const url = new URL(input);
      return decodeURI(url.toString());
    } else {
      return decodeURIComponent(input);
    }
  } catch (error) {
    return "Invalid URL format";
  }
}
