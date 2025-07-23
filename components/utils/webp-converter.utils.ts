// Note: @squoosh/lib requires Node.js environment. 
// For browser compatibility, we'll use a Canvas-based fallback for demonstration.
// In production, this would need server-side integration with @squoosh/lib.

export interface WebPConversionOptions {
  quality: number; // 0-100
}

export interface ConversionResult {
  fileName: string;
  originalSize: number;
  webpSize: number;
  webpData: ArrayBuffer;
  success: boolean;
  error?: string;
}

export interface BatchConversionResult {
  results: ConversionResult[];
  totalOriginalSize: number;
  totalWebpSize: number;
  compressionRatio: number;
}

/**
 * Browser-compatible WebP conversion using Canvas API
 * Note: This is a fallback implementation. In production, use @squoosh/lib server-side.
 */
async function convertImageToWebP(
  file: File,
  quality: number
): Promise<{ webpData: ArrayBuffer; webpSize: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to WebP using Canvas API
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create WebP blob'));
              return;
            }
            
            blob.arrayBuffer().then((arrayBuffer) => {
              resolve({
                webpData: arrayBuffer,
                webpSize: arrayBuffer.byteLength,
              });
            });
          },
          'image/webp',
          quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert a single image file to WebP format
 */
export async function convertToWebP(
  file: File,
  options: WebPConversionOptions
): Promise<ConversionResult> {
  try {
    const { webpData, webpSize } = await convertImageToWebP(file, options.quality);
    
    return {
      fileName: file.name.replace(/\.[^/.]+$/, '.webp'),
      originalSize: file.size,
      webpSize,
      webpData,
      success: true,
    };
  } catch (error) {
    return {
      fileName: file.name,
      originalSize: file.size,
      webpSize: 0,
      webpData: new ArrayBuffer(0),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Convert multiple image files to WebP format
 */
export async function batchConvertToWebP(
  files: File[],
  options: WebPConversionOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<BatchConversionResult> {
  const results: ConversionResult[] = [];
  let totalOriginalSize = 0;
  let totalWebpSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await convertToWebP(file, options);
    results.push(result);
    
    totalOriginalSize += result.originalSize;
    totalWebpSize += result.webpSize;
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  const compressionRatio = totalOriginalSize > 0 ? 
    ((totalOriginalSize - totalWebpSize) / totalOriginalSize) * 100 : 0;

  return {
    results,
    totalOriginalSize,
    totalWebpSize,
    compressionRatio,
  };
}

/**
 * Create download URL for WebP data
 */
export function createWebPDownloadUrl(webpData: ArrayBuffer): string {
  const blob = new Blob([webpData], { type: 'image/webp' });
  return URL.createObjectURL(blob);
}

/**
 * Download a single WebP file
 */
export function downloadWebP(webpData: ArrayBuffer, fileName: string): void {
  const url = createWebPDownloadUrl(webpData);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Create and download a ZIP file containing all converted WebP files
 */
export async function downloadWebPZip(results: ConversionResult[]): Promise<void> {
  // For now, we'll download files individually since adding zip functionality 
  // would require additional dependencies. This can be enhanced later.
  const successfulResults = results.filter(r => r.success);
  
  successfulResults.forEach((result, index) => {
    // Add a small delay between downloads to avoid browser blocking
    setTimeout(() => {
      downloadWebP(result.webpData, result.fileName);
    }, index * 100);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const result = bytes / Math.pow(k, i);
  return `${result % 1 === 0 ? result : parseFloat(result.toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate if file is a supported image format
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/bmp',
    'image/gif',
    'image/tiff',
    'image/webp'
  ];
  
  return supportedTypes.includes(file.type.toLowerCase());
}

/**
 * Filter files to only include supported image formats
 */
export function filterSupportedImages(files: File[]): File[] {
  return files.filter(isSupportedImageFormat);
}

/**
 * Clean up resources (no-op for Canvas-based implementation)
 */
export function cleanup(): void {
  // No cleanup needed for Canvas-based implementation
}