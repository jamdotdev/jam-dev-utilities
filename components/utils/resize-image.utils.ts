export type Format = "png" | "jpeg" | "svg";
interface ResizeImageOptions {
  img: HTMLImageElement;
  width?: number;
  height?: number;
  format?: Format;
  quality?: number;
  preserveAspectRatio?: boolean;
}

export function resizeImage({
  img,
  format,
  height,
  preserveAspectRatio,
  quality,
  width,
}: ResizeImageOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    if (format === "svg") {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width || img.width}" height="${height || img.height}" viewBox="0 0 ${img.width} ${img.height}">
          <image href="${img.src}" width="${img.width}" height="${img.height}" />
        </svg>`;
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(svgBlob);
      return;
    }

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
  source: File;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setOutput: (output: string) => void;
  format: Format;
  quality: number;
  preserveAspectRatio: boolean;
  done?: () => void;
}

export const processImageFile = ({
  source,
  format,
  preserveAspectRatio,
  quality,
  setHeight,
  setOutput,
  setWidth,
  done,
}: ProcessImageFileOptions) => {
  const img = new Image();
  const handleLoad = () => {
    setWidth(img.width);
    setHeight(img.height);
    resizeImage({
      img,
      width: img.width,
      height: img.height,
      format,
      quality,
      preserveAspectRatio,
    })
      .then(setOutput)
      .catch((error) => console.error(error))
      .finally(() => {
        if (done) {
          done();
        }
      });
  };

  if (typeof source === "string") {
    img.src = source;
    img.onload = handleLoad;
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = handleLoad;
    };
    reader.readAsDataURL(source);
  }
};

interface UpdateWidthOptions {
  height: number;
  source: File | string;
  setWidth: (width: number) => void;
}

export const updateWidth = ({
  source,
  height,
  setWidth,
}: UpdateWidthOptions) => {
  const img = new Image();

  const handleLoad = () => {
    const newWidth = Math.round(height * (img.width / img.height));
    setWidth(newWidth);
  };

  if (typeof source === "string") {
    img.src = source;
    img.onload = handleLoad;
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = handleLoad;
    };
    reader.readAsDataURL(source);
  }
};

interface UpdateHeightOptions {
  width: number;
  source: File | string;
  setHeight: (height: number) => void;
}

export const updateHeight = ({
  source,
  setHeight,
  width,
}: UpdateHeightOptions) => {
  const img = new Image();

  const handleLoad = () => {
    const newHeight = Math.round(width / (img.width / img.height));
    setHeight(newHeight);
  };

  if (typeof source === "string") {
    img.src = source;
    img.onload = handleLoad;
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = handleLoad;
    };
    reader.readAsDataURL(source);
  }
};

interface HandleResizeImage {
  source: File | string;
  width: number | undefined;
  height: number | undefined;
  format: Format;
  quality: number;
  preserveAspectRatio: boolean;
  setOutput: (output: string) => void;
}

export const handleResizeImage = ({
  source,
  format,
  height,
  preserveAspectRatio,
  quality,
  setOutput,
  width,
}: HandleResizeImage) => {
  const img = new Image();
  const handleLoad = () => {
    resizeImage({
      img,
      width,
      height,
      format,
      quality,
      preserveAspectRatio,
    }).then(setOutput);
  };

  if (typeof source === "string") {
    img.src = source;
    img.onload = handleLoad;
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = handleLoad;
    };
    reader.readAsDataURL(source);
  }
};

interface CropDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateCropDimensions(
  img: HTMLImageElement,
  currentImageRef: HTMLImageElement,
  cropRect: { x: number; y: number; width: number; height: number }
): CropDimensions {
  const scaleX = img.width / currentImageRef.clientWidth;
  const scaleY = img.height / currentImageRef.clientHeight;

  const x = Math.min(cropRect.x, cropRect.x + cropRect.width) * scaleX;
  const y = Math.min(cropRect.y, cropRect.y + cropRect.height) * scaleY;
  const width = Math.abs(cropRect.width) * scaleX;
  const height = Math.abs(cropRect.height) * scaleY;

  return { x, y, width, height };
}
interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isPointInCropRect(
  x: number,
  y: number,
  cropRect: CropRect
): boolean {
  const rectLeft = Math.min(cropRect.x, cropRect.x + cropRect.width);
  const rectTop = Math.min(cropRect.y, cropRect.y + cropRect.height);
  const rectRight = rectLeft + Math.abs(cropRect.width);
  const rectBottom = rectTop + Math.abs(cropRect.height);
  return x >= rectLeft && x <= rectRight && y >= rectTop && y <= rectBottom;
}
