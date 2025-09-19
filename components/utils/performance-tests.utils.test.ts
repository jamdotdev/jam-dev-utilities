import {
  runPerformanceTestSuite,
  runMemoryStressTest,
  runQualityComparisonTest,
  createTestImage,
  measureCanvas2DPerformance,
  measureWebGPUResizePerformance,
  runImageSizeBenchmark,
} from './performance-tests.utils';

// Mock the WebGPU utilities for testing
jest.mock('./webgpu-image-resize.utils', () => ({
  isWebGPUAvailable: jest.fn().mockReturnValue(false),
  resizeImageWithWebGPU: jest.fn(),
  measureWebGPUPerformance: jest.fn(),
}));

// Mock the resize utilities
jest.mock('./resize-image.utils', () => ({
  resizeImage: jest.fn().mockResolvedValue('data:image/png;base64,MOCK_DATA'),
}));

describe('Performance Tests Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTestImage', () => {
    it('should create a test image with specified dimensions', async () => {
      const img = await createTestImage(100, 50);
      
      expect(img).toBeInstanceOf(HTMLImageElement);
      expect(img.width).toBe(100);
      expect(img.height).toBe(50);
      expect(img.src).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle different image sizes', async () => {
      const sizes = [
        { width: 256, height: 256 },
        { width: 1920, height: 1080 },
        { width: 4096, height: 2160 },
      ];

      for (const size of sizes) {
        const img = await createTestImage(size.width, size.height);
        expect(img.width).toBe(size.width);
        expect(img.height).toBe(size.height);
      }
    });
  });

  describe('measureCanvas2DPerformance', () => {
    it('should measure Canvas 2D performance correctly', async () => {
      const img = await createTestImage(1000, 1000);
      
      const result = await measureCanvas2DPerformance(img, 500, 500, 'png');
      
      expect(result.success).toBe(true);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle different formats', async () => {
      const img = await createTestImage(500, 500);
      
      const pngResult = await measureCanvas2DPerformance(img, 250, 250, 'png');
      const jpegResult = await measureCanvas2DPerformance(img, 250, 250, 'jpeg');
      
      expect(pngResult.success).toBe(true);
      expect(jpegResult.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const { resizeImage } = require('./resize-image.utils');
      resizeImage.mockRejectedValueOnce(new Error('Test error'));
      
      const img = await createTestImage(100, 100);
      const result = await measureCanvas2DPerformance(img, 50, 50);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('measureWebGPUResizePerformance', () => {
    it('should return unavailable when WebGPU is not supported', async () => {
      const img = await createTestImage(1000, 1000);
      
      const result = await measureWebGPUResizePerformance(img, 500, 500, 'png');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('WebGPU not available');
      expect(result.processingTime).toBe(0);
      expect(result.memoryUsage).toBe(0);
    });

    it('should measure WebGPU performance when available', async () => {
      const { 
        isWebGPUAvailable, 
        resizeImageWithWebGPU, 
        measureWebGPUPerformance 
      } = require('./webgpu-image-resize.utils');
      
      isWebGPUAvailable.mockReturnValue(true);
      resizeImageWithWebGPU.mockResolvedValue('data:image/png;base64,WEBGPU_DATA');
      measureWebGPUPerformance.mockResolvedValue({
        gpuMemoryUsage: 1048576, // 1MB
        renderingTime: 50,
        textureCreationTime: 10,
        dataTransferTime: 5,
        supportsTimestampQuery: false,
      });
      
      const img = await createTestImage(1000, 1000);
      const result = await measureWebGPUResizePerformance(img, 500, 500, 'png');
      
      expect(result.success).toBe(true);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.memoryUsage).toBe(1048576);
      expect(result.error).toBeUndefined();
    });
  });

  describe('runImageSizeBenchmark', () => {
    it('should run benchmark for specified image sizes', async () => {
      const results = await runImageSizeBenchmark(1000, 1000, 500, 500, 2);
      
      expect(results).toHaveLength(2); // Canvas2D and WebGPU results
      expect(results[0].method).toBe('canvas2d');
      expect(results[0].imageSize).toBe('1000x1000 → 500x500');
      expect(results[0].processingTime).toBeGreaterThanOrEqual(0);
      expect(results[0].success).toBe(true);
      
      expect(results[1].method).toBe('webgpu');
      expect(results[1].success).toBe(false); // Since WebGPU is mocked as unavailable
    });

    it('should handle different iteration counts', async () => {
      const results1 = await runImageSizeBenchmark(500, 500, 250, 250, 1);
      const results2 = await runImageSizeBenchmark(500, 500, 250, 250, 3);
      
      expect(results1).toHaveLength(2);
      expect(results2).toHaveLength(2);
      // Both should have valid processing times averaged over different iterations
      expect(results1[0].processingTime).toBeGreaterThanOrEqual(0);
      expect(results2[0].processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('runPerformanceTestSuite', () => {
    it('should run complete performance test suite', async () => {
      const suites = await runPerformanceTestSuite();
      
      expect(suites.length).toBeGreaterThan(0);
      
      for (const suite of suites) {
        expect(suite.testName).toBeTruthy();
        expect(suite.results).toHaveLength(2); // Canvas2D and WebGPU
        expect(suite.summary).toEqual({
          canvas2dAverage: expect.any(Number),
          webgpuAverage: expect.any(Number),
          improvement: expect.any(Number),
          webgpuSupported: false, // Mocked as false
        });
      }
    });

    it('should include all expected test scenarios', async () => {
      const suites = await runPerformanceTestSuite();
      const testNames = suites.map(s => s.testName);
      
      expect(testNames).toContain('Small Image Downscaling');
      expect(testNames).toContain('Medium Image Downscaling');
      expect(testNames).toContain('Large Image Downscaling');
      expect(testNames).toContain('Small Image Upscaling');
      expect(testNames).toContain('Extreme Downscaling');
      expect(testNames).toContain('Aspect Ratio Change');
    });

    it('should calculate performance improvements correctly', async () => {
      const { 
        isWebGPUAvailable, 
        resizeImageWithWebGPU, 
        measureWebGPUPerformance 
      } = require('./webgpu-image-resize.utils');
      
      // Mock WebGPU as faster than Canvas2D
      isWebGPUAvailable.mockReturnValue(true);
      resizeImageWithWebGPU.mockResolvedValue('data:image/png;base64,WEBGPU_DATA');
      measureWebGPUPerformance.mockResolvedValue({
        gpuMemoryUsage: 1048576,
        renderingTime: 25, // Half the time of Canvas2D
        textureCreationTime: 5,
        dataTransferTime: 5,
        supportsTimestampQuery: false,
      });
      
      // Mock Canvas2D as slower
      const { resizeImage } = require('./resize-image.utils');
      resizeImage.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('data:image/png;base64,MOCK_DATA'), 50))
      );
      
      const suites = await runPerformanceTestSuite();
      
      expect(suites.length).toBeGreaterThan(0);
      // Should show WebGPU improvements
      expect(suites[0].summary.webgpuSupported).toBe(true);
      expect(suites[0].summary.improvement).toBeGreaterThan(0); // Positive improvement
    });
  });

  describe('runMemoryStressTest', () => {
    it('should run memory stress test', async () => {
      const result = await runMemoryStressTest();
      
      expect(result).toEqual({
        maxImagesProcessed: expect.any(Number),
        totalMemoryUsed: expect.any(Number),
        errors: expect.any(Array),
      });
      
      expect(result.maxImagesProcessed).toBeGreaterThanOrEqual(0);
      expect(result.totalMemoryUsed).toBeGreaterThanOrEqual(0);
    });

    it('should handle memory allocation errors', async () => {
      // Mock createTestImage to fail after a few calls
      const originalCreateTestImage = jest.requireActual('./performance-tests.utils').createTestImage;
      let callCount = 0;
      
      jest.spyOn(require('./performance-tests.utils'), 'createTestImage')
        .mockImplementation(async (width, height) => {
          callCount++;
          if (callCount > 3) {
            throw new Error('Out of memory');
          }
          return originalCreateTestImage(width, height);
        });
      
      const result = await runMemoryStressTest();
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Out of memory'))).toBe(true);
    });
  });

  describe('runQualityComparisonTest', () => {
    it('should compare quality between Canvas2D and WebGPU', async () => {
      const result = await runQualityComparisonTest();
      
      expect(result).toEqual({
        canvas2dSize: expect.any(Number),
        webgpuSize: expect.any(Number),
        sizeDifference: expect.any(Number),
        qualityMetrics: {
          psnr: undefined,
          ssim: undefined,
        },
      });
      
      expect(result.canvas2dSize).toBeGreaterThan(0);
    });

    it('should handle WebGPU unavailability in quality test', async () => {
      const result = await runQualityComparisonTest();
      
      expect(result.webgpuSize).toBe(0); // WebGPU unavailable
      expect(result.sizeDifference).toBe(-100); // 100% smaller (0 size)
    });

    it('should calculate size differences correctly when WebGPU is available', async () => {
      const { 
        isWebGPUAvailable, 
        resizeImageWithWebGPU 
      } = require('./webgpu-image-resize.utils');
      
      isWebGPUAvailable.mockReturnValue(true);
      resizeImageWithWebGPU.mockResolvedValue('data:image/png;base64,SHORTER_DATA');
      
      const result = await runQualityComparisonTest();
      
      expect(result.webgpuSize).toBeGreaterThan(0);
      expect(result.sizeDifference).not.toBe(-100);
    });
  });

  describe('Integration Tests', () => {
    it('should handle large-scale performance testing', async () => {
      // Test with multiple concurrent benchmarks
      const promises = [
        runImageSizeBenchmark(512, 512, 256, 256, 1),
        runImageSizeBenchmark(1024, 1024, 512, 512, 1),
        runImageSizeBenchmark(2048, 2048, 1024, 1024, 1),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveLength(2); // Canvas2D and WebGPU results
        expect(result[0].success).toBe(true);
      });
    });

    it('should maintain performance consistency across multiple runs', async () => {
      const runs = [];
      
      for (let i = 0; i < 3; i++) {
        const result = await measureCanvas2DPerformance(
          await createTestImage(500, 500),
          250,
          250
        );
        runs.push(result.processingTime);
      }
      
      // All runs should be successful and have reasonable times
      runs.forEach(time => {
        expect(time).toBeGreaterThanOrEqual(0);
        expect(time).toBeLessThan(1000); // Should be under 1 second
      });
      
      // Performance should be relatively consistent (no huge outliers)
      const average = runs.reduce((a, b) => a + b, 0) / runs.length;
      const maxDeviation = Math.max(...runs.map(time => Math.abs(time - average)));
      expect(maxDeviation).toBeLessThan(average * 2); // Within 200% of average
    });
  });
});