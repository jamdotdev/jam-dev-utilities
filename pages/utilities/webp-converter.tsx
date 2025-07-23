import { useCallback, useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { FileUploadComponent } from "@/components/ds/FileUploadComponent";
import { 
  convertMultipleToWebp,
  downloadWebpFile,
  downloadMultipleWebpFiles,
  formatFileSize,
  calculateCompressionRatio,
  isWebpSupported,
  getSupportedImageFormats,
  canConvertToWebp,
} from "@/components/utils/webp-converter.utils";
import { DownloadIcon, ImageIcon, XIcon } from "lucide-react";

interface ConvertedFile {
  originalName: string;
  webpDataUrl: string;
  webpBlob: Blob;
  originalSize: number;
  webpSize: number;
}

export default function WebpConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const [webpSupported, setWebpSupported] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    isWebpSupported().then(setWebpSupported);
  }, []);

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    // Filter for supported image files
    const supportedFiles = selectedFiles.filter(canConvertToWebp);
    const unsupportedFiles = selectedFiles.filter(file => !canConvertToWebp(file));

    if (unsupportedFiles.length > 0) {
      setError(`Unsupported files skipped: ${unsupportedFiles.map(f => f.name).join(", ")}`);
    } else {
      setError("");
    }

    setFiles(supportedFiles);
    setConvertedFiles([]);
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setError("");

    try {
      const results = await convertMultipleToWebp(files, {
        quality: quality / 100,
        width,
        height,
        preserveAspectRatio,
      });
      setConvertedFiles(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  }, [files, quality, width, height, preserveAspectRatio]);

  const handleDownloadSingle = useCallback((convertedFile: ConvertedFile) => {
    downloadWebpFile(convertedFile);
  }, []);

  const handleDownloadAll = useCallback(() => {
    if (convertedFiles.length > 0) {
      downloadMultipleWebpFiles(convertedFiles);
    }
  }, [convertedFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setConvertedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setConvertedFiles([]);
    setError("");
  }, []);

  const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalWebpSize = convertedFiles.reduce((sum, file) => sum + file.webpSize, 0);
  const overallCompressionRatio = totalOriginalSize > 0 ? calculateCompressionRatio(totalOriginalSize, totalWebpSize) : 0;

  if (!webpSupported) {
    return (
      <main>
        <Meta
          title="WebP Converter | Free Image Format Converter"
          description="Convert any image format to WebP for better web performance. Fast, free, open source, and ad-free."
        />
        <Header />
        <CMDK />
        
        <section className="container max-w-2xl mb-12">
          <PageHeader
            title="WebP Converter"
            description="Your browser doesn't support WebP conversion. Please use a modern browser."
          />
        </section>
      </main>
    );
  }

  return (
    <main>
      <Meta
        title="WebP Converter | Free Image Format Converter"
        description="Convert any image format to WebP for better web performance. Supports JPEG, PNG, GIF, BMP, TIFF, and SVG. Fast, free, open source, and ad-free."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="WebP Converter"
          description="Convert any image format to WebP for better web performance and smaller file sizes."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <FileUploadComponent
            onFileSelect={handleFileSelect}
            multiple={true}
            acceptedTypes={getSupportedImageFormats()}
            maxFileSize={40 * 1024 * 1024} // 40MB
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Conversion Settings</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality">Quality ({quality}%)</Label>
                    <Input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="preserveAspectRatio"
                      checked={preserveAspectRatio}
                      onCheckedChange={(checked) => setPreserveAspectRatio(checked as boolean)}
                    />
                    <Label htmlFor="preserveAspectRatio">Preserve aspect ratio</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      placeholder="Original"
                      value={width || ""}
                      onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Original"
                      value={height || ""}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full"
                >
                  {isConverting ? "Converting..." : `Convert ${files.length} file${files.length > 1 ? "s" : ""} to WebP`}
                </Button>
              </div>

              <div className="mt-6">
                <Label>Selected Files ({files.length})</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {convertedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label>Converted Files ({convertedFiles.length})</Label>
                <Button
                  onClick={handleDownloadAll}
                  variant="outline"
                  size="sm"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>

              {convertedFiles.length > 1 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700">
                    <strong>Total compression:</strong> {formatFileSize(totalOriginalSize)} → {formatFileSize(totalWebpSize)} 
                    <span className="ml-2 font-semibold">({overallCompressionRatio}% smaller)</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {convertedFiles.map((convertedFile, index) => (
                  <div key={`converted-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{convertedFile.originalName}</h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(convertedFile.originalSize)} → {formatFileSize(convertedFile.webpSize)}
                          <span className="ml-2 text-green-600 font-medium">
                            ({calculateCompressionRatio(convertedFile.originalSize, convertedFile.webpSize)}% smaller)
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSingle(convertedFile)}
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="relative bg-gray-100 rounded p-2">
                      <img
                        src={convertedFile.webpDataUrl}
                        alt="WebP preview"
                        className="max-w-full max-h-32 mx-auto object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">About WebP Format</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              WebP is a modern image format that provides superior compression for images on the web. 
              It typically reduces file sizes by 25-35% compared to JPEG and PNG.
            </p>
            <p>
              <strong>Supported input formats:</strong> JPEG, PNG, GIF, BMP, TIFF, SVG, and existing WebP files.
            </p>
            <p>
              <strong>Benefits:</strong> Smaller file sizes, faster loading times, better web performance, and wide browser support.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}