import React, { useCallback, useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { MultiFileUploadComponent } from "@/components/ds/MultiFileUploadComponent";
import { DownloadIcon, TrashIcon, FileImageIcon } from "lucide-react";
import GitHubContribution from "@/components/GitHubContribution";
import {
  batchConvertToWebP,
  downloadWebPZip,
  formatFileSize,
  filterSupportedImages,
  cleanup,
  ConversionResult,
} from "@/components/utils/webp-converter.utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

interface FileItem {
  file: File;
  id: string;
}

export default function WebPConverter() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([]);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const supportedFiles = filterSupportedImages(selectedFiles);
    const newFileItems: FileItem[] = supportedFiles.map((file, index) => ({
      file,
      id: `${Date.now()}-${index}`,
    }));
    
    setFiles(prev => [...prev, ...newFileItems]);
    setConversionResults([]); // Clear previous results
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setConversionResults([]);
    setProgress(null);
  }, []);

  const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuality(Math.max(1, Math.min(100, value)));
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress({ completed: 0, total: files.length });
    setConversionResults([]);

    try {
      const result = await batchConvertToWebP(
        files.map(f => f.file),
        { quality },
        (completed, total) => {
          setProgress({ completed, total });
        }
      );

      setConversionResults(result.results);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  }, [files, quality]);

  const handleDownloadAll = useCallback(async () => {
    if (conversionResults.length === 0) return;
    
    const successfulResults = conversionResults.filter(r => r.success);
    if (successfulResults.length > 0) {
      await downloadWebPZip(successfulResults);
    }
  }, [conversionResults]);

  const totalOriginalSize = useMemo(() => {
    return files.reduce((sum, item) => sum + item.file.size, 0);
  }, [files]);

  const conversionStats = useMemo(() => {
    if (conversionResults.length === 0) return null;

    const successful = conversionResults.filter(r => r.success);
    const totalOriginal = conversionResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalWebP = conversionResults.reduce((sum, r) => sum + r.webpSize, 0);
    const compressionRatio = totalOriginal > 0 ? ((totalOriginal - totalWebP) / totalOriginal) * 100 : 0;

    return {
      successful: successful.length,
      failed: conversionResults.length - successful.length,
      totalOriginal,
      totalWebP,
      compressionRatio,
    };
  }, [conversionResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <main>
      <Meta
        title="WebP Converter | Free, Open Source & Ad-free"
        description="Convert images to WebP format with batch processing and quality control. Fast, free, open source, ad-free tools."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="WebP Converter"
          description="Convert images to WebP format with batch processing and quality control."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <MultiFileUploadComponent
              maxFileSize={MAX_FILE_SIZE}
              onFilesSelect={handleFilesSelect}
              multiple={true}
              acceptedTypes={["image/*"]}
            />

            {files.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4 pt-6">
                  <Label className="text-sm font-medium">
                    Selected Files ({files.length})
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFiles}
                    className="h-8"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2 mb-4">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-sm"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <FileImageIcon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate mr-2">{item.file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatFileSize(item.file.size)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(item.id)}
                        className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Total size: {formatFileSize(totalOriginalSize)}
                </div>

                <Divider />

                <div className="mb-6">
                  <Label className="mb-2 block">Quality: {quality}%</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={handleQualityChange}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={handleQualityChange}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower quality = smaller file size, higher quality = better image quality
                  </p>
                </div>

                <Divider />

                <div className="flex gap-4 mb-6">
                  <Button
                    className="flex-1"
                    onClick={handleConvert}
                    disabled={isConverting || files.length === 0}
                  >
                    {isConverting ? "Converting..." : "Convert to WebP"}
                  </Button>

                  {conversionResults.length > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleDownloadAll}
                      disabled={conversionResults.filter(r => r.success).length === 0}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>

                {progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Converting...</span>
                      <span>{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {conversionStats && (
                  <>
                    <Divider />
                    <div className="space-y-2">
                      <Label>Conversion Results</Label>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Successful:</span>{" "}
                          <span className="font-medium text-green-600">{conversionStats.successful}</span>
                        </div>
                        {conversionStats.failed > 0 && (
                          <div>
                            <span className="text-muted-foreground">Failed:</span>{" "}
                            <span className="font-medium text-red-600">{conversionStats.failed}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Original size:</span>{" "}
                          <span className="font-medium">{formatFileSize(conversionStats.totalOriginal)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">WebP size:</span>{" "}
                          <span className="font-medium">{formatFileSize(conversionStats.totalWebP)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Compression ratio:</span>{" "}
                          <span className="font-medium text-green-600">
                            {conversionStats.compressionRatio.toFixed(1)}% reduction
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </section>

      <GitHubContribution username="copilot" />
      <CallToActionGrid />
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-muted my-6"></div>;
};