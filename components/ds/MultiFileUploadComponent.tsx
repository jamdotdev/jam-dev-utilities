"use client";
import { DragEvent, useCallback, useMemo, useRef, useState } from "react";
import UploadIcon from "@/components/icons/UploadIcon";

type Status = "idle" | "loading" | "error" | "unsupported" | "hover";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFileSize?: number;
  multiple?: boolean;
  acceptedTypes?: string[];
}

const MultiFileUploadComponent = ({
  onFilesSelect,
  maxFileSize = MAX_FILE_SIZE,
  multiple = true,
  acceptedTypes = ["image/*"],
}: MultiFileUploadProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedMaxSize = useMemo((): string => {
    const sizeInMB = maxFileSize / (1024 * 1024);
    return Number.isInteger(sizeInMB)
      ? `${sizeInMB}MB`
      : `${sizeInMB.toFixed(2)}MB`;
  }, [maxFileSize]);

  const isFileValid = useCallback((file: File): boolean => {
    // Check file type
    const typeValid = acceptedTypes.some(type => {
      if (type.endsWith("/*")) {
        const baseType = type.replace("/*", "");
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    // Check file size
    const sizeValid = file.size <= maxFileSize;

    return typeValid && sizeValid;
  }, [acceptedTypes, maxFileSize]);

  const validateFiles = useCallback((files: FileList): { valid: File[], invalid: boolean } => {
    const validFiles: File[] = [];
    let hasInvalid = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (isFileValid(file)) {
        validFiles.push(file);
      } else {
        hasInvalid = true;
      }
    }

    return { valid: validFiles, invalid: hasInvalid };
  }, [isFileValid]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const files = event.dataTransfer.files;
      if (!files.length) {
        setStatus("unsupported");
        return;
      }

      const { valid, invalid } = validateFiles(files);
      
      if (valid.length === 0) {
        setStatus(invalid ? "error" : "unsupported");
        return;
      }

      if (invalid) {
        setStatus("error");
        // Still process valid files
      } else {
        setStatus("loading");
      }

      onFilesSelect(valid);
      setStatus("idle");
    },
    [onFilesSelect, validateFiles]
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const { valid, invalid } = validateFiles(files);
      
      if (valid.length === 0) {
        setStatus(invalid ? "error" : "unsupported");
        return;
      }

      if (invalid) {
        setStatus("error");
        // Still process valid files
      } else {
        setStatus("loading");
      }

      onFilesSelect(valid);
      setStatus("idle");
    }
  };

  const acceptAttribute = acceptedTypes.join(",");
  const fileTypeText = multiple ? "images" : "image";

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
        accept={acceptAttribute}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
      <UploadIcon />
      {statusComponents[status](formattedMaxSize, fileTypeText, multiple)}
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

const statusComponents: Record<Status, (maxSize: string, fileType: string, multiple: boolean) => JSX.Element> = {
  idle: (maxSize, fileType, multiple) => (
    <StatusComponent
      title={`Drag and drop your ${fileType} here, or click to select`}
      message={`Max size ${maxSize}${multiple ? " per file" : ""}`}
    />
  ),
  loading: () => <StatusComponent title="Loading..." />,
  error: (maxSize, fileType, multiple) => (
    <StatusComponent 
      title={`Some files are too big or invalid!`} 
      message={`${maxSize} max per ${fileType.slice(0, -1)}${multiple ? ", valid files will still be processed" : ""}`} 
    />
  ),
  unsupported: (_, fileType) => <StatusComponent title={`Please provide valid ${fileType}`} />,
  hover: () => <StatusComponent title="Drop it like it's hot! 🔥" />,
};

export { MultiFileUploadComponent };