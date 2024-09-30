import React, { useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Input } from "@/components/ds/InputComponent";
import crypto, { BinaryToTextEncoding, Encoding } from "crypto";
import {
  Algorithm,
  generateHash,
} from "@/components/utils/hash-generator.utils";
import GitHubContribution from "@/components/GitHubContribution";

const MAX_ITERATIONS = 50_000;

type HashFunctions = {
  [K in Algorithm]: () => string;
};
interface Option<T extends string> {
  value: T;
  label: string;
}

const algorithmOptions: Option<Algorithm>[] = [
  { value: "sha256", label: "SHA-256" },
  { value: "sha512", label: "SHA-512" },
  { value: "md5", label: "MD5" },
  { value: "pbkdf2", label: "PBKDF2 (with SHA-512)" },
  { value: "hmac-sha256", label: "HMAC-SHA-256" },
  { value: "hmac-sha512", label: "HMAC-SHA-512" },
];

const encodingOptions: Option<Encoding>[] = [
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
  { value: "latin1", label: "Latin1" },
];

export default function HashGenerator() {
  const [textInput, setTextInput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("sha256");
  const [saltInput, setSaltInput] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [iterations, setIterations] = useState(10000);
  const [outputLength, setOutputLength] = useState(64);
  const [encoding, setEncoding] = useState<BinaryToTextEncoding>("hex");
  const [hashOutput, setHashOutput] = useState("");
  const { buttonText, handleCopy } = useCopyToClipboard();

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextInput(event.currentTarget.value);
    },
    []
  );

  const handleSaltChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSaltInput(event.currentTarget.value);
    },
    []
  );

  const handleSecretKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSecretKey(event.currentTarget.value);
    },
    []
  );

  const handleAlgorithmChange = useCallback((value: Algorithm) => {
    setAlgorithm(value);
  }, []);

  const handleIterationsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.currentTarget.value);
      setIterations(Math.min(value, MAX_ITERATIONS));
    },
    []
  );

  const handleOutputLengthChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOutputLength(Number(event.currentTarget.value));
    },
    []
  );

  const handleEncodingChange = useCallback((value: BinaryToTextEncoding) => {
    setEncoding(value);
  }, []);

  const hashFunctions = useMemo((): HashFunctions => {
    const resolvedSecretKey =
      secretKey || crypto.randomBytes(32).toString("hex");

    return {
      sha256: () => generateHash("sha256", textInput, encoding),
      sha512: () => generateHash("sha512", textInput, encoding),
      md5: () => generateHash("md5", textInput, encoding),
      pbkdf2: () => {
        const salt = saltInput || crypto.randomBytes(16).toString("hex");
        return crypto
          .pbkdf2Sync(textInput, salt, iterations, outputLength, "sha512")
          .toString(encoding);
      },
      "hmac-sha256": () =>
        generateHash("hmac-sha256", textInput, encoding, resolvedSecretKey),
      "hmac-sha512": () =>
        generateHash("hmac-sha512", textInput, encoding, resolvedSecretKey),
    };
  }, [textInput, saltInput, secretKey, iterations, outputLength, encoding]);

  const handleGenerateHash = useCallback(() => {
    if (!textInput) {
      setHashOutput("Please provide text to hash.");
      return;
    }

    try {
      const hashFunction = hashFunctions[algorithm];
      if (!hashFunction) {
        setHashOutput("Unsupported algorithm selected.");
        return;
      }

      const hash = hashFunction();
      setHashOutput(hash);
    } catch (error) {
      if (error instanceof Error) {
        setHashOutput(`Failed to generate hash: ${error.message}`);
      } else {
        setHashOutput("An unexpected error occurred during hash generation.");
      }
    }
  }, [textInput, algorithm, hashFunctions]);

  return (
    <main>
      <Meta
        title="Hash Generator | Free, Open Source & Ad-free"
        description="Generate secure hashes for your text using various algorithms like SHA-256, SHA-512, MD5, and PBKDF2 with Jam's free Hash Generator."
      />
      <Header />
      <CMDK />

      <section className="max-w-2xl mx-auto mb-12">
        <PageHeader
          title="Hash Generator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Text</Label>
            <Textarea
              rows={4}
              placeholder="Enter text to hash"
              onChange={handleTextChange}
              className="mb-6"
              value={textInput}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  handleGenerateHash();
                }
              }}
            />

            <Divider />

            <div className="flex flex-1 gap-4">
              <div className="flex flex-col flex-1">
                <Label>Algorithm</Label>
                <Combobox
                  data={algorithmOptions}
                  onSelect={handleAlgorithmChange}
                  value={algorithm}
                />
              </div>

              <div className="flex flex-col flex-1">
                <Label>Output Encoding</Label>
                <Combobox
                  data={encodingOptions}
                  onSelect={handleEncodingChange}
                  value={encoding}
                />
              </div>
            </div>

            <Divider />

            {algorithm === "pbkdf2" && (
              <div>
                <Label>Salt (optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter custom salt or leave blank for random"
                  value={saltInput}
                  onChange={handleSaltChange}
                  className="mb-4"
                />

                <Label>Iterations</Label>
                <Input
                  type="number"
                  value={iterations}
                  onChange={handleIterationsChange}
                  className="mb-4"
                  min="1000"
                  max={MAX_ITERATIONS}
                />

                <Label>Output Length (bytes)</Label>
                <Input
                  type="number"
                  value={outputLength}
                  onChange={handleOutputLengthChange}
                  className="mb-4"
                  min="16"
                  max="128"
                />
              </div>
            )}

            {(algorithm === "hmac-sha256" || algorithm === "hmac-sha512") && (
              <div>
                <Label>Secret Key (optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter custom secret key or leave blank for random"
                  value={secretKey}
                  onChange={handleSecretKeyChange}
                  className="mb-4"
                />
              </div>
            )}
          </div>

          <Button onClick={handleGenerateHash}>Generate Hash</Button>

          <Divider />

          <div>
            <Label>Generated Hash</Label>
            <Textarea value={hashOutput} rows={4} readOnly className="mb-4" />
            <Button variant="outline" onClick={() => handleCopy(hashOutput)}>
              {buttonText}
            </Button>
          </div>
        </Card>
      </section>

      <GitHubContribution username="EduardoDePatta" />
      <CallToActionGrid />
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-border my-6"></div>;
};
