import React, { useEffect, useState, useCallback } from "react";

interface RGBValues {
  r: string;
  g: string;
  b: string;
}

interface CodeSnippetRowProps {
  label: string;
  convertFunction: (rgb: RGBValues) => string;
  rgb: RGBValues;
}

export default function CodeSnippetRow({
  label,
  convertFunction,
  rgb,
}: CodeSnippetRowProps) {
  const [snippet, setSnippet] = useState(() =>
    convertWithFallback(convertFunction, rgb)
  );
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setSnippet(convertWithFallback(convertFunction, rgb));
  }, [rgb, convertFunction]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, [snippet]);

  return (
    <div className="flex text-sm mb-1.5">
      <span className="min-w-[80px]">{label}: </span>
      <span
        className="cursor-pointer rounded-md px-1.5 hover:bg-muted"
        onClick={copyToClipboard}
      >
        {isCopied ? <CopiedMessage /> : snippet}
      </span>
    </div>
  );
}

function convertWithFallback(
  convertFunction: (rgb: RGBValues) => string,
  rgb: RGBValues
): string {
  const safeRgb: RGBValues = {
    r: rgb.r || "0",
    g: rgb.g || "0",
    b: rgb.b || "0",
  };

  return convertFunction(safeRgb);
}

const CopiedMessage = () => (
  <div className="flex items-center gap-1">
    <Checkmark />
    <span>Copied!</span>
  </div>
);

const Checkmark = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
      fill="#3BCA24"
    />
    <path
      d="M5 9L7 11L11.5 5.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
