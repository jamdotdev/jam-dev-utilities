// Dynamic import to handle SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let QRCodeStyling: any = null;

if (typeof window !== "undefined") {
  import("qr-code-styling").then((QRCodeStylingModule) => {
    QRCodeStyling = QRCodeStylingModule.default;
  });
}

export type QRCodeFormat = "png" | "svg" | "jpeg" | "webp";

export type QRCodeCornerSquareType = "square" | "extra-rounded" | "dot";
export type QRCodeCornerDotType = "square" | "dot";
export type QRCodeDotsType =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type QRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeOptions {
  text: string;
  width: number;
  height: number;
  format: QRCodeFormat;
  errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  dotsOptions: {
    color: string;
    type: QRCodeDotsType;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions?: {
    color: string;
    type: QRCodeCornerSquareType;
  };
  cornersDotOptions?: {
    color: string;
    type: QRCodeCornerDotType;
  };
  image?: string; // Base64 string or URL
  imageOptions?: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    crossOrigin: string;
  };
}

export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  text: "",
  width: 300,
  height: 300,
  format: "png",
  errorCorrectionLevel: "M",
  dotsOptions: {
    color: "#000000",
    type: "square",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  cornersSquareOptions: {
    color: "#000000",
    type: "square",
  },
  cornersDotOptions: {
    color: "#000000",
    type: "square",
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 8,
    crossOrigin: "anonymous",
  },
};

export class QRCodeGenerator {
  private options: QRCodeOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private qrCodeStyling: any = null;

  constructor(options: Partial<QRCodeOptions> = {}) {
    this.options = { ...DEFAULT_QR_OPTIONS, ...options };
  }

  private async initializeQRCodeStyling(): Promise<void> {
    if (!QRCodeStyling && typeof window !== "undefined") {
      const QRCodeStylingModule = await import("qr-code-styling");
      QRCodeStyling = QRCodeStylingModule.default;
    }

    if (QRCodeStyling && !this.qrCodeStyling) {
      this.qrCodeStyling = new QRCodeStyling({
        width: this.options.width,
        height: this.options.height,
        type: "svg",
        data: this.options.text || "https://jam.dev",
        image: this.options.image,
        dotsOptions: {
          color: this.options.dotsOptions.color,
          type: this.options.dotsOptions.type,
        },
        backgroundOptions: {
          color: this.options.backgroundOptions.color,
        },
        cornersSquareOptions: {
          color: this.options.cornersSquareOptions?.color,
          type: this.options.cornersSquareOptions?.type,
        },
        cornersDotOptions: {
          color: this.options.cornersDotOptions?.color,
          type: this.options.cornersDotOptions?.type,
        },
        imageOptions: {
          hideBackgroundDots: this.options.imageOptions?.hideBackgroundDots,
          imageSize: this.options.imageOptions?.imageSize,
          margin: this.options.imageOptions?.margin,
          crossOrigin: this.options.imageOptions?.crossOrigin,
        },
        qrOptions: {
          errorCorrectionLevel: this.options.errorCorrectionLevel,
        },
      });
    }
  }

  update(newOptions: Partial<QRCodeOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (this.qrCodeStyling) {
      this.qrCodeStyling.update({
        width: this.options.width,
        height: this.options.height,
        data: this.options.text || "https://jam.dev",
        image: this.options.image,
        dotsOptions: {
          color: this.options.dotsOptions.color,
          type: this.options.dotsOptions.type,
        },
        backgroundOptions: {
          color: this.options.backgroundOptions.color,
        },
        cornersSquareOptions: {
          color: this.options.cornersSquareOptions?.color,
          type: this.options.cornersSquareOptions?.type,
        },
        cornersDotOptions: {
          color: this.options.cornersDotOptions?.color,
          type: this.options.cornersDotOptions?.type,
        },
        imageOptions: {
          hideBackgroundDots: this.options.imageOptions?.hideBackgroundDots,
          imageSize: this.options.imageOptions?.imageSize,
          margin: this.options.imageOptions?.margin,
          crossOrigin: this.options.imageOptions?.crossOrigin,
        },
        qrOptions: {
          errorCorrectionLevel: this.options.errorCorrectionLevel,
        },
      });
    }
  }

  async append(element: HTMLElement): Promise<void> {
    try {
      await this.initializeQRCodeStyling();
      
      if (this.qrCodeStyling && element) {
        // Clear previous content
        element.innerHTML = "";
        
        if (!this.options.text) {
          return;
        }

        // Append the QR code to the element
        this.qrCodeStyling.append(element);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }

  async download(format: QRCodeFormat = "png"): Promise<void> {
    try {
      await this.initializeQRCodeStyling();
      
      if (this.qrCodeStyling) {
        await this.qrCodeStyling.download({
          name: "qr-code",
          extension: format,
        });
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  }

  async getRawData(format: QRCodeFormat = "png"): Promise<Blob | string> {
    try {
      await this.initializeQRCodeStyling();
      
      if (!this.qrCodeStyling) {
        throw new Error("QR code styling not initialized");
      }

      if (format === "svg") {
        return await this.qrCodeStyling.getRawData("svg");
      } else {
        return await this.qrCodeStyling.getRawData("png");
      }
    } catch (error) {
      throw new Error(`Failed to generate QR code data: ${error}`);
    }
  }

  async getDataURL(format: QRCodeFormat = "png"): Promise<string> {
    const rawData = await this.getRawData(format);

    if (typeof rawData === "string") {
      return rawData; // SVG returns string
    }

    // For other formats, convert Blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(rawData);
    });
  }
}

export const createQRCode = (
  options: Partial<QRCodeOptions> = {}
): QRCodeGenerator => {
  return new QRCodeGenerator(options);
};

export const validateQRCodeText = (text: string): boolean => {
  return text.trim().length > 0;
};

export const getQRCodeSizeInBytes = async (
  qrCode: QRCodeGenerator,
  format: QRCodeFormat = "png"
): Promise<number> => {
  const rawData = await qrCode.getRawData(format);

  if (typeof rawData === "string") {
    return new Blob([rawData]).size;
  }

  return rawData.size;
};

export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getErrorCorrectionLevels = () => [
  { value: "L" as const, label: "Low (~7%)", description: "Smallest QR code" },
  { value: "M" as const, label: "Medium (~15%)", description: "Balanced" },
  {
    value: "Q" as const,
    label: "Quartile (~25%)",
    description: "Good for noisy environments",
  },
  {
    value: "H" as const,
    label: "High (~30%)",
    description: "Best for logos and customization",
  },
];

export const getDotsTypeOptions = () => [
  { value: "square" as const, label: "Square" },
  { value: "rounded" as const, label: "Rounded" },
  { value: "dots" as const, label: "Dots" },
  { value: "classy" as const, label: "Classy" },
  { value: "classy-rounded" as const, label: "Classy Rounded" },
  { value: "extra-rounded" as const, label: "Extra Rounded" },
];

export const getCornerSquareTypeOptions = () => [
  { value: "square" as const, label: "Square" },
  { value: "extra-rounded" as const, label: "Extra Rounded" },
  { value: "dot" as const, label: "Dot" },
];

export const getCornerDotTypeOptions = () => [
  { value: "square" as const, label: "Square" },
  { value: "dot" as const, label: "Dot" },
];
