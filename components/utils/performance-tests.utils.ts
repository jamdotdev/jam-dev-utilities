import { resizeImage } from './resize-image.utils';
import { 
  resizeImageWithWebGPU, 
  measureWebGPUPerformance,
  isWebGPUAvailable,
  WebGPUImageResizeOptions 
} from './webgpu-image-resize.utils';

/**
 * Performance benchmark suite comparing Canvas 2D vs WebGPU image resizing
 */

interface BenchmarkResult {
  method: 'canvas2d' | 'webgpu';
  imageSize: string;
  processingTime: number;
  memoryUsage?: number;
  success: boolean;
  error?: string;
}

interface BenchmarkSuite {
  testName: string;
  results: BenchmarkResult[];
  summary: {
    canvas2dAverage: number;
    webgpuAverage: number;
    improvement: number; // Percentage improvement (negative means slower)
    webgpuSupported: boolean;
  };
}

/**
 * Create a test image with specified dimensions
 */
function createTestImage(width: number, height: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }

    // Create a gradient pattern for testing
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.5, '#00ff00');
    gradient.addColorStop(1, '#0000ff');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some detail
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(12, width / 20)}px Arial`;
    ctx.fillText(`${width}x${height}`, 10, 30);
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load test image'));
    img.src = canvas.toDataURL();
  });
}

/**
 * Measure Canvas 2D performance
 */
async function measureCanvas2DPerformance(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  format: 'png' | 'jpeg' = 'png'
): Promise<{ processingTime: number; success: boolean; error?: string }> {
  const startTime = performance.now();
  
  try {
    await resizeImage({
      img,
      width: targetWidth,
      height: targetHeight,
      format,
      preserveAspectRatio: false,
      useWebGPU: false, // Force Canvas 2D
    });
    
    const processingTime = performance.now() - startTime;
    return { processingTime, success: true };
  } catch (error) {
    const processingTime = performance.now() - startTime;
    return { 
      processingTime, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Measure WebGPU performance
 */
async function measureWebGPUResizePerformance(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  format: 'png' | 'jpeg' = 'png'
): Promise<{ processingTime: number; memoryUsage: number; success: boolean; error?: string }> {
  if (!isWebGPUAvailable()) {
    return { 
      processingTime: 0, 
      memoryUsage: 0, 
      success: false, 
      error: 'WebGPU not available' 
    };
  }

  const startTime = performance.now();
  
  try {
    const options: WebGPUImageResizeOptions = {
      width: targetWidth,
      height: targetHeight,
      format,
      preserveAspectRatio: false,
    };

    await resizeImageWithWebGPU(img, options);
    const processingTime = performance.now() - startTime;
    
    // Get detailed performance metrics
    const metrics = await measureWebGPUPerformance(img, options);
    
    return { 
      processingTime, 
      memoryUsage: metrics.gpuMemoryUsage,
      success: true 
    };
  } catch (error) {
    const processingTime = performance.now() - startTime;
    return { 
      processingTime, 
      memoryUsage: 0,
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Run performance benchmark for a specific image size
 */
async function runImageSizeBenchmark(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  iterations: number = 5
): Promise<BenchmarkResult[]> {
  const img = await createTestImage(sourceWidth, sourceHeight);
  const results: BenchmarkResult[] = [];
  const imageSize = `${sourceWidth}x${sourceHeight} → ${targetWidth}x${targetHeight}`;

  // Benchmark Canvas 2D
  const canvas2dTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const result = await measureCanvas2DPerformance(img, targetWidth, targetHeight);
    canvas2dTimes.push(result.processingTime);
    
    if (i === 0) { // Only add one result per method to avoid clutter
      results.push({
        method: 'canvas2d',
        imageSize,
        processingTime: result.processingTime,
        success: result.success,
        error: result.error,
      });
    }
  }

  // Benchmark WebGPU
  const webgpuTimes: number[] = [];
  let webgpuMemoryUsage = 0;
  for (let i = 0; i < iterations; i++) {
    const result = await measureWebGPUResizePerformance(img, targetWidth, targetHeight);
    webgpuTimes.push(result.processingTime);
    webgpuMemoryUsage = result.memoryUsage;
    
    if (i === 0) { // Only add one result per method to avoid clutter
      results.push({
        method: 'webgpu',
        imageSize,
        processingTime: result.processingTime,
        memoryUsage: result.memoryUsage,
        success: result.success,
        error: result.error,
      });
    }
  }

  // Update with average times
  results[0].processingTime = canvas2dTimes.reduce((a, b) => a + b, 0) / canvas2dTimes.length;
  if (results[1]) {
    results[1].processingTime = webgpuTimes.reduce((a, b) => a + b, 0) / webgpuTimes.length;
  }

  return results;
}

/**
 * Comprehensive performance test suite
 */
export async function runPerformanceTestSuite(): Promise<BenchmarkSuite[]> {
  const testSuites: BenchmarkSuite[] = [];

  // Test different image size scenarios
  const testScenarios = [
    {
      name: 'Small Image Downscaling',
      source: { width: 512, height: 512 },
      target: { width: 256, height: 256 },
    },
    {
      name: 'Medium Image Downscaling',
      source: { width: 1920, height: 1080 },
      target: { width: 960, height: 540 },
    },
    {
      name: 'Large Image Downscaling',
      source: { width: 4096, height: 2160 },
      target: { width: 1920, height: 1080 },
    },
    {
      name: 'Small Image Upscaling',
      source: { width: 256, height: 256 },
      target: { width: 512, height: 512 },
    },
    {
      name: 'Extreme Downscaling',
      source: { width: 2048, height: 2048 },
      target: { width: 128, height: 128 },
    },
    {
      name: 'Aspect Ratio Change',
      source: { width: 1920, height: 1080 },
      target: { width: 1080, height: 1920 },
    },
  ];

  for (const scenario of testScenarios) {
    const results = await runImageSizeBenchmark(
      scenario.source.width,
      scenario.source.height,
      scenario.target.width,
      scenario.target.height,
      3 // 3 iterations for faster testing
    );

    const canvas2dResult = results.find(r => r.method === 'canvas2d');
    const webgpuResult = results.find(r => r.method === 'webgpu');

    const canvas2dAverage = canvas2dResult?.processingTime || 0;
    const webgpuAverage = webgpuResult?.processingTime || 0;
    const improvement = webgpuAverage > 0 ? 
      ((canvas2dAverage - webgpuAverage) / canvas2dAverage) * 100 : 0;

    testSuites.push({
      testName: scenario.name,
      results,
      summary: {
        canvas2dAverage,
        webgpuAverage,
        improvement,
        webgpuSupported: isWebGPUAvailable(),
      },
    });
  }

  return testSuites;
}

/**
 * Memory usage stress test
 */
export async function runMemoryStressTest(): Promise<{
  maxImagesProcessed: number;
  totalMemoryUsed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalMemoryUsed = 0;
  let maxImagesProcessed = 0;

  try {
    // Process increasingly large batches until we hit memory limits
    for (let batchSize = 1; batchSize <= 50; batchSize += 5) {
      const images: HTMLImageElement[] = [];
      
      // Create batch of test images
      for (let i = 0; i < batchSize; i++) {
        try {
          const img = await createTestImage(1024, 1024);
          images.push(img);
        } catch (error) {
          errors.push(`Failed to create test image ${i}: ${error}`);
          break;
        }
      }

      // Process batch with WebGPU (if available)
      if (isWebGPUAvailable()) {
        try {
          for (const img of images) {
            const metrics = await measureWebGPUPerformance(img, {
              width: 512,
              height: 512,
              format: 'png',
            });
            totalMemoryUsed += metrics.gpuMemoryUsage;
          }
          maxImagesProcessed = images.length;
        } catch (error) {
          errors.push(`Batch processing failed at size ${batchSize}: ${error}`);
          break;
        }
      } else {
        // Fallback to Canvas 2D
        try {
          for (const img of images) {
            await resizeImage({
              img,
              width: 512,
              height: 512,
              format: 'png',
              useWebGPU: false,
            });
          }
          maxImagesProcessed = images.length;
          totalMemoryUsed += images.length * (1024 * 1024 * 4); // Estimate
        } catch (error) {
          errors.push(`Canvas 2D processing failed at size ${batchSize}: ${error}`);
          break;
        }
      }

      // Check memory usage limits (stop if getting too high)
      if (totalMemoryUsed > 500 * 1024 * 1024) { // 500MB limit for testing
        break;
      }
    }
  } catch (error) {
    errors.push(`Stress test error: ${error}`);
  }

  return {
    maxImagesProcessed,
    totalMemoryUsed,
    errors,
  };
}

/**
 * Quality comparison test
 */
export async function runQualityComparisonTest(): Promise<{
  canvas2dSize: number;
  webgpuSize: number;
  sizeDifference: number;
  qualityMetrics: {
    psnr?: number; // Peak Signal-to-Noise Ratio (would need image analysis library)
    ssim?: number; // Structural Similarity Index (would need image analysis library)
  };
}> {
  const img = await createTestImage(1000, 1000);
  
  // Resize with Canvas 2D
  const canvas2dResult = await resizeImage({
    img,
    width: 500,
    height: 500,
    format: 'png',
    useWebGPU: false,
  });
  
  let webgpuResult = '';
  if (isWebGPUAvailable()) {
    try {
      webgpuResult = await resizeImageWithWebGPU(img, {
        width: 500,
        height: 500,
        format: 'png',
      });
    } catch (error) {
      console.warn('WebGPU quality test failed:', error);
    }
  }

  // Estimate sizes (rough approximation)
  const canvas2dSize = canvas2dResult.length;
  const webgpuSize = webgpuResult.length;
  const sizeDifference = ((webgpuSize - canvas2dSize) / canvas2dSize) * 100;

  return {
    canvas2dSize,
    webgpuSize,
    sizeDifference,
    qualityMetrics: {
      // Note: Actual PSNR/SSIM calculation would require additional image processing libraries
      // For now, we'll rely on visual testing and file size comparison
    },
  };
}

// Export test utilities for use in Jest tests
export {
  createTestImage,
  measureCanvas2DPerformance,
  measureWebGPUResizePerformance,
  runImageSizeBenchmark,
};