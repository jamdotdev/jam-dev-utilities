import React, { useCallback, useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
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

export default function InternetSpeedTest() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [results, setResults] = useState<SpeedTestResult>({});
  const [error, setError] = useState<string>("");
  const speedTestRef = useRef<{ pause: () => void; restart: () => void } | null>(null);

  const startTest = useCallback(async () => {
    try {
      setTestState("running");
      setError("");
      setResults({});

      const speedTest = await createSpeedTest();
      speedTestRef.current = speedTest;

      speedTest.onResultsChange = () => {
        const currentResults = speedTest.results.getSummary();
        setResults(currentResults);
      };

      speedTest.onFinish = (finalResults) => {
        const summary = finalResults.getSummary();
        setResults(summary);
        setTestState("finished");
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
  }, []);

  const resetTest = useCallback(() => {
    if (speedTestRef.current) {
      speedTestRef.current.restart();
    }
    setTestState("idle");
    setResults({});
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

      <section className="container max-w-4xl mb-6">
        <Card className="flex flex-col p-8 hover:shadow-none shadow-none rounded-xl">
          {/* Test Control Section */}
          <div className="flex items-center justify-center mb-12 min-h-[120px]">
            {testState === "idle" && (
              <Button onClick={startTest} className="px-12 py-4 text-lg font-medium">
                Start Speed Test
              </Button>
            )}

            {testState === "running" && (
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full animate-ping"></div>
                  </div>
                </div>
                <p className="text-lg font-medium">Testing your connection...</p>
                <Button onClick={stopTest} variant="outline" className="px-8">
                  Stop Test
                </Button>
              </div>
            )}

            {testState === "finished" && (
              <Button onClick={resetTest} variant="outline" className="px-8 py-3">
                Test Again
              </Button>
            )}

            {testState === "error" && (
              <div className="text-center space-y-4">
                <p className="text-red-600 font-medium">{error}</p>
                <Button onClick={resetTest} variant="outline" className="px-8">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Bento Grid Results */}
          {(testState === "running" || testState === "finished") && Object.keys(results).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
              {/* Download Speed - Large Card */}
              <div className="md:col-span-2 md:row-span-2">
                <Card className="h-full p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <Label className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Download Speed
                    </Label>
                    <div className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                      {formatSpeed(results.download)}
                    </div>
                    {downloadCategory && testState === "finished" && (
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                          {downloadCategory.category}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 max-w-xs">
                          {downloadCategory.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Upload Speed - Large Card */}
              <div className="md:col-span-2 md:row-span-2">
                <Card className="h-full p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <Label className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Upload Speed
                    </Label>
                    <div className="text-4xl md:text-5xl font-bold text-green-900 dark:text-green-100 mb-3">
                      {formatSpeed(results.upload)}
                    </div>
                    {uploadCategory && testState === "finished" && (
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                          {uploadCategory.category}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 max-w-xs">
                          {uploadCategory.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Latency - Small Card */}
              <div className="md:col-span-2">
                <Card className="h-full p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50 dark:border-purple-800/50">
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <Label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Latency
                    </Label>
                    <div className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {formatLatency(results.latency)}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Jitter - Small Card */}
              <div className="md:col-span-2">
                <Card className="h-full p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-800/50">
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <Label className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                      Jitter
                    </Label>
                    <div className="text-2xl md:text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {formatLatency(results.jitter)}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Additional metrics if available */}
              {results.packetLoss !== undefined && (
                <div className="md:col-span-2">
                  <Card className="h-full p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-red-200/50 dark:border-red-800/50">
                    <div className="h-full flex flex-col justify-center items-center text-center">
                      <Label className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Packet Loss
                      </Label>
                      <div className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">
                        {formatPacketLoss(results.packetLoss)}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {results.downLoadedLatency !== undefined && (
                <div className="md:col-span-2">
                  <Card className="h-full p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 border-indigo-200/50 dark:border-indigo-800/50">
                    <div className="h-full flex flex-col justify-center items-center text-center">
                      <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                        Loaded Latency
                      </Label>
                      <div className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                        {formatLatency(results.downLoadedLatency)}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-4xl">
        <InternetSpeedTestSEO />
      </section>
    </main>
  );
}