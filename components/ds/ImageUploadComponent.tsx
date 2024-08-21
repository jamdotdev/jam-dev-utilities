"use client";
import { DragEvent, useCallback, useRef, useState } from "react";
import UploadIcon from "@/components/icons/UploadIcon";

type Status = "idle" | "loading" | "error" | "unsupported" | "hover";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  maxFileSize?: number;
}

const ImageUploadComponent = ({
  onFileSelect,
  maxFileSize = MAX_FILE_SIZE,
}: ImageUploadProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const file = event.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) {
        setStatus("unsupported");
        return;
      }

      if (file.size > maxFileSize) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      onFileSelect(file);
      setStatus("idle");
    },
    [onFileSelect, maxFileSize]
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
      if (!file.type.startsWith("image/")) {
        setStatus("unsupported");
        return;
      }

      if (file.size > maxFileSize) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      onFileSelect(file);
      setStatus("idle");
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
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <UploadIcon />
      {statusComponents[status]}
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

const statusComponents: Record<Status, JSX.Element> = {
  idle: (
    <StatusComponent
      title="Drag and drop your image here, or click to select"
      message="Max size 4MB"
    />
  ),
  loading: <StatusComponent title="Loading..." />,
  error: <StatusComponent title="Image is too big!" message="4MB max" />,
  unsupported: <StatusComponent title="Please provide a valid image" />,
  hover: <StatusComponent title="Drop it like it's hot! 🔥" />,
};

export { ImageUploadComponent };
