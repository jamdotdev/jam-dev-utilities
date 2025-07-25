import { ChangeEvent, useCallback, useState } from "react";
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
import { decodeJWT } from "@/components/utils/jwt-parser.utils";
import GitHubContribution from "@/components/GitHubContribution";
import { DividerComponent } from "../../components/ds/DividerComponent";

export default function JWTParser() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");

  const { buttonText: headerText, handleCopy: handleCopyHeader } =
    useCopyToClipboard();
  const { buttonText: payloadText, handleCopy: handleCopyPayload } =
    useCopyToClipboard();
  const { buttonText: signatureText, handleCopy: handleCopySignature } =
    useCopyToClipboard();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      try {
        const { header, payload, signature } = decodeJWT(value.trim());
        setHeader(JSON.stringify(header, null, 2));
        setPayload(JSON.stringify(payload, null, 2));
        setSignature(signature || "");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid Input.";
        setHeader(errorMessage);
        setPayload(errorMessage);
        setSignature(errorMessage);
      }
    },
    []
  );

  return (
    <main>
      <Meta
        title="JWT Parser | Free, Open Source & Ad-free"
        description="Decode JWT tokens quickly and easily with Jam's free online JWT Decoder. Just paste your token and get the decoded result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="JWT Parser"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>JWT Token</Label>
            <Textarea
              rows={3}
              placeholder="Paste JWT here"
              onChange={handleChange}
              className="mb-6"
              value={input}
            />

            <DividerComponent margin="medium" />

            <div>
              <Label>Decoded Header</Label>
              <Textarea value={header} rows={6} readOnly className="mb-4" />
              <Button
                variant="outline"
                onClick={() => handleCopyHeader(header)}
              >
                {headerText}
              </Button>
            </div>

            <DividerComponent margin="medium" />

            <div>
              <Label>Decoded Payload</Label>
              <Textarea value={payload} rows={6} readOnly className="mb-4" />
              <Button
                variant="outline"
                onClick={() => handleCopyPayload(payload)}
              >
                {payloadText}
              </Button>
            </div>

            <DividerComponent margin="medium" />

            <div>
              <Label>Signature</Label>
              <Textarea
                value={signature}
                rows={1}
                readOnly
                className="mb-4 min-h-0"
              />
              <Button
                variant="outline"
                onClick={() => handleCopySignature(signature)}
              >
                {signatureText}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <GitHubContribution username="EduardoDePatta" />
      <CallToActionGrid />
    </main>
  );
}
