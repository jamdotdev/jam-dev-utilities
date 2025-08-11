"use client";
import { DragEvent, useCallback, useMemo, useRef, useState } from "react";
import UploadIcon from "@/components/icons/UploadIcon";

type Status = "idle" | "loading" | "error" | "unsupported" | "hover";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB default for SVG files

interface SVGUploadProps {
  onSVGSelect: (svgContent: string) => void;
  maxFileSize?: number;
}

const SVGUploadComponent = ({
  onSVGSelect,
  maxFileSize = MAX_FILE_SIZE,
}: SVGUploadProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedMaxSize = useMemo((): string => {
    const sizeInMB = maxFileSize / (1024 * 1024);
    return Number.isInteger(sizeInMB)
      ? `${sizeInMB}MB`
      : `${sizeInMB.toFixed(2)}MB`;
  }, [maxFileSize]);

  const validateSVGFile = useCallback((file: File): boolean => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".svg")) {
      return false;
    }

    // Check file type
    if (file.type && !file.type.includes("svg")) {
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return false;
    }

    return true;
  }, [maxFileSize]);

  const readSVGFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Basic SVG content validation
        if (!content.toLowerCase().includes("<svg")) {
          setStatus("unsupported");
          return;
        }

        onSVGSelect(content);
        setStatus("idle");
      } catch (error) {
        console.error("Error reading SVG file:", error);
        setStatus("error");
      }
    };

    reader.onerror = () => {
      setStatus("error");
    };

    reader.readAsText(file);
  }, [onSVGSelect]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const file = event.dataTransfer.files[0];
      if (!file) {
        setStatus("unsupported");
        return;
      }

      if (!validateSVGFile(file)) {
        setStatus(file.size > maxFileSize ? "error" : "unsupported");
        return;
      }

      setStatus("loading");
      readSVGFile(file);
    },
    [validateSVGFile, readSVGFile, maxFileSize]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setStatus("hover");
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setStatus("idle");
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!validateSVGFile(file)) {
        setStatus(file.size > maxFileSize ? "error" : "unsupported");
        return;
      }

      setStatus("loading");
      readSVGFile(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className="flex flex-col border border-dashed border-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted cursor-pointer mb-2"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
      <UploadIcon />
      {statusComponents[status](formattedMaxSize)}
    </div>
  );
};

const StatusComponent = ({
  title,
  message,
}: {
  title: string;
  message?: string;
}) => (
  <div>
    <p>{title}</p>
    <p>{message || "\u00A0"}</p>
  </div>
);

const statusComponents: Record<Status, (maxSize: string) => JSX.Element> = {
  idle: (maxSize) => (
    <StatusComponent
      title="Drag and drop your SVG file here, or click to select"
      message={`Max size ${maxSize}`}
    />
  ),
  loading: () => <StatusComponent title="Loading..." />,
  error: (maxSize) => (
    <StatusComponent title="SVG file is too big!" message={`${maxSize} max`} />
  ),
  unsupported: () => <StatusComponent title="Please provide a valid SVG file" />,
  hover: () => <StatusComponent title="Drop it like it's hot! 🔥" />,
};

export { SVGUploadComponent };