import {
  handleResizeImage,
  processImageFile,
  resizeImage,
  updateHeight,
  updateWidth,
} from "./resize-image.utils";

// Mock WebGPU utilities
jest.mock('./webgpu-image-resize.utils', () => ({
  initWebGPU: jest.fn().mockResolvedValue(null),
  isWebGPUAvailable: jest.fn().mockReturnValue(false),
  resizeImageWithWebGPU: jest.fn(),
  measureWebGPUPerformance: jest.fn(),
  batchResizeImagesWithWebGPU: jest.fn(),
  cleanupWebGPU: jest.fn(),
}));

describe("Image Processing Functions", () => {
  let canvasMock: HTMLCanvasElement;
  let ctxMock: CanvasRenderingContext2D;
  let imgMock: HTMLImageElement;

  beforeEach(() => {
    canvasMock = document.createElement("canvas");
    ctxMock = {
      drawImage: jest.fn(),
      toDataURL: jest.fn().mockReturnValue("data:image/png;base64,MOCK_DATA"),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    } as unknown as CanvasRenderingContext2D;

    jest.spyOn(document, "createElement").mockReturnValue(canvasMock);
    jest.spyOn(canvasMock, "getContext").mockReturnValue(ctxMock);

    // Mock FileReader for all tests
    jest.spyOn(window, "FileReader").mockImplementation(
      () =>
        ({
          readAsDataURL: jest.fn(function (blob) {
            // Handle different file types based on the blob type
            setTimeout(() => {
              if (this.onload) {
                const isForSvgBlob = blob && blob.type === "image/svg+xml";
                const result = isForSvgBlob 
                  ? "data:image/svg+xml;base64,MOCK_SVG_DATA" 
                  : "data:image/png;base64,MOCK_DATA";
                
                this.onload({
                  target: { result },
                } as ProgressEvent<FileReader>);
              }
            }, 0);
          }),
          result: null,
          onload: null,
        }) as unknown as FileReader
    );

    // Mock Blob for SVG handling
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      type: options?.type || 'application/octet-stream',
      content,
    })) as any;

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

    expect(result).toMatch(/^data:image\/png;base64,/);
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

    expect(result).toMatch(/^data:image\/jpeg;base64,/);
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
      file: mockFile,
      format: "jpeg",
      preserveAspectRatio: true,
      quality: 0.8,
      setWidth,
      setHeight,
      setOutput,
      done: () => {
        expect(setWidth).toHaveBeenCalledWith(1000);
        expect(setHeight).toHaveBeenCalledWith(500);
        expect(setOutput).toHaveBeenCalledWith(
          expect.stringMatching(/^data:image\/jpeg;base64,/)
        );
        done();
      },
    });
  });

  it("should update the width based on the provided height and image aspect ratio", (done) => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setWidth = jest.fn();

    updateWidth({ file: mockFile, height: 200, setWidth });

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

    updateHeight({ file: mockFile, width: 300, setHeight });

    setTimeout(() => {
      expect(setHeight).toHaveBeenCalledWith(150);
      done();
    }, 0);
  });

  it("should resize the image and set the output", async () => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setOutput = jest.fn();

    await handleResizeImage({
      file: mockFile,
      format: "jpeg",
      height: 400,
      width: 600,
      preserveAspectRatio: true,
      quality: 0.8,
      setOutput,
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(setOutput).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/jpeg;base64,/)
    );
  });

  it("should process image file with WebGPU disabled", async () => {
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    const setWidth = jest.fn();
    const setHeight = jest.fn();
    const setOutput = jest.fn();
    const done = jest.fn();

    await processImageFile({
      file: mockFile,
      format: "png",
      preserveAspectRatio: false,
      quality: 1,
      setWidth,
      setHeight,
      setOutput,
      done,
      useWebGPU: false,
    });

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(setWidth).toHaveBeenCalledWith(1000);
    expect(setHeight).toHaveBeenCalledWith(500);
    expect(setOutput).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/)
    );
    expect(done).toHaveBeenCalled();
  });

  it("should handle SVG format correctly", async () => {
    const img = { width: 1000, height: 500, src: "test.svg" } as HTMLImageElement;

    const result = await resizeImage({
      img,
      width: 500,
      height: 250,
      format: "svg",
      useWebGPU: false,
    });

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
