import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { Input } from "@/components/ds/InputComponent";
import { ColorPicker } from "@/components/ds/ColorPickerComponent";
import WcagColorContrastCheckerSEO from "@/components/seo/WcagColorContrastCheckerSEO";
import CallToActionGrid from "@/components/CallToActionGrid";
import GitHubContribution from "@/components/GitHubContribution";
import Meta from "@/components/Meta";
import {
  calculateContrast,
  isValidHex,
  normalizeHexInput,
  getContrastDescription,
  WCAG,
} from "@/components/utils/wcag-color-contrast.utils";
import { AlertCircle, Star } from "lucide-react";
import { ComplianceBadge } from "@/components/WcagComplianceBadge";

const TEXT_CONTENT =
  "Jam makes developers' lives easier with powerful debugging tools." as const;

const DEFAULT_FOREGROUND_COLOR = "#000000";
const DEFAULT_BACKGROUND_COLOR = "#FFFFFF";

export default function WcagColorContrastChecker() {
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND_COLOR);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND_COLOR);

  const handleForegroundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const normalized = normalizeHexInput(event.target.value);
    setForeground(normalized);
  };

  const handleBackgroundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const normalized = normalizeHexInput(event.target.value);
    setBackground(normalized);
  };

  const fgValid = isValidHex(foreground);
  const bgValid = isValidHex(background);

  const contrastResult = useMemo(
    () =>
      calculateContrast({
        foregroundHex: foreground,
        backgroundHex: background,
      }),
    [foreground, background]
  );

  return (
    <main>
      <Meta
        title="WCAG Color Contrast Checker | Accessibility Tool | Free & Open Source"
        description="Check color contrast ratios for WCAG AA and AAA compliance. Ensure your designs meet accessibility standards with our free color contrast checker tool."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="WCAG Color Contrast Checker"
          description="Free, Open Source & Ad-free"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Foreground Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    placeholder="#000000"
                    onChange={handleForegroundChange}
                    className="h-8 text-sm max-w-[90px]"
                    value={foreground}
                    maxLength={7}
                  />
                  <ColorPicker
                    value={fgValid ? foreground : "#000000"}
                    onChange={setForeground}
                  />
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    placeholder="#FFFFFF"
                    onChange={handleBackgroundChange}
                    className="h-8 text-sm max-w-[90px]"
                    value={background}
                    maxLength={7}
                  />
                  <ColorPicker
                    value={bgValid ? background : "#FFFFFF"}
                    onChange={setBackground}
                  />
                </div>
              </div>
            </div>

            {fgValid && bgValid && contrastResult && (
              <>
                <Divider />
                <div>
                  <Label className="mb-3 block">Contrast Ratio</Label>
                  <div className="text-3xl font-bold mb-2">
                    {contrastResult.ratio.toFixed(2)}:1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getContrastDescription(contrastResult.ratio)}
                  </p>
                </div>
              </>
            )}

            {fgValid && bgValid && contrastResult && (
              <>
                <Divider />
                <div>
                  <Label className="mb-3 block">WCAG Compliance</Label>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Normal Text
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <ComplianceBadge
                          passed={contrastResult.aa.normal}
                          level={`WCAG AA (${WCAG.AA.NORMAL_THRESHOLD}:1)`}
                        />
                        <ComplianceBadge
                          passed={contrastResult.aaa.normal}
                          level={`WCAG AAA (${WCAG.AAA.NORMAL_THRESHOLD}:1)`}
                        />
                      </div>
                      <div
                        className="p-4 rounded border"
                        style={{ backgroundColor: background }}
                      >
                        <p
                          style={{
                            color: foreground,
                            fontSize: "16px",
                            fontWeight: "normal",
                          }}
                        >
                          {TEXT_CONTENT}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3">Large Text</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <ComplianceBadge
                          passed={contrastResult.aa.large}
                          level={`WCAG AA (${WCAG.AA.LARGE_THRESHOLD}:1)`}
                        />
                        <ComplianceBadge
                          passed={contrastResult.aaa.large}
                          level={`WCAG AAA (${WCAG.AAA.LARGE_THRESHOLD}:1)`}
                        />
                      </div>
                      <div
                        className="p-4 rounded border"
                        style={{ backgroundColor: background }}
                      >
                        <p
                          style={{
                            color: foreground,
                            fontSize: "24px",
                            fontWeight: "normal",
                          }}
                        >
                          {TEXT_CONTENT}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Graphical Objects and User Interface Components
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <ComplianceBadge
                          passed={contrastResult.aa.graphicalObjects}
                          level={`WCAG AA (${WCAG.AA.GRAPHICAL_OBJECTS_THRESHOLD}:1)`}
                        />
                      </div>
                      <div
                        className="p-4 rounded border flex flex-col items-center gap-3"
                        style={{ backgroundColor: background }}
                      >
                        <Star
                          size={24}
                          fill={foreground}
                          style={{ color: foreground }}
                        />
                        <Input
                          placeholder="Text Input"
                          className="w-full max-w-xs"
                          style={{
                            borderColor: foreground,
                            color: foreground,
                          }}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {(!fgValid || !bgValid) && (
              <>
                <Divider />
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Please enter valid hex color codes (e.g., #000000 or #FFF)
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>

      <GitHubContribution username="EduardoDePatta" />
      <CallToActionGrid />

      <section className="container max-w-2xl">
        <WcagColorContrastCheckerSEO />
      </section>
    </main>
  );
}

const Divider = () => {
  return <div className="bg-border h-[1px] my-6"></div>;
};
