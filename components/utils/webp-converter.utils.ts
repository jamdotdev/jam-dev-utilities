interface ConvertToWebpOptions {
  file: File;
  quality?: number;
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
}

interface ConvertedFile {
  originalName: string;
  webpDataUrl: string;
  webpBlob: Blob;
  originalSize: number;
  webpSize: number;
}

/**
 * Converts an image file to WebP format using Canvas API
 */
export function convertToWebp({
  file,
  quality = 0.8,
  width,
  height,
  preserveAspectRatio = true,
}: ConvertToWebpOptions): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error(`Unsupported file format: ${file.type}. Only image files are supported.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context is not available'));
            return;
          }

          // Calculate dimensions
          let targetWidth = width || img.width;
          let targetHeight = height || img.height;

          if (preserveAspectRatio && (width || height)) {
            const ratio = img.width / img.height;
            
            if (width && !height) {
              targetWidth = width;
              targetHeight = width / ratio;
            } else if (height && !width) {
              targetHeight = height;
              targetWidth = height * ratio;
            } else if (width && height) {
              // If both dimensions provided, use the one that maintains aspect ratio better
              const widthRatio = width / img.width;
              const heightRatio = height / img.height;
              const scale = Math.min(widthRatio, heightRatio);
              targetWidth = img.width * scale;
              targetHeight = img.height * scale;
            }
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Enable high quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert to WebP blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image to WebP'));
                return;
              }

              // Create data URL for preview
              const reader = new FileReader();
              reader.onload = () => {
                const webpDataUrl = reader.result as string;
                
                resolve({
                  originalName: file.name,
                  webpDataUrl,
                  webpBlob: blob,
                  originalSize: file.size,
                  webpSize: blob.size,
                });
              };
              reader.readAsDataURL(blob);
            },
            'image/webp',
            quality
          );
        } catch (error) {
          reject(new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image. The file may be corrupted or in an unsupported format.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts multiple files to WebP format
 */
export async function convertMultipleToWebp(
  files: File[],
  options: Omit<ConvertToWebpOptions, 'file'> = {}
): Promise<ConvertedFile[]> {
  const results: ConvertedFile[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await convertToWebp({ file, ...options });
      results.push(result);
    } catch (error) {
      errors.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`Failed to convert all files: ${errors.map(e => `${e.file}: ${e.error}`).join(', ')}`);
  }

  return results;
}

/**
 * Downloads a WebP file with a proper filename
 */
export function downloadWebpFile(convertedFile: ConvertedFile): void {
  const { webpBlob, originalName } = convertedFile;
  
  // Generate WebP filename from original
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const webpFileName = `${nameWithoutExt}.webp`;

  // Create download link
  const url = URL.createObjectURL(webpBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = webpFileName;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Downloads multiple WebP files as a ZIP (if supported) or individually
 */
export function downloadMultipleWebpFiles(convertedFiles: ConvertedFile[]): void {
  // For now, download files individually
  // In a future enhancement, we could add ZIP functionality
  convertedFiles.forEach(file => {
    setTimeout(() => downloadWebpFile(file), 100); // Small delay between downloads
  });
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculates compression ratio as a percentage
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Checks if WebP is supported in the current browser
 */
export function isWebpSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    canvas.toBlob(
      (blob) => {
        resolve(blob !== null);
      },
      'image/webp'
    );
  });
}

/**
 * Gets supported image formats that can be converted to WebP
 */
export function getSupportedImageFormats(): string[] {
  return [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/webp',
  ];
}

/**
 * Validates if a file can be converted to WebP
 */
export function canConvertToWebp(file: File): boolean {
  return getSupportedImageFormats().includes(file.type);
}