// WebGPU-based image resizing utilities
// Provides high-performance image processing using GPU acceleration

export interface WebGPUImageResizeOptions {
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
  quality?: number;
  format?: 'png' | 'jpeg';
}

interface WebGPUContext {
  device: GPUDevice;
  adapter: GPUAdapter;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
}

// WebGPU shader for image processing
const VERTEX_SHADER = `
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  let pos = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, 1.0)
  );
  return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;

@fragment
fn fs_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
  let texCoord = coord.xy / vec2<f32>(textureDimensions(inputTexture));
  return textureSample(inputTexture, textureSampler, texCoord);
}
`;

let webgpuContext: WebGPUContext | null = null;

/**
 * Initialize WebGPU context
 */
export async function initWebGPU(): Promise<WebGPUContext | null> {
  if (webgpuContext) {
    return webgpuContext;
  }

  if (!navigator.gpu) {
    console.warn('WebGPU not supported in this browser');
    return null;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      console.warn('No WebGPU adapter available');
      return null;
    }

    const device = await adapter.requestDevice();
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgpu');
    
    if (!context) {
      console.warn('Failed to get WebGPU canvas context');
      return null;
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: canvasFormat,
    });

    webgpuContext = {
      device,
      adapter,
      canvas,
      context
    };

    return webgpuContext;
  } catch (error) {
    console.warn('Failed to initialize WebGPU:', error);
    return null;
  }
}

/**
 * Check if WebGPU is available and initialized
 */
export function isWebGPUAvailable(): boolean {
  return webgpuContext !== null && 'gpu' in navigator;
}

/**
 * Create GPU texture from ImageBitmap
 */
async function createTextureFromImage(
  device: GPUDevice,
  imageBitmap: ImageBitmap
): Promise<GPUTexture> {
  const texture = device.createTexture({
    size: {
      width: imageBitmap.width,
      height: imageBitmap.height,
    },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture },
    {
      width: imageBitmap.width,
      height: imageBitmap.height,
    }
  );

  return texture;
}

/**
 * Resize image using WebGPU
 */
export async function resizeImageWithWebGPU(
  img: HTMLImageElement,
  options: WebGPUImageResizeOptions
): Promise<string> {
  const context = await initWebGPU();
  if (!context) {
    throw new Error('WebGPU not available');
  }

  const { device, canvas, context: gpuContext } = context;

  // Calculate target dimensions
  let targetWidth = options.width || img.width;
  let targetHeight = options.height || img.height;

  if (options.preserveAspectRatio) {
    const aspectRatio = img.width / img.height;
    
    if (options.width && !options.height) {
      targetWidth = options.width;
      targetHeight = Math.round(options.width / aspectRatio);
    } else if (options.height && !options.width) {
      targetHeight = options.height;
      targetWidth = Math.round(options.height * aspectRatio);
    }
  }

  // Set canvas size
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  try {
    // Create ImageBitmap from the image
    const imageBitmap = await createImageBitmap(img);
    
    // Create GPU texture from image
    const inputTexture = await createTextureFromImage(device, imageBitmap);
    
    // Create shaders
    const vertexShaderModule = device.createShaderModule({
      code: VERTEX_SHADER,
    });
    
    const fragmentShaderModule = device.createShaderModule({
      code: FRAGMENT_SHADER,
    });

    // Create sampler
    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // Create bind group layout
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'float',
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ],
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: inputTexture.createView(),
        },
        {
          binding: 1,
          resource: sampler,
        },
      ],
    });

    // Create render pipeline
    const pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      vertex: {
        module: vertexShaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: fragmentShaderModule,
        entryPoint: 'fs_main',
        targets: [
          {
            format: navigator.gpu.getPreferredCanvasFormat(),
          },
        ],
      },
      primitive: {
        topology: 'triangle-strip',
      },
    });

    // Create command encoder
    const commandEncoder = device.createCommandEncoder();
    
    // Begin render pass
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: gpuContext.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(4); // Draw fullscreen quad
    renderPass.end();

    // Submit commands
    device.queue.submit([commandEncoder.finish()]);

    // Wait for rendering to complete
    await device.queue.onSubmittedWorkDone();

    // Convert to data URL
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) {
      throw new Error('Failed to get 2D context for data URL conversion');
    }

    // Read back from WebGPU canvas to 2D canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) {
      throw new Error('Failed to create output canvas context');
    }

    outputCtx.drawImage(canvas, 0, 0);
    
    // Cleanup GPU resources
    inputTexture.destroy();
    imageBitmap.close();

    // Return data URL
    const format = options.format || 'png';
    const quality = format === 'jpeg' ? (options.quality || 0.9) : undefined;
    return outputCanvas.toDataURL(`image/${format}`, quality);

  } catch (error) {
    console.error('WebGPU image resize failed:', error);
    throw error;
  }
}

/**
 * Get performance metrics for WebGPU operations
 */
export interface WebGPUPerformanceMetrics {
  gpuMemoryUsage: number;
  renderingTime: number;
  textureCreationTime: number;
  dataTransferTime: number;
  supportsTimestampQuery: boolean;
}

/**
 * Measure WebGPU performance metrics
 */
export async function measureWebGPUPerformance(
  img: HTMLImageElement,
  options: WebGPUImageResizeOptions
): Promise<WebGPUPerformanceMetrics> {
  const startTime = performance.now();
  
  const context = await initWebGPU();
  if (!context) {
    throw new Error('WebGPU not available for performance measurement');
  }

  const { device } = context;
  
  // Check for timestamp query support
  const supportsTimestampQuery = device.features.has('timestamp-query');
  
  const textureCreationStart = performance.now();
  const imageBitmap = await createImageBitmap(img);
  const inputTexture = await createTextureFromImage(device, imageBitmap);
  const textureCreationTime = performance.now() - textureCreationStart;
  
  const renderingStart = performance.now();
  await resizeImageWithWebGPU(img, options);
  const renderingTime = performance.now() - renderingStart;
  
  const dataTransferTime = performance.now() - startTime - renderingTime;
  
  // Estimate GPU memory usage (approximate)
  const gpuMemoryUsage = img.width * img.height * 4 + // Input texture (RGBA)
                        (options.width || img.width) * (options.height || img.height) * 4; // Output texture
  
  // Cleanup
  inputTexture.destroy();
  imageBitmap.close();
  
  return {
    gpuMemoryUsage,
    renderingTime,
    textureCreationTime,
    dataTransferTime,
    supportsTimestampQuery,
  };
}

/**
 * Cleanup WebGPU resources
 */
export function cleanupWebGPU(): void {
  if (webgpuContext) {
    webgpuContext.device.destroy();
    webgpuContext = null;
  }
}

/**
 * Batch resize multiple images using WebGPU
 */
export async function batchResizeImagesWithWebGPU(
  images: HTMLImageElement[],
  options: WebGPUImageResizeOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const context = await initWebGPU();
  if (!context) {
    throw new Error('WebGPU not available for batch processing');
  }

  const results: string[] = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      const result = await resizeImageWithWebGPU(images[i], options);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Failed to resize image ${i}:`, error);
      // Add empty string to maintain array index consistency
      results.push('');
    }
  }
  
  return results;
}