import React, { useCallback, useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import { Slider } from "@/components/ds/SliderComponent";
import { Progress } from "@/components/ds/ProgressComponent";
import { Checkbox } from "@/components/ds/CheckboxComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { MultiFileUploadComponent } from "@/components/ds/MultiFileUploadComponent";
import { DownloadIcon, TrashIcon, FileImageIcon } from "lucide-react";
import GitHubContribution from "@/components/GitHubContribution";
import WebPConverterSEO from "@/components/seo/WebPConverterSEO";
import {
  batchConvertToWebP,
  downloadWebPZip,
  formatFileSize,
  filterSupportedImages,
  cleanup,
  ConversionResult,
} from "@/components/utils/webp-converter.utils";

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB per file

interface FileItem {
  file: File;
  id: string;
}

export default function WebPConverter() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState<
    ConversionResult[]
  >([]);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  // Load quality and auto-download from localStorage on mount
  useEffect(() => {
    const savedQuality = localStorage.getItem("webp-converter-quality");
    if (savedQuality) {
      const parsedQuality = parseInt(savedQuality);
      if (parsedQuality >= 1 && parsedQuality <= 100) {
        setQuality(parsedQuality);
      }
    }

    const savedAutoDownload = localStorage.getItem(
      "webp-converter-auto-download"
    );
    if (savedAutoDownload) {
      setAutoDownload(savedAutoDownload === "true");
    }
  }, []);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    const supportedFiles = filterSupportedImages(selectedFiles);
    const newFileItems: FileItem[] = supportedFiles.map((file, index) => ({
      file,
      id: `${Date.now()}-${index}`,
    }));

    setFiles((prev) => [...prev, ...newFileItems]);
    setConversionResults([]); // Clear previous results
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setConversionResults([]);
    setProgress(null);
  }, []);

  const handleQualityChange = useCallback((value: number[]) => {
    const newQuality = Math.max(1, Math.min(100, value[0]));
    setQuality(newQuality);
    localStorage.setItem("webp-converter-quality", newQuality.toString());
  }, []);

  const handleQualityInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      const newQuality = Math.max(1, Math.min(100, value));
      setQuality(newQuality);
      localStorage.setItem("webp-converter-quality", newQuality.toString());
    },
    []
  );

  const handleAutoDownloadChange = useCallback((checked: boolean) => {
    setAutoDownload(checked);
    localStorage.setItem("webp-converter-auto-download", checked.toString());
  }, []);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress({ completed: 0, total: files.length });
    setConversionResults([]);

    try {
      const result = await batchConvertToWebP(
        files.map((f) => f.file),
        { quality },
        (completed, total) => {
          setProgress({ completed, total });
        }
      );

      setConversionResults(result.results);

      // Auto-download if enabled and we have successful results
      if (autoDownload) {
        const successfulResults = result.results.filter((r) => r.success);
        if (successfulResults.length > 0) {
          await downloadWebPZip(successfulResults);
        }
      }
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  }, [files, quality, autoDownload]);

  const handleDownloadAll = useCallback(async () => {
    if (conversionResults.length === 0) return;

    const successfulResults = conversionResults.filter((r) => r.success);
    if (successfulResults.length > 0) {
      await downloadWebPZip(successfulResults);
    }
  }, [conversionResults]);

  const totalOriginalSize = useMemo(() => {
    return files.reduce((sum, item) => sum + item.file.size, 0);
  }, [files]);

  const conversionStats = useMemo(() => {
    if (conversionResults.length === 0) return null;

    const successful = conversionResults.filter((r) => r.success);
    const totalOriginal = conversionResults.reduce(
      (sum, r) => sum + r.originalSize,
      0
    );
    const totalWebP = conversionResults.reduce((sum, r) => sum + r.webpSize, 0);
    const compressionRatio =
      totalOriginal > 0
        ? ((totalOriginal - totalWebP) / totalOriginal) * 100
        : 0;

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
                  <div>
                    <Label className="text-base font-semibold">
                      Selected Files ({files.length})
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total size: {formatFileSize(totalOriginalSize)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFiles}
                    className="h-9"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                          <FileImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {item.file.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(item.file.size)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(item.id)}
                        className="h-8 w-8 p-0 ml-3 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="mb-6">
                  <Label className="mb-3 block text-sm font-medium">
                    Quality: {quality}%
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[quality]}
                      onValueChange={handleQualityChange}
                      max={100}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={handleQualityInputChange}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lower quality = smaller file size, higher quality = better
                    image quality
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-download"
                      checked={autoDownload}
                      onCheckedChange={handleAutoDownloadChange}
                    />
                    <Label
                      htmlFor="auto-download"
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 m-0"
                    >
                      Automatically download after conversion
                    </Label>
                  </div>
                </div>

                <Divider />

                <div className="flex gap-4">
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
                      disabled={
                        conversionResults.filter((r) => r.success).length === 0
                      }
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>

                {progress && (
                  <div className="mb-4 py-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Converting images...</span>
                      <span className="text-muted-foreground">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    <Progress
                      value={(progress.completed / progress.total) * 100}
                    />
                  </div>
                )}

                {conversionStats && (
                  <>
                    <Divider />
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          {conversionStats.successful}{" "}
                          {conversionStats.successful === 1
                            ? "image"
                            : "images"}{" "}
                          converted successfully
                          {conversionStats.failed > 0 && (
                            <span className="text-red-600 ml-1">
                              • {conversionStats.failed} failed
                            </span>
                          )}
                        </h3>

                        {/* Results Section - Full Width */}
                        <div className="border border-border rounded-lg p-6 bg-card">
                          {/* Size Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                Original Size
                              </div>
                              <div className="text-xl font-bold">
                                {formatFileSize(conversionStats.totalOriginal)}
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <div className="text-2xl text-muted-foreground">
                                →
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                WebP Size
                              </div>
                              <div className="text-xl font-bold">
                                {formatFileSize(conversionStats.totalWebP)}
                              </div>
                            </div>
                          </div>

                          {/* Savings Display */}
                          <div className="pt-6 border-t border-border text-center">
                            <div className="space-y-2">
                              <div className="text-3xl font-bold text-green-600">
                                {conversionStats.compressionRatio.toFixed(1)}%
                                reduction
                              </div>
                              <div className="text-lg font-medium text-green-600">
                                {formatFileSize(
                                  conversionStats.totalOriginal -
                                    conversionStats.totalWebP
                                )}{" "}
                                saved
                              </div>
                            </div>
                          </div>
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

      <section className="container max-w-2xl">
        <WebPConverterSEO />
      </section>
    </main>
  );
}

const Divider = () => {
  return <div className="h-[1px] bg-muted my-6"></div>;
};
