interface ResizeImageOptions {
  img: HTMLImageElement;
  width?: number;
  height?: number;
  format?: "png" | "jpeg";
  quality?: number;
  maintainAspectRatio?: boolean;
}

export function resizeImage({
  img,
  format,
  height,
  maintainAspectRatio,
  quality,
  width,
}: ResizeImageOptions): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    if (maintainAspectRatio) {
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
