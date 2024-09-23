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
import {
  decodeJWTHeader,
  decodeJWTPayload,
} from "@/components/utils/jwt-decode.utils";
import GitHubContribution from "@/components/GitHubContribution";

export default function JWTDecoder() {
  const [jwt, setJwt] = useState("");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setJwt(value);

      if (value.trim() === "") {
        setDecodedHeader("");
        setDecodedPayload("");
        return;
      }

      setDecodedHeader(decodeJWTHeader(value.trim()));
      setDecodedPayload(decodeJWTPayload(value.trim()));
    },
    []
  );

  return (
    <main>
      <Meta
        title="JWT Decoder | Free, Open Source & Ad-free"
        description="Decode JSON Web Tokens quickly and easily with our free online JWT decoder. Just paste your JWT and see the decoded information."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JWT Decoder"
          description="Secure, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>JWT</Label>
            <Textarea
              rows={6}
              placeholder="Paste JWT here"
              onChange={handleChange}
              className="mb-6"
              value={jwt}
            />

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">Decoded Header</Label>
            </div>
            <Textarea
              value={decodedHeader}
              rows={6}
              readOnly
              className="mb-4"
            />

            <div className="flex justify-between items-center mb-2">
              <Label className="mb-0">Decoded Payload</Label>
            </div>
            <Textarea
              value={decodedPayload}
              rows={6}
              readOnly
              className="mb-4"
            />

            <Button
              variant="outline"
              onClick={() =>
                handleCopy(decodedHeader + "\n\n" + decodedPayload)
              }
            >
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="ayshrj" />
      <CallToActionGrid />
    </main>
  );
}
