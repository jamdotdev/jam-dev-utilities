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
  file: File;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setOutput: (output: string) => void;
  format: Format;
  quality: number;
  preserveAspectRatio: boolean;
  done?: () => void;
}

export const processImageFile = ({
  file,
  format,
  preserveAspectRatio,
  quality,
  setHeight,
  setOutput,
  setWidth,
  done,
}: ProcessImageFileOptions) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = () => {
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
}

export const handleResizeImage = ({
  file,
  format,
  height,
  preserveAspectRatio,
  quality,
  setOutput,
  width,
}: HandleResizeImage) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = () => {
      resizeImage({
        img,
        width,
        height,
        format,
        quality,
        preserveAspectRatio,
      }).then(setOutput);
    };
  };
  reader.readAsDataURL(file);
};
