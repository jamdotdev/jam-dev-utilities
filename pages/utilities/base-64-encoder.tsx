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
import Base64SEO from "@/components/seo/Base64SEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";

export default function Base64Encoder() {
  const [type, setType] = useState<"encoder" | "decoder">("encoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setInput(value);

      try {
        setOutput(type === "encoder" ? toBase64(value) : fromBase64(value));
      } catch {
        setOutput("Invalid input, please provide valid Base64 string");
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
      <Meta
        title="Base64 Encoder/Decoder by Jam.dev | Free, Open Source & Ad-free"
        description="Effortlessly encode and decode text to and from Base64 format with Jam's free online tool. Ensure safe data transmission and storage with web-friendly text formats."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Base64 encoder/decoder"
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
            <Label>{type === "encoder" ? "Text to encode" : "Base64"}</Label>
            <Textarea
              rows={6}
              placeholder="Paste here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />
            <Label>{type === "encoder" ? "Base64" : "Text"}</Label>
            <Textarea value={output} rows={6} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(output)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <Base64SEO />
      </section>
    </main>
  );
}

function toBase64(value: string) {
  try {
    return Buffer.from(value).toString("base64");
  } catch {
    throw new Error("Failed to encode to Base64");
  }
}

function fromBase64(value: string): string {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf-8");
    if (!isPrintableASCII(decoded)) {
      throw new Error("Decoded string contains non-printable characters");
    }
    return decoded;
  } catch {
    throw new Error("Invalid Base64 input");
  }
}

/**
 * Checks if the given string consists entirely of printable ASCII characters.
 * Printable ASCII characters are those in the range from space (0x20) to tilde (0x7E).
 */
function isPrintableASCII(str: string): boolean {
  return /^[\x20-\x7E]*$/.test(str);
}
