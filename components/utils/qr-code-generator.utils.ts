import QRCodeStyling from "qr-code-styling";

export type QRCodeFormat = "png" | "svg" | "jpeg" | "webp";

export type QRCodeCornerSquareType = "square" | "extra-rounded" | "dot";
export type QRCodeCornerDotType = "square" | "dot";
export type QRCodeDotsType = "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

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
  private qrCode: QRCodeStyling;

  constructor(options: Partial<QRCodeOptions> = {}) {
    const fullOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    this.qrCode = new QRCodeStyling({
      width: fullOptions.width,
      height: fullOptions.height,
      type: "svg",
      data: fullOptions.text,
      image: fullOptions.image,
      dotsOptions: fullOptions.dotsOptions,
      backgroundOptions: fullOptions.backgroundOptions,
      cornersSquareOptions: fullOptions.cornersSquareOptions,
      cornersDotOptions: fullOptions.cornersDotOptions,
      imageOptions: fullOptions.imageOptions,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: fullOptions.errorCorrectionLevel,
      },
    });
  }

  update(options: Partial<QRCodeOptions>): void {
    const updateOptions: Record<string, unknown> = {};

    if (options.text !== undefined) {
      updateOptions.data = options.text;
    }
    if (options.width !== undefined) {
      updateOptions.width = options.width;
    }
    if (options.height !== undefined) {
      updateOptions.height = options.height;
    }
    if (options.image !== undefined) {
      updateOptions.image = options.image;
    }
    if (options.dotsOptions) {
      updateOptions.dotsOptions = options.dotsOptions;
    }
    if (options.backgroundOptions) {
      updateOptions.backgroundOptions = options.backgroundOptions;
    }
    if (options.cornersSquareOptions) {
      updateOptions.cornersSquareOptions = options.cornersSquareOptions;
    }
    if (options.cornersDotOptions) {
      updateOptions.cornersDotOptions = options.cornersDotOptions;
    }
    if (options.imageOptions) {
      updateOptions.imageOptions = options.imageOptions;
    }
    if (options.errorCorrectionLevel) {
      updateOptions.qrOptions = {
        ...this.qrCode._options.qrOptions,
        errorCorrectionLevel: options.errorCorrectionLevel,
      };
    }

    this.qrCode.update(updateOptions);
  }

  append(element: HTMLElement): void {
    this.qrCode.append(element);
  }

  async download(format: QRCodeFormat = "png"): Promise<void> {
    return this.qrCode.download({
      name: `qr-code`,
      extension: format,
    });
  }

  async getRawData(format: QRCodeFormat = "png"): Promise<Blob | string> {
    const rawData = await this.qrCode.getRawData(format);
    if (rawData === null) {
      throw new Error("Failed to generate QR code data");
    }
    
    // Handle Buffer type from Node.js environments
    if (typeof Buffer !== 'undefined' && rawData instanceof Buffer) {
      return new Blob([rawData]);
    }
    
    return rawData as Blob | string;
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

export const createQRCode = (options: Partial<QRCodeOptions> = {}): QRCodeGenerator => {
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
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const getErrorCorrectionLevels = () => [
  { value: "L" as const, label: "Low (~7%)", description: "Smallest QR code" },
  { value: "M" as const, label: "Medium (~15%)", description: "Balanced" },
  { value: "Q" as const, label: "Quartile (~25%)", description: "Good for noisy environments" },
  { value: "H" as const, label: "High (~30%)", description: "Best for logos and customization" },
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