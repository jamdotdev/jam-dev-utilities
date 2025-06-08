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
import { decodeJWT, State } from "@/components/utils/jwt-parser.utils";
import GitHubContribution from "@/components/GitHubContribution";

export default function JWTParser() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [validity, setValidity] = useState({
    message: "Validity check",
    state: State.Unknown,
  });

  const { buttonText: headerText, handleCopy: handleCopyHeader } =
    useCopyToClipboard();
  const { buttonText: payloadText, handleCopy: handleCopyPayload } =
    useCopyToClipboard();
  const { buttonText: signatureText, handleCopy: handleCopySignature } =
    useCopyToClipboard();

  const stateColors: Record<State, string> = {
    [State.NotYetValid]: "yellow",
    [State.Valid]: "green",
    [State.Expired]: "red",
    [State.NeverValid]: "red",
    [State.Unknown]: "gray",
  };

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      setInput(value);

      try {
        if (!value) {
          setHeader("");
          setPayload("");
          setSignature("");
          setValidity({ message: "Validity check", state: State.Unknown });
        } else {
          const { header, payload, signature, validity } = decodeJWT(
            value.trim()
          );
          setHeader(JSON.stringify(header, null, 2));
          setPayload(JSON.stringify(payload, null, 2));
          setSignature(signature || "");
          setValidity(validity || { message: "", state: State.Unknown });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid Input.";
        setHeader(errorMessage);
        setPayload(errorMessage);
        setSignature(errorMessage);
        setValidity({ message: errorMessage, state: State.Unknown });
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

            <Divider />

            <div
              className={`p-4 bg-${stateColors[validity.state]}-200 dark:bg-${stateColors[validity.state]}-800 rounded-xl mb-6`}
            >
              <Label className="m-0">{validity.message}</Label>
            </div>

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

            <Divider />

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

            <Divider />

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

const Divider = () => {
  return <div className="bg-border h-[1px] my-6"></div>;
};
