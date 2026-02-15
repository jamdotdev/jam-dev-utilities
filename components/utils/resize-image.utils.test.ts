import {
  calculateCropDimensions,
  handleResizeImage,
  isPointInCropRect,
  processImageFile,
  resizeImage,
  updateHeight,
  updateWidth,
} from "./resize-image.utils";

describe("Image Processing Functions", () => {
  let canvasMock: HTMLCanvasElement;
  let ctxMock: CanvasRenderingContext2D;
  let imgMock: HTMLImageElement;

  beforeEach(() => {
    canvasMock = document.createElement("canvas");
    ctxMock = {
      drawImage: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    jest.spyOn(document, "createElement").mockReturnValue(canvasMock);
    jest.spyOn(canvasMock, "getContext").mockReturnValue(ctxMock);
    jest
      .spyOn(canvasMock, "toBlob")
      .mockImplementation((callback: BlobCallback) => {
        callback(new Blob(["MOCK_DATA"], { type: "image/png" }));
      });
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: jest.fn(() => "blob:mock-url"),
    });

    jest.spyOn(window, "FileReader").mockImplementation(
      () =>
        ({
          readAsDataURL: jest.fn(function () {
            this.onload?.({
              target: { result: "data:image/png;base64,MOCK_DATA" },
            } as ProgressEvent<FileReader>);
          }),
        }) as unknown as FileReader
    );

    imgMock = {
      width: 1000,
      height: 500,
      onload: null as ((ev: Event) => void) | null,
      set src(_url: string) {
        setTimeout(() => {
          if (this.onload) {
            this.onload(new Event("load"));
          }
        }, 0);
      },
    } as HTMLImageElement;

    jest.spyOn(window, "Image").mockImplementation(() => imgMock);
  });

  it("should resize the image maintaining aspect ratio by width", async () => {
    const img = { width: 1000, height: 500 } as HTMLImageElement;

    const result = await resizeImage({
      img,
      width: 500,
      preserveAspectRatio: true,
      format: "png",
      quality: 1,
    });

    expect(result).toMatch(/^blob:/);
    expect(ctxMock.drawImage).toHaveBeenCalledWith(img, 0, 0, 500, 250);
  });

  it("should resize the image maintaining aspect ratio by height", async () => {
    const img = { width: 1000, height: 500 } as HTMLImageElement;

    const result = await resizeImage({
      img,
      height: 250,
      preserveAspectRatio: true,
      format: "jpeg",
      quality: 0.8,
    });

    expect(result).toMatch(/^blob:/);
    expect(ctxMock.drawImage).toHaveBeenCalledWith(img, 0, 0, 500, 250);
  });

  it("should reject if canvas context is not available", async () => {
    jest.spyOn(canvasMock, "getContext").mockReturnValueOnce(null);

    const img = { width: 1000, height: 500 } as HTMLImageElement;

    await expect(resizeImage({ img, format: "png" })).rejects.toThrow(
      "Canvas context is not available"
    );
  });

  it("should process the image file and set width, height, and output", (done) => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setWidth = jest.fn();
    const setHeight = jest.fn();
    const setOutput = jest.fn();

    processImageFile({
      source: mockFile,
      format: "jpeg",
      preserveAspectRatio: true,
      quality: 0.8,
      setWidth,
      setHeight,
      setOutput,
      done: () => {
        expect(setWidth).toHaveBeenCalledWith(1000);
        expect(setHeight).toHaveBeenCalledWith(500);
        expect(setOutput).toHaveBeenCalledWith(expect.stringMatching(/^blob:/));
        done();
      },
    });
  });

  it("should update the width based on the provided height and image aspect ratio", (done) => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setWidth = jest.fn();

    updateWidth({ source: mockFile, height: 200, setWidth });

    setTimeout(() => {
      expect(setWidth).toHaveBeenCalledWith(400);
      done();
    }, 0);
  });

  it("should update the height based on the provided width and image aspect ratio", (done) => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setHeight = jest.fn();

    updateHeight({ source: mockFile, width: 300, setHeight });

    setTimeout(() => {
      expect(setHeight).toHaveBeenCalledWith(150);
      done();
    }, 0);
  });

  it("should resize the image and set the output", (done) => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setOutput = jest.fn();

    handleResizeImage({
      source: mockFile,
      format: "jpeg",
      height: 400,
      width: 600,
      preserveAspectRatio: true,
      quality: 0.8,
      setOutput,
    });

    setTimeout(() => {
      expect(setOutput).toHaveBeenCalledWith(expect.stringMatching(/^blob:/));
      done();
    }, 0);
  });

  it("should calculate the crop dimensions correctly", () => {
    const imgMock = {
      naturalWidth: 1000,
      naturalHeight: 500,
      width: 1000,
      height: 500,
    } as HTMLImageElement;

    const currentImageRefMock = {
      clientWidth: 500,
      clientHeight: 250,
      getBoundingClientRect: jest.fn(() => ({
        width: 500,
        height: 250,
      })),
    } as unknown as HTMLImageElement;

    const cropRect = { x: 50, y: 50, width: 100, height: 50 };

    const result = calculateCropDimensions(
      imgMock,
      currentImageRefMock,
      cropRect
    );

    expect(result).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    });
  });

  it("should handle negative width and height values in cropRect", () => {
    const imgMock = {
      naturalWidth: 1000,
      naturalHeight: 500,
      width: 1000,
      height: 500,
    } as HTMLImageElement;

    const currentImageRefMock = {
      clientWidth: 500,
      clientHeight: 250,
      getBoundingClientRect: jest.fn(() => ({
        width: 500,
        height: 250,
      })),
    } as unknown as HTMLImageElement;

    const cropRect = { x: 150, y: 150, width: -100, height: -50 };

    const result = calculateCropDimensions(
      imgMock,
      currentImageRefMock,
      cropRect
    );

    expect(result).toEqual({
      x: 100,
      y: 200,
      width: 200,
      height: 100,
    });
  });

  it("should clamp crop dimensions to image boundaries", () => {
    const imgMock = {
      naturalWidth: 1000,
      naturalHeight: 500,
      width: 1000,
      height: 500,
    } as HTMLImageElement;

    const currentImageRefMock = {
      clientWidth: 500,
      clientHeight: 250,
      getBoundingClientRect: jest.fn(() => ({
        width: 500,
        height: 250,
      })),
    } as unknown as HTMLImageElement;

    const cropRect = { x: -10, y: -20, width: 600, height: 400 };

    const result = calculateCropDimensions(
      imgMock,
      currentImageRefMock,
      cropRect
    );

    expect(result).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 500,
    });
  });

  const cropRect = { x: 50, y: 50, width: 100, height: 50 };

  it("should return true for a point inside the crop rectangle", () => {
    const result = isPointInCropRect(75, 75, cropRect);
    expect(result).toBe(true);
  });

  it("should return false for a point outside the crop rectangle", () => {
    const result = isPointInCropRect(200, 200, cropRect);
    expect(result).toBe(false);
  });

  it("should handle negative width and height in crop rectangle", () => {
    const cropRectNegative = { x: 150, y: 150, width: -100, height: -50 };
    const result = isPointInCropRect(75, 75, cropRectNegative);
    expect(result).toBe(false);

    const resultInside = isPointInCropRect(125, 125, cropRectNegative);
    expect(resultInside).toBe(true);
  });
});
