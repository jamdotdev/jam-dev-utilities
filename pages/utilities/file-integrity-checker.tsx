import React, { useCallback, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import Header from "@/components/Header";
import UploadIcon from "@/components/icons/UploadIcon";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import JamCallToAction from "@/components/JamCallToAction";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
import crypto from "crypto";
import GitHubContribution from "@/components/GitHubContribution";
import FileIntegrityCheckerSEO from "@/components/seo/FileIntegrityCheckerSEO";
import { Flame } from "lucide-react";

const ALGORITHMS = ["sha256", "sha512", "md5"] as const;
type Algorithm = (typeof ALGORITHMS)[number];

const ALGORITHM_LABELS: Record<Algorithm, string> = {
  sha256: "SHA-256",
  sha512: "SHA-512",
  md5: "MD5",
};

// 8MB chunks: file is read and hashed incrementally so memory use stays constant
const CHUNK_SIZE = 8 * 1024 * 1024;

interface AlgorithmOption {
  value: Algorithm;
  label: string;
}

const algorithmOptions: AlgorithmOption[] = ALGORITHMS.map((algo) => ({
  value: algo,
  label: ALGORITHM_LABELS[algo],
}));

type HashResults = Record<Algorithm, string>;

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}

async function hashFileChunked(
  file: File,
  algorithms: readonly Algorithm[],
  onProgress: (percent: number) => void,
  signal: AbortSignal
): Promise<HashResults> {
  const hashes = algorithms.reduce(
    (acc, algo) => {
      acc[algo] = crypto.createHash(algo);
      return acc;
    },
    {} as Record<Algorithm, crypto.Hash>
  );

  let offset = 0;
  while (offset < file.size) {
    throwIfAborted(signal);
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = Buffer.from(await chunk.arrayBuffer());
    throwIfAborted(signal);
    for (const algo of algorithms) {
      hashes[algo].update(buffer);
    }
    offset += CHUNK_SIZE;
    onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
  }

  // Empty file: loop above never runs, still needs a digest.
  return algorithms.reduce((acc, algo) => {
    acc[algo] = hashes[algo].digest("hex");
    return acc;
  }, {} as HashResults);
}

export default function FileIntegrityChecker() {
  const [dropStatus, setDropStatus] = useState<
    "idle" | "unsupported" | "hover"
  >("idle");
  const [fileName, setFileName] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HashResults | null>(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyInput, setVerifyInput] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithm>("sha256");
  const { buttonText, handleCopy } = useCopyToClipboard();
  const abortControllerRef = useRef<AbortController | null>(null);

  const computeHash = useCallback(async (file: File, algorithm: Algorithm) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setError("");
    setVerifyInput("");
    setProgress(0);
    setResults(null);
    setIsHashing(true);

    try {
      const hashes = await hashFileChunked(
        file,
        [algorithm],
        (percent) => setProgress(percent),
        controller.signal
      );
      setResults(hashes);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? `Failed to hash file: ${err.message}`
          : "An unexpected error occurred while hashing the file."
      );
    } finally {
      if (!controller.signal.aborted) setIsHashing(false);
    }
  }, []);

  const handleAlgorithmSelect = useCallback(
    (value: string) => {
      if (!ALGORITHMS.includes(value as Algorithm)) return;
      const algorithm = value as Algorithm;
      setSelectedAlgorithm(algorithm);
      if (selectedFile) {
        computeHash(selectedFile, algorithm);
      }
    },
    [selectedFile, computeHash]
  );

  const processFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      setSelectedFile(file);
      setError("");
      setVerifyInput("");
      setProgress(0);
      computeHash(file, selectedAlgorithm);
    },
    [selectedAlgorithm, computeHash]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = "";
      if (!file) return;
      setDropStatus("idle");
      processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) {
        setDropStatus("unsupported");
        return;
      }
      setDropStatus("idle");
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDropStatus("hover");
    },
    []
  );

  const handleVerifyChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setVerifyInput(event.currentTarget.value);
    },
    []
  );

  const isMatch =
    !!results &&
    !!verifyInput.trim() &&
    verifyInput.trim().toLowerCase() === results[selectedAlgorithm];

  return (
    <main>
      <Meta
        title="File Integrity Checker | Free, Open Source & Ad-free"
        description="Check file integrity by generating SHA-256, SHA-512, and MD5 hashes for any file, then verify against a known hash."
      />
      <Header />
      <CMDK />

      <section className="max-w-2xl mx-auto mb-12">
        <PageHeader
          title="File Integrity Checker"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDropStatus("idle")}
            className="relative flex flex-col border border-dashed border-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted"
          >
            <input
              type="file"
              data-testid="input"
              onChange={handleFileChange}
              disabled={isHashing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <UploadIcon />
            <div>
              {dropStatus === "idle" && !fileName && (
                <p>Drop any file here, or click to browse</p>
              )}
              {dropStatus === "hover" && (
                <p className="flex items-center justify-center gap-1">
                  Drop it like it's hot <Flame className="size-3" />
                </p>
              )}
              {dropStatus === "unsupported" && (
                <p>Couldn&apos;t read that file</p>
              )}
              {dropStatus === "idle" && fileName && (
                <p className="truncate max-w-full">{fileName}</p>
              )}
            </div>
          </div>

          {fileName && (
            <div
              className={`mt-4 transition-opacity ${
                isHashing ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isHashing}
            >
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${isHashing ? progress : 0}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Hashing… {progress}%
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}

          {fileName && (
            <div className="mt-4 space-y-4">
              <Label htmlFor="algorithm-select">Hash Algorithm</Label>
              <select
                id="algorithm-select"
                aria-label="Hash algorithm"
                value={selectedAlgorithm}
                onChange={(event) => handleAlgorithmSelect(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {algorithmOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Divider />

              <div className="mt-4">
                <Label>{ALGORITHM_LABELS[selectedAlgorithm]} Hash</Label>
                <Textarea
                  value={
                    isHashing
                      ? `Calculating…`
                      : results
                        ? results[selectedAlgorithm]
                        : ""
                  }
                  placeholder="Hash will appear here"
                  rows={2}
                  readOnly
                />
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    results && handleCopy(results[selectedAlgorithm])
                  }
                  disabled={!results}
                >
                  {buttonText}
                </Button>
              </div>

              <Divider />

              <Label>Verify Hash (optional)</Label>
              <Textarea
                rows={2}
                placeholder={`Paste a ${ALGORITHM_LABELS[selectedAlgorithm]} hash to verify it against the file above`}
                value={verifyInput}
                onChange={handleVerifyChange}
                disabled={!results}
                className="mb-2"
                style={
                  verifyInput.trim() && results
                    ? {
                        borderColor: isMatch ? "#16a34a" : "#dc2626",
                        borderWidth: 2,
                      }
                    : undefined
                }
              />
              <p
                className={`text-sm min-h-[1.25rem] ${
                  verifyInput.trim() && results
                    ? isMatch
                      ? "text-green-600"
                      : "text-destructive"
                    : "opacity-0"
                }`}
                aria-hidden={!(verifyInput.trim() && results)}
              >
                {isMatch ? "Match — file is intact" : "No match"}
              </p>
            </div>
          )}
        </Card>
      </section>

      <GitHubContribution username="hariharjeevan" />
      <JamCallToAction />

      <section className="container max-w-2xl">
        <FileIntegrityCheckerSEO />
      </section>
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-border my-6"></div>;
};
