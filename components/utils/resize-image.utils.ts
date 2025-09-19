import {
  isWebGPUAvailable,
  resizeImageWithWebGPU,
  WebGPUImageResizeOptions,
} from './webgpu-image-resize.utils';

export type Format = "png" | "jpeg" | "svg";

interface ResizeImageOptions {
  img: HTMLImageElement;
  width?: number;
  height?: number;
  format?: Format;
  quality?: number;
  preserveAspectRatio?: boolean;
  useWebGPU?: boolean; // New option to control WebGPU usage
}

export async function resizeImage({
  img,
  format,
  height,
  preserveAspectRatio,
  quality,
  width,
  useWebGPU = true, // Default to WebGPU if available
}: ResizeImageOptions): Promise<string> {
  // Handle SVG format (no WebGPU needed)
  if (format === "svg") {
    return new Promise((resolve) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width || img.width}" height="${height || img.height}" viewBox="0 0 ${img.width} ${img.height}">
          <image href="${img.src}" width="${img.width}" height="${img.height}" />
        </svg>`;
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(svgBlob);
    });
  }

  // Try WebGPU first if available and requested
  if (useWebGPU && isWebGPUAvailable() && (format === 'png' || format === 'jpeg')) {
    try {
      const webgpuOptions: WebGPUImageResizeOptions = {
        width,
        height,
        preserveAspectRatio,
        quality,
        format: format as 'png' | 'jpeg',
      };
      
      return await resizeImageWithWebGPU(img, webgpuOptions);
    } catch (error) {
      console.warn('WebGPU resize failed, falling back to Canvas 2D:', error);
      // Fall through to Canvas 2D implementation
    }
  }

  // Fallback to Canvas 2D implementation
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context is not available"));
      return;
    }

    if (preserveAspectRatio) {
      const ratio = img.width / img.height;

      const dimensionMapper = {
        byWidth: () => {
          canvas.width = width!;
          canvas.height = width! / ratio;
        },
        byHeight: () => {
          canvas.height = height!;
          canvas.width = height! * ratio;
        },
        byDefault: () => {
          canvas.width = img.width;
          canvas.height = img.height;
        },
      };

      const key = width ? "byWidth" : height ? "byHeight" : "byDefault";
      dimensionMapper[key]();
    } else {
      canvas.width = width || img.width;
      canvas.height = height || img.height;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL(`image/${format}`, quality);
    resolve(dataURL);
  });
}

interface ProcessImageFileOptions {
  file: File;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setOutput: (output: string) => void;
  format: Format;
  quality: number;
  preserveAspectRatio: boolean;
  done?: () => void;
  useWebGPU?: boolean;
}

export const processImageFile = async ({
  file,
  format,
  preserveAspectRatio,
  quality,
  setHeight,
  setOutput,
  setWidth,
  done,
  useWebGPU = true,
}: ProcessImageFileOptions) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = async () => {
      setWidth(img.width);
      setHeight(img.height);
      try {
        const output = await resizeImage({
          img,
          width: img.width,
          height: img.height,
          format,
          quality,
          preserveAspectRatio,
          useWebGPU,
        });
        setOutput(output);
      } catch (error) {
        console.error('Image processing failed:', error);
      } finally {
        if (done) {
          done();
        }
      }
    };
  };
  reader.readAsDataURL(file);
};

interface UpdateWidthOptions {
  height: number;
  file: File;
  setWidth: (width: number) => void;
}

export const updateWidth = ({ file, height, setWidth }: UpdateWidthOptions) => {
  const img = new Image();
  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target?.result as string;
    img.onload = () => {
      const newWidth = Math.round(height * (img.width / img.height));
      setWidth(newWidth);
    };
  };
  reader.readAsDataURL(file);
};

interface UpdateWidthOption {
  width: number;
  file: File;
  setHeight: (height: number) => void;
}

export const updateHeight = ({ file, setHeight, width }: UpdateWidthOption) => {
  const img = new Image();
  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target?.result as string;
    img.onload = () => {
      const newHeight = Math.round(width / (img.width / img.height));
      setHeight(newHeight);
    };
  };
  reader.readAsDataURL(file);
};

interface HandleResizeImage {
  file: File;
  width: number | undefined;
  height: number | undefined;
  format: Format;
  quality: number;
  preserveAspectRatio: boolean;
  setOutput: (output: string) => void;
  useWebGPU?: boolean;
}

export const handleResizeImage = async ({
  file,
  format,
  height,
  preserveAspectRatio,
  quality,
  setOutput,
  width,
  useWebGPU = true,
}: HandleResizeImage) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = async () => {
      try {
        const output = await resizeImage({
          img,
          width,
          height,
          format,
          quality,
          preserveAspectRatio,
          useWebGPU,
        });
        setOutput(output);
      } catch (error) {
        console.error('Image resize failed:', error);
      }
    };
  };
  reader.readAsDataURL(file);
};
