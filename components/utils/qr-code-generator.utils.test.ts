import {
  QRCodeGenerator,
  createQRCode,
  validateQRCodeText,
  validateImageFile,
  imageToBase64,
  DEFAULT_QR_OPTIONS,
  getErrorCorrectionLevels,
  getDotsTypeOptions,
  getCornerSquareTypeOptions,
  getCornerDotTypeOptions,
} from "./qr-code-generator.utils";

// Mock the QRCodeStyling library
jest.mock("qr-code-styling", () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    append: jest.fn(),
    download: jest.fn(),
    getRawData: jest.fn().mockResolvedValue(new Blob(["test"], { type: "image/png" })),
    _options: {
      qrOptions: {
        errorCorrectionLevel: "M",
      },
    },
  }));
});

describe("QR Code Generator Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateQRCodeText", () => {
    it("should return true for valid text", () => {
      expect(validateQRCodeText("Hello World")).toBe(true);
      expect(validateQRCodeText("https://example.com")).toBe(true);
      expect(validateQRCodeText("12345")).toBe(true);
    });

    it("should return false for empty or whitespace-only text", () => {
      expect(validateQRCodeText("")).toBe(false);
      expect(validateQRCodeText("   ")).toBe(false);
      expect(validateQRCodeText("\t\n")).toBe(false);
    });
  });

  describe("validateImageFile", () => {
    it("should return true for valid image files", () => {
      const validFile1 = new File(["test"], "test.png", { type: "image/png" });
      const validFile2 = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const validFile3 = new File(["test"], "test.gif", { type: "image/gif" });
      
      expect(validateImageFile(validFile1)).toBe(true);
      expect(validateImageFile(validFile2)).toBe(true);
      expect(validateImageFile(validFile3)).toBe(true);
    });

    it("should return false for invalid file types", () => {
      const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });
      expect(validateImageFile(invalidFile)).toBe(false);
    });

    it("should return false for files that are too large", () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.png", { 
        type: "image/png" 
      });
      expect(validateImageFile(largeFile)).toBe(false);
    });
  });

  describe("imageToBase64", () => {
    it("should convert file to base64", async () => {
      const file = new File(["test content"], "test.png", { type: "image/png" });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: "data:image/png;base64,dGVzdCBjb250ZW50",
        onload: null as unknown,
        onerror: null as unknown,
      };

      (global as unknown).FileReader = jest.fn(() => mockFileReader);

      const promise = imageToBase64(file);
      
      // Trigger the onload event
      mockFileReader.onload();
      
      const result = await promise;
      expect(result).toBe("data:image/png;base64,dGVzdCBjb250ZW50");
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });
  });

  describe("createQRCode", () => {
    it("should create a QRCodeGenerator instance with default options", () => {
      const qrCode = createQRCode();
      expect(qrCode).toBeInstanceOf(QRCodeGenerator);
    });

    it("should create a QRCodeGenerator instance with custom options", () => {
      const options = {
        text: "Test QR Code",
        width: 400,
        height: 400,
      };
      const qrCode = createQRCode(options);
      expect(qrCode).toBeInstanceOf(QRCodeGenerator);
    });
  });

  describe("QRCodeGenerator", () => {
    let qrGenerator: QRCodeGenerator;

    beforeEach(() => {
      qrGenerator = new QRCodeGenerator();
    });

    it("should initialize with default options", () => {
      expect(qrGenerator).toBeInstanceOf(QRCodeGenerator);
    });

    it("should update QR code options", () => {
      const updateSpy = jest.spyOn(qrGenerator["qrCode"], "update");
      
      qrGenerator.update({
        text: "Updated text",
        width: 500,
      });

      expect(updateSpy).toHaveBeenCalledWith({
        data: "Updated text",
        width: 500,
      });
    });

    it("should append to DOM element", () => {
      const element = document.createElement("div");
      const appendSpy = jest.spyOn(qrGenerator["qrCode"], "append");
      
      qrGenerator.append(element);
      
      expect(appendSpy).toHaveBeenCalledWith(element);
    });

    it("should download QR code", async () => {
      const downloadSpy = jest.spyOn(qrGenerator["qrCode"], "download");
      downloadSpy.mockResolvedValue(undefined);
      
      await qrGenerator.download("png");
      
      expect(downloadSpy).toHaveBeenCalledWith({
        name: "qr-code",
        extension: "png",
      });
    });

    it("should get data URL for image formats", async () => {
      const blob = new Blob(["test"], { type: "image/png" });
      jest.spyOn(qrGenerator["qrCode"], "getRawData").mockResolvedValue(blob);
      
      // Mock FileReader for data URL conversion
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: "data:image/png;base64,dGVzdA==",
        onload: null as unknown,
        onerror: null as unknown,
      };
      (global as unknown).FileReader = jest.fn(() => mockFileReader);

      const promise = qrGenerator.getDataURL("png");
      
      // Trigger the onload event
      setTimeout(() => mockFileReader.onload(), 0);
      
      const result = await promise;
      expect(result).toBe("data:image/png;base64,dGVzdA==");
    });

    it("should get data URL for SVG format", async () => {
      const svgString = "<svg>test</svg>";
      jest.spyOn(qrGenerator["qrCode"], "getRawData").mockResolvedValue(svgString);
      
      const result = await qrGenerator.getDataURL("svg");
      expect(result).toBe(svgString);
    });
  });

  describe("Option getters", () => {
    it("should return error correction levels", () => {
      const levels = getErrorCorrectionLevels();
      expect(levels).toHaveLength(4);
      expect(levels[0]).toEqual({
        value: "L",
        label: "Low (~7%)",
        description: "Smallest QR code"
      });
    });

    it("should return dots type options", () => {
      const types = getDotsTypeOptions();
      expect(types).toHaveLength(6);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square"
      });
    });

    it("should return corner square type options", () => {
      const types = getCornerSquareTypeOptions();
      expect(types).toHaveLength(3);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square"
      });
    });

    it("should return corner dot type options", () => {
      const types = getCornerDotTypeOptions();
      expect(types).toHaveLength(2);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square"
      });
    });
  });

  describe("DEFAULT_QR_OPTIONS", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_QR_OPTIONS.text).toBe("");
      expect(DEFAULT_QR_OPTIONS.width).toBe(300);
      expect(DEFAULT_QR_OPTIONS.height).toBe(300);
      expect(DEFAULT_QR_OPTIONS.format).toBe("png");
      expect(DEFAULT_QR_OPTIONS.errorCorrectionLevel).toBe("M");
      expect(DEFAULT_QR_OPTIONS.dotsOptions.color).toBe("#000000");
      expect(DEFAULT_QR_OPTIONS.dotsOptions.type).toBe("square");
      expect(DEFAULT_QR_OPTIONS.backgroundOptions.color).toBe("#ffffff");
    });
  });
});