export function resizeImage(
  img: HTMLImageElement,
  width?: number,
  height?: number,
  format: "png" | "jpeg" = "png",
  quality: number = 1
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

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

    if (!ctx) {
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL(`image/${format}`, quality);
    resolve(dataURL);
  });
}
