"use client";
import { DragEvent, useCallback, useMemo, useRef, useState } from "react";
import UploadIcon from "@/components/icons/UploadIcon";

type Status = "idle" | "loading" | "error" | "unsupported" | "hover";

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFileSize?: number;
  multiple?: boolean;
  acceptedTypes?: string[];
  className?: string;
}

const FileUploadComponent = ({
  onFileSelect,
  maxFileSize = MAX_FILE_SIZE,
  multiple = false,
  acceptedTypes = ["image/*"],
  className = "",
}: FileUploadProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedMaxSize = useMemo((): string => {
    const sizeInMB = maxFileSize / (1024 * 1024);
    return Number.isInteger(sizeInMB)
      ? `${sizeInMB}MB`
      : `${sizeInMB.toFixed(2)}MB`;
  }, [maxFileSize]);

  const validateFiles = useCallback(
    (files: FileList | File[]): File[] => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        // Check file size
        if (file.size > maxFileSize) {
          errors.push(`${file.name} is too large (max ${formattedMaxSize})`);
          continue;
        }

        // Check file type if acceptedTypes is specified and not wildcard
        if (acceptedTypes.length > 0 && !acceptedTypes.includes("*/*")) {
          const isAccepted = acceptedTypes.some(type => {
            if (type.endsWith("/*")) {
              return file.type.startsWith(type.replace("/*", "/"));
            }
            return file.type === type;
          });

          if (!isAccepted) {
            errors.push(`${file.name} is not a supported format`);
            continue;
          }
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        setErrorMessage(errors.join(", "));
        setStatus("error");
        return [];
      }

      if (validFiles.length === 0) {
        setErrorMessage("No valid files selected");
        setStatus("unsupported");
        return [];
      }

      return validFiles;
    },
    [maxFileSize, formattedMaxSize, acceptedTypes]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setStatus("loading");
      setErrorMessage("");

      const files = validateFiles(event.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(files);
        setStatus("idle");
      }
    },
    [onFileSelect, validateFiles]
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
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const files = validateFiles(event.target.files);
    if (files.length > 0) {
      onFileSelect(files);
      setStatus("idle");
    }
  };

  const acceptString = acceptedTypes.join(",");

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`flex flex-col border border-dashed border-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted cursor-pointer mb-2 ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
      <UploadIcon />
      {statusComponents[status]({
        maxSize: formattedMaxSize,
        multiple,
        errorMessage,
        acceptedTypes,
      })}
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
    <p className="text-sm">{message || "\u00A0"}</p>
  </div>
);

interface StatusProps {
  maxSize: string;
  multiple: boolean;
  errorMessage: string;
  acceptedTypes: string[];
}

const getFileTypeDescription = (acceptedTypes: string[]): string => {
  if (acceptedTypes.includes("*/*")) {
    return "any file";
  }
  if (acceptedTypes.includes("image/*")) {
    return "image files";
  }
  return "supported files";
};

const statusComponents: Record<Status, (props: StatusProps) => JSX.Element> = {
  idle: ({ maxSize, multiple, acceptedTypes }) => (
    <StatusComponent
      title={`Drag and drop ${multiple ? "files" : "a file"} here, or click to select`}
      message={`${getFileTypeDescription(acceptedTypes)} • Max size ${maxSize} ${multiple ? "per file" : ""}`}
    />
  ),
  loading: () => <StatusComponent title="Loading..." />,
  error: ({ errorMessage }) => (
    <StatusComponent title="Error!" message={errorMessage} />
  ),
  unsupported: ({ errorMessage }) => (
    <StatusComponent title="Unsupported file!" message={errorMessage} />
  ),
  hover: ({ multiple }) => (
    <StatusComponent title={`Drop ${multiple ? "files" : "file"} here! 🔥`} />
  ),
};

export { FileUploadComponent };