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
import * as QRCode from "qrcode";

// Mock the qrcode library
jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,test"),
  toString: jest.fn().mockResolvedValue("<svg>test</svg>"),
}));

const mockedQRCode = QRCode as jest.Mocked<typeof QRCode>;

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
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });
      expect(validateImageFile(invalidFile)).toBe(false);
    });

    it("should return false for files that are too large", () => {
      const largeFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)],
        "large.png",
        {
          type: "image/png",
        }
      );
      expect(validateImageFile(largeFile)).toBe(false);
    });
  });

  describe("imageToBase64", () => {
    it("should convert file to base64", async () => {
      const file = new File(["test content"], "test.png", {
        type: "image/png",
      });

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
    let mockElement: HTMLElement;

    beforeEach(() => {
      qrGenerator = new QRCodeGenerator();
      mockElement = document.createElement("div");
      // Mock Image constructor for tests
      global.Image = jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: "",
        width: 0,
        height: 0,
      }));
    });

    it("should initialize with default options", () => {
      expect(qrGenerator).toBeInstanceOf(QRCodeGenerator);
    });

    it("should update QR code options", () => {
      qrGenerator.update({
        text: "Updated text",
        width: 500,
      });

      // The update method just updates internal options
      expect(qrGenerator).toBeInstanceOf(QRCodeGenerator);
    });

    it("should append to DOM element", async () => {
      qrGenerator.update({ text: "test" }); // Add text so QR code is generated
      await qrGenerator.append(mockElement);

      expect(mockedQRCode.toDataURL).toHaveBeenCalled();
      expect(mockElement.children.length).toBeGreaterThan(0);
    });

    it("should download QR code", async () => {
      // Mock createElement and click
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);

      qrGenerator.update({ text: "test" });
      await qrGenerator.download("png");

      expect(mockedQRCode.toDataURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });

    it("should get raw data for PNG format", async () => {
      // Mock fetch for blob conversion
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["test"], { type: "image/png" })),
      });

      qrGenerator.update({ text: "test" });
      const result = await qrGenerator.getRawData("png");

      expect(mockedQRCode.toDataURL).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it("should get raw data for SVG format", async () => {
      qrGenerator.update({ text: "test" });
      const result = await qrGenerator.getRawData("svg");

      expect(mockedQRCode.toString).toHaveBeenCalled();
      expect(result).toBe("<svg>test</svg>");
    });

    it("should handle errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      qrGenerator.update({ text: "" }); // Empty text
      await qrGenerator.append(mockElement);

      // Should not throw, just handle gracefully
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Option getters", () => {
    it("should return error correction levels", () => {
      const levels = getErrorCorrectionLevels();
      expect(levels).toHaveLength(4);
      expect(levels[0]).toEqual({
        value: "L",
        label: "Low (~7%)",
        description: "Smallest QR code",
      });
    });

    it("should return dots type options", () => {
      const types = getDotsTypeOptions();
      expect(types).toHaveLength(6);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square",
      });
    });

    it("should return corner square type options", () => {
      const types = getCornerSquareTypeOptions();
      expect(types).toHaveLength(3);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square",
      });
    });

    it("should return corner dot type options", () => {
      const types = getCornerDotTypeOptions();
      expect(types).toHaveLength(2);
      expect(types[0]).toEqual({
        value: "square",
        label: "Square",
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
