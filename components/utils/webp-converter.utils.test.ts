import {
  formatFileSize,
  calculateCompressionRatio,
  getSupportedImageFormats,
  canConvertToWebp,
} from './webp-converter.utils';

// Mock Canvas API for testing
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })),
  toBlob: jest.fn((callback) => {
    const mockBlob = new Blob(['mock blob data'], { type: 'image/webp' });
    callback(mockBlob);
  }),
  width: 100,
  height: 100,
};

const mockImage = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  width: 100,
  height: 100,
};

// Mock DOM APIs
global.document = {
  ...global.document,
  createElement: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: jest.fn(),
      };
    }
    return {};
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
} as Document;

Object.defineProperty(global, 'Image', {
  value: function() {
    return mockImage;
  },
});

Object.defineProperty(global, 'FileReader', {
  value: function() {
    return {
      readAsDataURL: jest.fn(function(this: FileReader) {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/png;base64,fake-data' } } as ProgressEvent<FileReader>);
        }
      }),
      result: 'data:image/png;base64,fake-data',
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
    };
  },
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

describe('webp-converter.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2560)).toBe('2.5 KB');
    });
  });

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      expect(calculateCompressionRatio(1000, 800)).toBe(20);
      expect(calculateCompressionRatio(1000, 500)).toBe(50);
      expect(calculateCompressionRatio(1000, 0)).toBe(100);
      expect(calculateCompressionRatio(1000, 1200)).toBe(-20);
    });

    it('should handle zero original size', () => {
      expect(calculateCompressionRatio(0, 100)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateCompressionRatio(1000, 666)).toBe(33);
      expect(calculateCompressionRatio(1000, 667)).toBe(33);
    });
  });

  describe('getSupportedImageFormats', () => {
    it('should return array of supported image formats', () => {
      const formats = getSupportedImageFormats();
      expect(Array.isArray(formats)).toBe(true);
      expect(formats).toContain('image/jpeg');
      expect(formats).toContain('image/png');
      expect(formats).toContain('image/gif');
      expect(formats).toContain('image/webp');
      expect(formats).toContain('image/svg+xml');
    });

    it('should include common image formats', () => {
      const formats = getSupportedImageFormats();
      expect(formats.length).toBeGreaterThan(0);
      expect(formats.every(format => format.startsWith('image/'))).toBe(true);
    });
  });

  describe('canConvertToWebp', () => {
    it('should return true for supported image types', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
      
      expect(canConvertToWebp(jpegFile)).toBe(true);
      expect(canConvertToWebp(pngFile)).toBe(true);
      expect(canConvertToWebp(gifFile)).toBe(true);
    });

    it('should return false for unsupported file types', () => {
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      
      expect(canConvertToWebp(txtFile)).toBe(false);
      expect(canConvertToWebp(pdfFile)).toBe(false);
    });

    it('should handle edge cases', () => {
      const emptyFile = new File([''], '', { type: '' });
      expect(canConvertToWebp(emptyFile)).toBe(false);
    });
  });

  // Note: Testing convertToWebp and convertMultipleToWebp functions would require
  // more complex mocking of Canvas API, Image loading, and blob conversion.
  // These are integration tests that would be better suited for end-to-end testing
  // or browser-based testing environments.
});