import React, { useCallback, useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
import { Progress } from "@/components/ds/ProgressComponent";
import {
  createSpeedTest,
  formatSpeed,
  formatLatency,
  formatPacketLoss,
  getSpeedCategory,
  SpeedTestResult,
} from "@/components/utils/internet-speed-test.utils";
import InternetSpeedTestSEO from "@/components/seo/InternetSpeedTestSEO";

type TestState = "idle" | "running" | "finished" | "error";

interface TestProgress {
  download: number;
  upload: number;
  latency: number;
  overall: number;
}

export default function InternetSpeedTest() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [results, setResults] = useState<SpeedTestResult>({});
  const [progress, setProgress] = useState<TestProgress>({
    download: 0,
    upload: 0,
    latency: 0,
    overall: 0,
  });
  const [error, setError] = useState<string>("");
  const speedTestRef = useRef<{ pause: () => void; restart: () => void } | null>(null);

  const startTest = useCallback(async () => {
    try {
      setTestState("running");
      setError("");
      setResults({});
      setProgress({ download: 0, upload: 0, latency: 0, overall: 0 });

      const speedTest = await createSpeedTest();
      speedTestRef.current = speedTest;

      let downloadComplete = false;
      let uploadComplete = false;
      let latencyComplete = false;

      speedTest.onResultsChange = ({ type }) => {
        const currentResults = speedTest.results.getSummary();
        setResults(currentResults);

        // Update progress based on completed measurements
        if (type === "latency" && currentResults.latency !== undefined) {
          latencyComplete = true;
        }
        if (type === "download" && currentResults.download !== undefined) {
          downloadComplete = true;
        }
        if (type === "upload" && currentResults.upload !== undefined) {
          uploadComplete = true;
        }

        const newProgress = {
          latency: latencyComplete ? 100 : 0,
          download: downloadComplete ? 100 : currentResults.download ? 50 : 0,
          upload: uploadComplete ? 100 : currentResults.upload ? 50 : 0,
          overall: 0,
        };

        // Calculate overall progress
        const completedTests = [latencyComplete, downloadComplete, uploadComplete].filter(Boolean).length;
        newProgress.overall = (completedTests / 3) * 100;

        setProgress(newProgress);
      };

      speedTest.onFinish = (finalResults) => {
        const summary = finalResults.getSummary();
        setResults(summary);
        setTestState("finished");
        setProgress({ download: 100, upload: 100, latency: 100, overall: 100 });
      };

      speedTest.onError = (errorMsg) => {
        setError(errorMsg);
        setTestState("error");
      };

      speedTest.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start speed test");
      setTestState("error");
    }
  }, []);

  const stopTest = useCallback(() => {
    if (speedTestRef.current) {
      speedTestRef.current.pause();
    }
    setTestState("idle");
    setProgress({ download: 0, upload: 0, latency: 0, overall: 0 });
  }, []);

  const resetTest = useCallback(() => {
    if (speedTestRef.current) {
      speedTestRef.current.restart();
    }
    setTestState("idle");
    setResults({});
    setProgress({ download: 0, upload: 0, latency: 0, overall: 0 });
    setError("");
  }, []);

  const downloadCategory = results.download ? getSpeedCategory(results.download / 1_000_000) : null;
  const uploadCategory = results.upload ? getSpeedCategory(results.upload / 1_000_000) : null;

  return (
    <main>
      <Meta
        title="Internet Speed Test | Free, Open Source & Ad-free"
        description="Test your internet connection speed with accurate measurements of download speed, upload speed, latency, and connection quality using Cloudflare's global network."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Internet Speed Test"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="text-center mb-8">
            {testState === "idle" && (
              <Button onClick={startTest} className="w-full sm:w-auto px-8 py-3 text-lg">
                Start Speed Test
              </Button>
            )}

            {testState === "running" && (
              <div className="space-y-4">
                <Button onClick={stopTest} variant="outline" className="w-full sm:w-auto">
                  Stop Test
                </Button>
                <div>
                  <Label className="text-sm text-muted-foreground">Overall Progress</Label>
                  <Progress value={progress.overall} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Testing your connection...
                  </p>
                </div>
              </div>
            )}

            {testState === "finished" && (
              <Button onClick={resetTest} variant="outline" className="w-full sm:w-auto">
                Test Again
              </Button>
            )}

            {testState === "error" && (
              <div className="space-y-4">
                <p className="text-red-600 text-sm">{error}</p>
                <Button onClick={resetTest} variant="outline" className="w-full sm:w-auto">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Results Display */}
          {(testState === "running" || testState === "finished") && (
            <div className="space-y-6">
              {/* Download Speed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Download Speed</Label>
                  <span className="text-2xl font-bold">
                    {formatSpeed(results.download)}
                  </span>
                </div>
                <Progress value={progress.download} className="mb-2" />
                {downloadCategory && testState === "finished" && (
                  <p className={`text-sm ${downloadCategory.color}`}>
                    {downloadCategory.category} - {downloadCategory.description}
                  </p>
                )}
              </div>

              {/* Upload Speed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Upload Speed</Label>
                  <span className="text-2xl font-bold">
                    {formatSpeed(results.upload)}
                  </span>
                </div>
                <Progress value={progress.upload} className="mb-2" />
                {uploadCategory && testState === "finished" && (
                  <p className={`text-sm ${uploadCategory.color}`}>
                    {uploadCategory.category} - {uploadCategory.description}
                  </p>
                )}
              </div>

              {/* Latency and Additional Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm">Latency</Label>
                  <div className="text-xl font-bold mt-1">
                    {formatLatency(results.latency)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm">Jitter</Label>
                  <div className="text-xl font-bold mt-1">
                    {formatLatency(results.jitter)}
                  </div>
                </div>
              </div>

              {/* Additional metrics if available */}
              {(results.packetLoss !== undefined || results.downLoadedLatency !== undefined) && (
                <div className="grid grid-cols-2 gap-4">
                  {results.packetLoss !== undefined && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm">Packet Loss</Label>
                      <div className="text-xl font-bold mt-1">
                        {formatPacketLoss(results.packetLoss)}
                      </div>
                    </div>
                  )}
                  
                  {results.downLoadedLatency !== undefined && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm">Loaded Latency</Label>
                      <div className="text-xl font-bold mt-1">
                        {formatLatency(results.downLoadedLatency)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <InternetSpeedTestSEO />
      </section>
    </main>
  );
}