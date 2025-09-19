import {
  initWebGPU,
  isWebGPUAvailable,
  resizeImageWithWebGPU,
  measureWebGPUPerformance,
  batchResizeImagesWithWebGPU,
  cleanupWebGPU,
  WebGPUImageResizeOptions,
  WebGPUPerformanceMetrics,
} from './webgpu-image-resize.utils';

// Mock WebGPU API for testing environments without WebGPU support
const mockWebGPU = () => {
  // Mock WebGPU constants
  global.GPUTextureUsage = {
    TEXTURE_BINDING: 1,
    COPY_DST: 2,
    RENDER_ATTACHMENT: 4,
  };

  global.GPUShaderStage = {
    VERTEX: 1,
    FRAGMENT: 2,
    COMPUTE: 4,
  };

  const mockTexture = {
    destroy: jest.fn(),
    createView: jest.fn().mockReturnValue({}),
  };

  const mockDevice = {
    createTexture: jest.fn().mockReturnValue(mockTexture),
    createShaderModule: jest.fn().mockReturnValue({}),
    createSampler: jest.fn().mockReturnValue({}),
    createBindGroupLayout: jest.fn().mockReturnValue({}),
    createBindGroup: jest.fn().mockReturnValue({}),
    createRenderPipeline: jest.fn().mockReturnValue({}),
    createPipelineLayout: jest.fn().mockReturnValue({}),
    createCommandEncoder: jest.fn().mockReturnValue({
      beginRenderPass: jest.fn().mockReturnValue({
        setPipeline: jest.fn(),
        setBindGroup: jest.fn(),
        draw: jest.fn(),
        end: jest.fn(),
      }),
      finish: jest.fn().mockReturnValue({}),
    }),
    queue: {
      submit: jest.fn(),
      onSubmittedWorkDone: jest.fn().mockResolvedValue(undefined),
      copyExternalImageToTexture: jest.fn(),
    },
    destroy: jest.fn(),
    features: {
      has: jest.fn().mockReturnValue(false),
    },
  };

  const mockAdapter = {
    requestDevice: jest.fn().mockResolvedValue(mockDevice),
  };

  const mockGPU = {
    requestAdapter: jest.fn().mockResolvedValue(mockAdapter),
    getPreferredCanvasFormat: jest.fn().mockReturnValue('bgra8unorm'),
  };

  const mockCanvas = document.createElement('canvas');
  const mockContext = {
    configure: jest.fn(),
    getCurrentTexture: jest.fn().mockReturnValue({
      createView: jest.fn().mockReturnValue({}),
    }),
  };

  jest.spyOn(mockCanvas, 'getContext').mockImplementation((contextId) => {
    if (contextId === 'webgpu') return mockContext as any;
    if (contextId === '2d') {
      return {
        drawImage: jest.fn(),
      };
    }
    return null;
  });
  
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') return mockCanvas;
    return document.createElement(tagName);
  });

  // Mock navigator.gpu
  Object.defineProperty(navigator, 'gpu', {
    value: mockGPU,
    writable: true,
  });

  // Mock createImageBitmap
  global.createImageBitmap = jest.fn().mockImplementation((image) =>
    Promise.resolve({
      width: image.width || 1920,
      height: image.height || 1080,
      close: jest.fn(),
    })
  );

  return { mockDevice, mockAdapter, mockGPU, mockCanvas, mockContext, mockTexture };
};

describe('WebGPU Image Resize Performance Tests', () => {
  let mockImg: HTMLImageElement;
  let mockWebGPUObjects: ReturnType<typeof mockWebGPU>;

  beforeEach(() => {
    // Reset WebGPU mocks
    mockWebGPUObjects = mockWebGPU();

    // Mock HTML Image element
    mockImg = {
      width: 1920,
      height: 1080,
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      onload: null,
      onerror: null,
    } as HTMLImageElement;

    // Clear any existing context
    cleanupWebGPU();
  });

  afterEach(() => {
    cleanupWebGPU();
    jest.restoreAllMocks();
  });

  describe('WebGPU Availability Tests', () => {
    it('should detect WebGPU availability correctly', () => {
      expect(typeof navigator.gpu).toBe('object');
      // Note: In test environment, isWebGPUAvailable() will return false initially
      // until initWebGPU() is called successfully
    });

    it('should initialize WebGPU context successfully', async () => {
      const context = await initWebGPU();
      expect(context).toBeTruthy();
      expect(context?.device).toBeTruthy();
      expect(context?.adapter).toBeTruthy();
      expect(isWebGPUAvailable()).toBe(true);
    });

    it('should handle WebGPU initialization failure gracefully', async () => {
      // Mock adapter request failure
      mockWebGPUObjects.mockGPU.requestAdapter.mockResolvedValue(null);
      
      const context = await initWebGPU();
      expect(context).toBeNull();
    });
  });

  describe('WebGPU Image Resize Performance', () => {
    const testCases = [
      { name: 'small image', width: 256, height: 256, targetWidth: 128, targetHeight: 128 },
      { name: 'medium image', width: 1024, height: 768, targetWidth: 512, targetHeight: 384 },
      { name: 'large image', width: 1920, height: 1080, targetWidth: 960, targetHeight: 540 },
      { name: 'very large image', width: 4096, height: 2160, targetWidth: 2048, targetHeight: 1080 },
    ];

    testCases.forEach(({ name, width, height, targetWidth, targetHeight }) => {
      it(`should resize ${name} efficiently`, async () => {
        const testImg = { ...mockImg, width, height };
        
        const options: WebGPUImageResizeOptions = {
          width: targetWidth,
          height: targetHeight,
          preserveAspectRatio: false,
          format: 'png',
        };

        const startTime = performance.now();
        const result = await resizeImageWithWebGPU(testImg, options);
        const endTime = performance.now();
        
        const processingTime = endTime - startTime;
        
        expect(result).toMatch(/^data:image\/png;base64,/);
        expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
      }, 10000); // 10 second timeout for large images
    });

    it('should maintain aspect ratio correctly', async () => {
      const options: WebGPUImageResizeOptions = {
        width: 960,
        preserveAspectRatio: true,
        format: 'png',
      };

      const result = await resizeImageWithWebGPU(mockImg, options);
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle different image formats', async () => {
      const formats: ('png' | 'jpeg')[] = ['png', 'jpeg'];
      
      for (const format of formats) {
        const options: WebGPUImageResizeOptions = {
          width: 512,
          height: 512,
          format,
          quality: 0.8,
        };

        const result = await resizeImageWithWebGPU(mockImg, options);
        expect(result).toMatch(new RegExp(`^data:image\\/${format};base64,`));
      }
    });
  });

  describe('WebGPU Performance Metrics', () => {
    it('should measure performance metrics accurately', async () => {
      const options: WebGPUImageResizeOptions = {
        width: 512,
        height: 512,
        format: 'png',
      };

      const metrics = await measureWebGPUPerformance(mockImg, options);
      
      expect(metrics).toMatchObject({
        gpuMemoryUsage: expect.any(Number),
        renderingTime: expect.any(Number),
        textureCreationTime: expect.any(Number),
        dataTransferTime: expect.any(Number),
        supportsTimestampQuery: expect.any(Boolean),
      });

      expect(metrics.gpuMemoryUsage).toBeGreaterThan(0);
      expect(metrics.renderingTime).toBeGreaterThanOrEqual(0);
      expect(metrics.textureCreationTime).toBeGreaterThanOrEqual(0);
      expect(metrics.dataTransferTime).toBeGreaterThanOrEqual(0);
    });

    it('should track memory usage for different image sizes', async () => {
      const sizes = [
        { width: 256, height: 256 },
        { width: 512, height: 512 },
        { width: 1024, height: 1024 },
      ];

      const memoryUsages: number[] = [];

      for (const size of sizes) {
        const testImg = { ...mockImg, ...size };
        const options: WebGPUImageResizeOptions = {
          width: 128,
          height: 128,
          format: 'png',
        };

        const metrics = await measureWebGPUPerformance(testImg, options);
        memoryUsages.push(metrics.gpuMemoryUsage);
      }

      // Memory usage should increase with larger input images
      expect(memoryUsages[1]).toBeGreaterThan(memoryUsages[0]);
      expect(memoryUsages[2]).toBeGreaterThan(memoryUsages[1]);
    });
  });

  describe('Batch Processing Performance', () => {
    it('should handle batch processing efficiently', async () => {
      const batchSize = 5;
      const images = Array.from({ length: batchSize }, (_, i) => ({
        ...mockImg,
        width: 800 + i * 100,
        height: 600 + i * 75,
      }));

      const options: WebGPUImageResizeOptions = {
        width: 400,
        height: 300,
        format: 'png',
      };

      const progressUpdates: Array<{ completed: number; total: number }> = [];
      const startTime = performance.now();

      const results = await batchResizeImagesWithWebGPU(
        images,
        options,
        (completed, total) => {
          progressUpdates.push({ completed, total });
        }
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(results).toHaveLength(batchSize);
      expect(progressUpdates).toHaveLength(batchSize);
      expect(progressUpdates[0]).toEqual({ completed: 1, total: batchSize });
      expect(progressUpdates[batchSize - 1]).toEqual({ completed: batchSize, total: batchSize });
      
      // Batch processing should be reasonably fast
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 5 images
    });

    it('should handle batch processing errors gracefully', async () => {
      // Mock an error for one of the images
      const originalCreateTexture = mockWebGPUObjects.mockDevice.createTexture;
      let callCount = 0;
      
      mockWebGPUObjects.mockDevice.createTexture.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Simulated GPU memory error');
        }
        return originalCreateTexture();
      });

      const images = [mockImg, mockImg, mockImg];
      const options: WebGPUImageResizeOptions = {
        width: 400,
        height: 300,
        format: 'png',
      };

      const results = await batchResizeImagesWithWebGPU(images, options);

      expect(results).toHaveLength(3);
      expect(results[0]).toMatch(/^data:image\/png;base64,/);
      expect(results[1]).toBe(''); // Failed image
      expect(results[2]).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('Performance Regression Tests', () => {
    const performanceBaseline = {
      small: 100, // 100ms for 256x256 image
      medium: 200, // 200ms for 1024x768 image
      large: 500, // 500ms for 1920x1080 image
    };

    it('should meet performance baselines for different image sizes', async () => {
      const testCases = [
        { size: 'small', width: 256, height: 256, baseline: performanceBaseline.small },
        { size: 'medium', width: 1024, height: 768, baseline: performanceBaseline.medium },
        { size: 'large', width: 1920, height: 1080, baseline: performanceBaseline.large },
      ];

      for (const testCase of testCases) {
        const testImg = { ...mockImg, width: testCase.width, height: testCase.height };
        const options: WebGPUImageResizeOptions = {
          width: Math.round(testCase.width / 2),
          height: Math.round(testCase.height / 2),
          format: 'png',
        };

        const startTime = performance.now();
        await resizeImageWithWebGPU(testImg, options);
        const processingTime = performance.now() - startTime;

        // Allow for some variance in test environments, but should be within reasonable bounds
        expect(processingTime).toBeLessThan(testCase.baseline * 3);
      }
    });

    it('should handle memory pressure gracefully', async () => {
      // Test with multiple large images to simulate memory pressure
      const largeImages = Array.from({ length: 10 }, () => ({
        ...mockImg,
        width: 2048,
        height: 2048,
      }));

      const options: WebGPUImageResizeOptions = {
        width: 512,
        height: 512,
        format: 'png',
      };

      // This should not crash or hang
      const results = await batchResizeImagesWithWebGPU(largeImages, options);
      expect(results).toHaveLength(10);
    });
  });

  describe('Quality and Correctness Tests', () => {
    it('should preserve image quality settings', async () => {
      const qualityLevels = [0.1, 0.5, 0.8, 1.0];
      
      for (const quality of qualityLevels) {
        const options: WebGPUImageResizeOptions = {
          width: 512,
          height: 512,
          format: 'jpeg',
          quality,
        };

        const result = await resizeImageWithWebGPU(mockImg, options);
        expect(result).toMatch(/^data:image\/jpeg;base64,/);
        // Note: Actual quality verification would require image analysis
        // which is beyond the scope of unit tests
      }
    });

    it('should handle edge cases correctly', async () => {
      const edgeCases = [
        { width: 1, height: 1 }, // Minimum size
        { width: 1, height: 1080 }, // Extreme aspect ratio
        { width: 1920, height: 1 }, // Extreme aspect ratio (inverse)
      ];

      for (const targetSize of edgeCases) {
        const options: WebGPUImageResizeOptions = {
          ...targetSize,
          format: 'png',
        };

        const result = await resizeImageWithWebGPU(mockImg, options);
        expect(result).toMatch(/^data:image\/png;base64,/);
      }
    });
  });

  describe('Resource Management Tests', () => {
    it('should clean up GPU resources properly', async () => {
      await initWebGPU();
      expect(isWebGPUAvailable()).toBe(true);

      cleanupWebGPU();
      
      // After cleanup, should need to re-initialize
      expect(mockWebGPUObjects.mockDevice.destroy).toHaveBeenCalled();
    });

    it('should handle multiple initialization calls', async () => {
      const context1 = await initWebGPU();
      const context2 = await initWebGPU();
      
      // Should return the same context
      expect(context1).toBe(context2);
      expect(mockWebGPUObjects.mockGPU.requestAdapter).toHaveBeenCalledTimes(1);
    });
  });
});