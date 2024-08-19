import React, { useEffect, useState, useCallback } from "react";
import { ColorValue } from "@/components/utils/color-converter.utils";

interface CodeSnippetRowProps<T extends ColorValue> {
  label: string;
  value: T;
  convertFunction: (value: T) => string;
}

export default function CodeSnippetRow<T extends ColorValue>({
  label,
  value,
  convertFunction,
}: CodeSnippetRowProps<T>) {
  const [snippet, setSnippet] = useState(() =>
    convertWithFallback(convertFunction, value)
  );
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setSnippet(convertWithFallback(convertFunction, value));
  }, [value, convertFunction]);

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

function convertWithFallback<T extends ColorValue>(
  convertFunction: (value: T) => string,
  value: T
): string {
  try {
    return convertFunction(value) || 'Conversion error';
  } catch (error) {
    console.error("Conversion failed:", error);
    return "Conversion error";
  }
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