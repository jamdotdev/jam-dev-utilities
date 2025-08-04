import { useCallback, useState, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { Input } from "@/components/ds/InputComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { ImageUploadComponent } from "@/components/ds/ImageUploadComponent";
import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import GitHubContribution from "@/components/GitHubContribution";
import QrCodeSEO from "@/components/seo/QrCodeSEO";
import {
  QRCodeGenerator,
  QRCodeFormat,
  QRCodeErrorCorrectionLevel,
  QRCodeDotsType,
  QRCodeCornerSquareType,
  QRCodeCornerDotType,
  createQRCode,
  validateQRCodeText,
  validateImageFile,
  imageToBase64,
  getErrorCorrectionLevels,
  getDotsTypeOptions,
  getCornerSquareTypeOptions,
  getCornerDotTypeOptions,
} from "@/components/utils/qr-code-generator.utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormatOption {
  value: QRCodeFormat;
  label: string;
}

const formatOptions: FormatOption[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
];

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [qrCodeInstance, setQrCodeInstance] = useState<QRCodeGenerator | null>(null);
  const [format, setFormat] = useState<QRCodeFormat>("png");
  const [size, setSize] = useState(300);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QRCodeErrorCorrectionLevel>("M");
  const [dotsType, setDotsType] = useState<QRCodeDotsType>("square");
  const [dotsColor, setDotsColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [cornerSquareType, setCornerSquareType] = useState<QRCodeCornerSquareType>("square");
  const [cornerSquareColor, setCornerSquareColor] = useState("#000000");
  const [cornerDotType, setCornerDotType] = useState<QRCodeCornerDotType>("square");
  const [cornerDotColor, setCornerDotColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [logoSize, setLogoSize] = useState(0.4);
  const [logoMargin, setLogoMargin] = useState(8);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Initialize QR code instance
  useEffect(() => {
    const qr = createQRCode({
      text: text || "https://jam.dev",
      width: size,
      height: size,
      format,
      errorCorrectionLevel,
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        color: cornerSquareColor,
        type: cornerSquareType,
      },
      cornersDotOptions: {
        color: cornerDotColor,
        type: cornerDotType,
      },
      image: logoBase64,
      imageOptions: {
        hideBackgroundDots,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: "anonymous",
      },
    });

    setQrCodeInstance(qr);

    return () => {
      // Cleanup if needed
    };
  }, [
    text,
    size,
    format,
    errorCorrectionLevel,
    dotsType,
    dotsColor,
    backgroundColor,
    cornerSquareType,
    cornerSquareColor,
    cornerDotType,
    cornerDotColor,
    logoBase64,
    logoSize,
    logoMargin,
    hideBackgroundDots,
  ]);

  // Update QR code when options change
  useEffect(() => {
    const updateQRCode = async () => {
      if (qrCodeInstance && qrContainerRef.current) {
        setIsGenerating(true);
        
        try {
          qrCodeInstance.update({
            text: text || "https://jam.dev",
            width: size,
            height: size,
            errorCorrectionLevel,
            dotsOptions: {
              color: dotsColor,
              type: dotsType,
            },
            backgroundOptions: {
              color: backgroundColor,
            },
            cornersSquareOptions: {
              color: cornerSquareColor,
              type: cornerSquareType,
            },
            cornersDotOptions: {
              color: cornerDotColor,
              type: cornerDotType,
            },
            image: logoBase64,
            imageOptions: {
              hideBackgroundDots,
              imageSize: logoSize,
              margin: logoMargin,
              crossOrigin: "anonymous",
            },
          });

          // Re-render the QR code
          await qrCodeInstance.append(qrContainerRef.current);
        } catch (error) {
          console.error('Error updating QR code:', error);
        }
        
        setTimeout(() => setIsGenerating(false), 300);
      }
    };

    updateQRCode();
  }, [
    qrCodeInstance,
    text,
    size,
    errorCorrectionLevel,
    dotsType,
    dotsColor,
    backgroundColor,
    cornerSquareType,
    cornerSquareColor,
    cornerDotType,
    cornerDotColor,
    logoBase64,
    logoSize,
    logoMargin,
    hideBackgroundDots,
  ]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleFormatSelect = useCallback((value: string) => {
    setFormat(value as QRCodeFormat);
  }, []);

  const handleErrorCorrectionSelect = useCallback((value: string) => {
    setErrorCorrectionLevel(value as QRCodeErrorCorrectionLevel);
  }, []);

  const handleDotsTypeSelect = useCallback((value: string) => {
    setDotsType(value as QRCodeDotsType);
  }, []);

  const handleCornerSquareTypeSelect = useCallback((value: string) => {
    setCornerSquareType(value as QRCodeCornerSquareType);
  }, []);

  const handleCornerDotTypeSelect = useCallback((value: string) => {
    setCornerDotType(value as QRCodeCornerDotType);
  }, []);

  const handleLogoSelect = useCallback(async (file: File) => {
    if (validateImageFile(file)) {
      setLogoFile(file);
      try {
        const base64 = await imageToBase64(file);
        setLogoBase64(base64);
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (qrCodeInstance) {
      try {
        await qrCodeInstance.download(format);
      } catch (error) {
        console.error("Error downloading QR code:", error);
      }
    }
  }, [qrCodeInstance, format]);

  const handleRemoveLogo = useCallback(() => {
    setLogoFile(null);
    setLogoBase64("");
  }, []);

  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Math.max(100, Math.min(800, parseInt(e.target.value) || 300));
    setSize(newSize);
  }, []);

  const handleLogoSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Math.max(0.1, Math.min(0.8, parseFloat(e.target.value) || 0.4));
    setLogoSize(newSize);
  }, []);

  const handleLogoMarginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMargin = Math.max(0, Math.min(20, parseInt(e.target.value) || 8));
    setLogoMargin(newMargin);
  }, []);

  const isValidText = validateQRCodeText(text);

  return (
    <main>
      <Meta
        title="QR Code Generator | Free, Open Source & Ad-free"
        description="Create customizable QR codes with logos, colors, and styles. Generate professional QR codes for marketing, business cards, and digital campaigns. Free download as PNG, SVG, JPEG, or WebP."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-12">
        <PageHeader
          title="QR Code Generator"
          description="Create professional QR codes with custom logos, colors, and styles."
        />
      </section>

      <section className="container max-w-6xl mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <Label htmlFor="qr-text" className="mb-2">
                  Text or URL
                </Label>
                <Textarea
                  id="qr-text"
                  placeholder="Enter text, URL, or any data to encode..."
                  value={text}
                  onChange={handleTextChange}
                  className="min-h-[80px]"
                />
                {!isValidText && text && (
                  <p className="text-sm text-red-500 mt-1">Please enter some text to generate a QR code</p>
                )}
              </div>

              {/* Size and Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size" className="mb-2">
                    Size (px)
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    min="100"
                    max="800"
                    value={size}
                    onChange={handleSizeChange}
                  />
                </div>
                <div>
                  <Label className="mb-2">Format</Label>
                  <Combobox
                    data={formatOptions}
                    value={format}
                    onSelect={handleFormatSelect}
                  />
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <Label className="mb-2">Error Correction Level</Label>
                <Combobox
                  data={getErrorCorrectionLevels()}
                  value={errorCorrectionLevel}
                  onSelect={handleErrorCorrectionSelect}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher levels support logos better but create larger QR codes
                </p>
              </div>

              {/* Style Options */}
              <div>
                <Label className="mb-2">Dots Style</Label>
                <Combobox
                  data={getDotsTypeOptions()}
                  value={dotsType}
                  onSelect={handleDotsTypeSelect}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dots-color" className="mb-2">
                    Foreground Color
                  </Label>
                  <Input
                    id="dots-color"
                    type="color"
                    value={dotsColor}
                    onChange={(e) => setDotsColor(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bg-color" className="mb-2">
                    Background Color
                  </Label>
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
              </div>

              {/* Corner Styles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Corner Square Style</Label>
                  <Combobox
                    data={getCornerSquareTypeOptions()}
                    value={cornerSquareType}
                    onSelect={handleCornerSquareTypeSelect}
                  />
                </div>
                <div>
                  <Label className="mb-2">Corner Dot Style</Label>
                  <Combobox
                    data={getCornerDotTypeOptions()}
                    value={cornerDotType}
                    onSelect={handleCornerDotTypeSelect}
                  />
                </div>
              </div>

              {/* Corner Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corner-square-color" className="mb-2">
                    Corner Square Color
                  </Label>
                  <Input
                    id="corner-square-color"
                    type="color"
                    value={cornerSquareColor}
                    onChange={(e) => setCornerSquareColor(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="corner-dot-color" className="mb-2">
                    Corner Dot Color
                  </Label>
                  <Input
                    id="corner-dot-color"
                    type="color"
                    value={cornerDotColor}
                    onChange={(e) => setCornerDotColor(e.target.value)}
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <Label className="mb-2">Logo (Optional)</Label>
                <ImageUploadComponent
                  maxFileSize={MAX_FILE_SIZE}
                  onFileSelect={handleLogoSelect}
                />
                {logoFile && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{logoFile.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Logo Options */}
              {logoBase64 && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium">Logo Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo-size" className="mb-2">
                        Logo Size (0.1 - 0.8)
                      </Label>
                      <Input
                        id="logo-size"
                        type="number"
                        min="0.1"
                        max="0.8"
                        step="0.1"
                        value={logoSize}
                        onChange={handleLogoSizeChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo-margin" className="mb-2">
                        Logo Margin (0 - 20)
                      </Label>
                      <Input
                        id="logo-margin"
                        type="number"
                        min="0"
                        max="20"
                        value={logoMargin}
                        onChange={handleLogoMarginChange}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hide-bg-dots"
                      checked={hideBackgroundDots}
                      onChange={(e) => setHideBackgroundDots(e.target.checked)}
                    />
                    <Label htmlFor="hide-bg-dots" className="mb-0">
                      Hide background dots behind logo
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preview and Download */}
          <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Preview</h3>
                {isGenerating && (
                  <RefreshCwIcon className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="flex justify-center items-center min-h-[300px] bg-gray-50 rounded-lg">
                <div
                  ref={qrContainerRef}
                  className="flex justify-center items-center"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={!qrCodeInstance || isGenerating}
                  className="flex-1"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download {format.toUpperCase()}
                </Button>
              </div>

              {qrCodeInstance && (
                <div className="text-sm text-muted-foreground text-center">
                  <p>
                    Size: {size} × {size}px | Format: {format.toUpperCase()}
                  </p>
                  {logoFile && (
                    <p>With logo: {logoFile.name}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      <CallToActionGrid />
      
      <section className="container max-w-4xl">
        <QrCodeSEO />
      </section>

      <GitHubContribution username="copilot" />
    </main>
  );
}