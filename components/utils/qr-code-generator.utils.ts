import QRCode from "qrcode";

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
  private options: QRCodeOptions;

  constructor(options: Partial<QRCodeOptions> = {}) {
    this.options = { ...DEFAULT_QR_OPTIONS, ...options };
  }

  update(newOptions: Partial<QRCodeOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  async append(element: HTMLElement): Promise<void> {
    try {
      // Clear previous content
      element.innerHTML = "";
      
      if (!this.options.text) {
        return;
      }

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(this.options.text, {
        width: this.options.width,
        margin: 2,
        color: {
          dark: this.options.dotsOptions.color,
          light: this.options.backgroundOptions.color,
        },
        errorCorrectionLevel: this.options.errorCorrectionLevel.toLowerCase() as 'low' | 'medium' | 'quartile' | 'high',
      });

      // Create img element and add to container
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      element.appendChild(img);

      // If there's a logo, overlay it
      if (this.options.image) {
        await this.addLogoOverlay(element, dataUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private async addLogoOverlay(container: HTMLElement, qrDataUrl: string): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = this.options.width;
      canvas.height = this.options.height;

      // Load QR code image
      const qrImg = new Image();
      qrImg.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);

        // Load and draw logo
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = Math.min(canvas.width, canvas.height) * this.options.imageOptions!.imageSize;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;

          // Draw white background for logo if hideBackgroundDots is true
          if (this.options.imageOptions!.hideBackgroundDots) {
            const margin = this.options.imageOptions!.margin;
            ctx.fillStyle = this.options.backgroundOptions.color;
            ctx.fillRect(
              logoX - margin,
              logoY - margin,
              logoSize + 2 * margin,
              logoSize + 2 * margin
            );
          }

          // Draw logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          // Replace QR code image with canvas
          const finalDataUrl = canvas.toDataURL('image/png');
          const img = container.querySelector('img');
          if (img) {
            img.src = finalDataUrl;
          }
        };
        logoImg.src = this.options.image!;
      };
      qrImg.src = qrDataUrl;
    } catch (error) {
      console.error('Error adding logo overlay:', error);
    }
  }

  async download(format: QRCodeFormat = "png"): Promise<void> {
    try {
      if (!this.options.text) return;

      let dataUrl: string;
      
      if (format === 'svg') {
        dataUrl = await QRCode.toString(this.options.text, {
          type: 'svg',
          width: this.options.width,
          margin: 2,
          color: {
            dark: this.options.dotsOptions.color,
            light: this.options.backgroundOptions.color,
          },
          errorCorrectionLevel: this.options.errorCorrectionLevel.toLowerCase() as 'low' | 'medium' | 'quartile' | 'high',
        });
        
        // Create blob and download
        const blob = new Blob([dataUrl], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        dataUrl = await QRCode.toDataURL(this.options.text, {
          width: this.options.width,
          margin: 2,
          color: {
            dark: this.options.dotsOptions.color,
            light: this.options.backgroundOptions.color,
          },
          errorCorrectionLevel: this.options.errorCorrectionLevel.toLowerCase() as 'low' | 'medium' | 'quartile' | 'high',
        });

        // If there's a logo, create canvas with logo overlay
        if (this.options.image) {
          dataUrl = await this.getCanvasWithLogo(dataUrl);
        }

        // Download the image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qr-code.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  }

  private async getCanvasWithLogo(qrDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      canvas.width = this.options.width;
      canvas.height = this.options.height;

      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);

        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = Math.min(canvas.width, canvas.height) * this.options.imageOptions!.imageSize;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;

          if (this.options.imageOptions!.hideBackgroundDots) {
            const margin = this.options.imageOptions!.margin;
            ctx.fillStyle = this.options.backgroundOptions.color;
            ctx.fillRect(
              logoX - margin,
              logoY - margin,
              logoSize + 2 * margin,
              logoSize + 2 * margin
            );
          }

          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => reject(new Error('Failed to load logo'));
        logoImg.src = this.options.image!;
      };
      qrImg.onerror = () => reject(new Error('Failed to load QR code'));
      qrImg.src = qrDataUrl;
    });
  }

  async getRawData(format: QRCodeFormat = "png"): Promise<Blob | string> {
    try {
      if (!this.options.text) throw new Error("No text provided");

      if (format === 'svg') {
        const svgString = await QRCode.toString(this.options.text, {
          type: 'svg',
          width: this.options.width,
          margin: 2,
          color: {
            dark: this.options.dotsOptions.color,
            light: this.options.backgroundOptions.color,
          },
          errorCorrectionLevel: this.options.errorCorrectionLevel.toLowerCase() as 'low' | 'medium' | 'quartile' | 'high',
        });
        return svgString;
      } else {
        const dataUrl = await QRCode.toDataURL(this.options.text, {
          width: this.options.width,
          margin: 2,
          color: {
            dark: this.options.dotsOptions.color,
            light: this.options.backgroundOptions.color,
          },
          errorCorrectionLevel: this.options.errorCorrectionLevel.toLowerCase() as 'low' | 'medium' | 'quartile' | 'high',
        });

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        return response.blob();
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