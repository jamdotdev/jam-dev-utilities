import { useCallback, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import SpeedTestEngine from "@cloudflare/speedtest";
import { Card } from "@/components/ds/CardComponent";
import { cn } from "@/lib/utils";

type TestState = {
  status: "idle" | "running" | "finished";
  result: SpeedResult;
};

type SpeedResult = ReturnType<
  typeof SpeedTestEngine.prototype.results.getSummary
>;

const createSpeedTestEngine = () => {
  return new SpeedTestEngine({
    autoStart: false,
    measurements: [
      // Quick latency check (1-2 seconds)
      { type: "latency", numPackets: 5 },

      // Download test (4-5 seconds)
      { type: "download", bytes: 1e6, count: 2, bypassMinDuration: true },
      { type: "download", bytes: 1e7, count: 1, bypassMinDuration: true },

      // Upload test (4-5 seconds)
      { type: "upload", bytes: 1e6, count: 2, bypassMinDuration: true },
      { type: "upload", bytes: 1e7, count: 1, bypassMinDuration: true },
    ],
  });
};

const outlineStyles =
  "outline outline-2 outline-green-500 outline-offset-2 shadow-md transition";

export default function InternetSpeedTest() {
  const [testState, setTestState] = useState<TestState>({
    status: "idle",
    result: {} as SpeedResult,
  });

  const engineRef = useRef<SpeedTestEngine | null>(null);

  const toggleTest = useCallback(async () => {
    if (testState.status === "running") {
      engineRef.current?.pause?.();
      engineRef.current = null;
      setTestState({ status: "idle", result: {} });
      return;
    }

    setTestState({ status: "running", result: {} });
    const speedTest = createSpeedTestEngine();
    engineRef.current = speedTest;

    speedTest.onResultsChange = () => {
      if (engineRef.current !== speedTest) {
        return;
      }

      setTestState((prev) => ({
        ...prev,
        result: speedTest.results.getSummary(),
      }));
    };

    speedTest.onFinish = (final) => {
      if (engineRef.current !== speedTest) {
        return;
      }

      setTestState({ status: "finished", result: final.getSummary() });
      engineRef.current = null;
    };

    speedTest.onError = () => {
      if (engineRef.current !== speedTest) {
        return;
      }

      engineRef.current = null;
      setTestState({ status: "idle", result: {} });
    };

    speedTest.play();
  }, [testState.status]);

  return (
    <main>
      <Meta
        title="Internet Speed Test | Free, Open Source & Ad-free"
        description="Run a fast, privacy-friendly internet speed test (download, upload, latency & jitter) powered by Cloudflare."
      />
      <Header />
      <CMDK />

      <section className="container max-w-4xl mb-10">
        <PageHeader
          title="Internet Speed Test"
          description="Open source, ad-free speed test using Cloudflare edge."
        />
      </section>

      <section className="container max-w-4xl mb-12 space-y-8">
        <div className="grid gap-6 md:grid-cols-4 auto-rows-[180px]">
          <Card
            className={cn(
              "md:col-span-2 row-span-1 flex flex-col relative transition-shadow p-6",
              testState.status === "finished" && outlineStyles
            )}
          >
            <Label
              isRunning={testState.status === "running"}
              title="Download"
            />

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-5xl font-semibold tabular-nums leading-none">
                {((testState.result.download || 0) / 1_000_000).toFixed(2)}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  Mbps
                </span>
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "md:col-span-2 row-span-1 flex flex-col relative transition-shadow p-6",
              testState.status === "finished" && outlineStyles
            )}
          >
            <Label isRunning={testState.status === "running"} title="Upload" />

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-5xl font-semibold tabular-nums leading-none">
                {((testState.result.upload || 0) / 1_000_000).toFixed(2)}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  Mbps
                </span>
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "md:col-span-1 row-span-1 flex flex-col transition-shadow p-6",
              testState.status === "finished" && outlineStyles
            )}
          >
            <Label isRunning={testState.status === "running"} title="Latency" />

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-semibold tabular-nums leading-none">
                {(testState.result.latency || 0).toFixed(0)}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ms
                </span>
              </div>
            </div>
          </Card>
          <Card
            className={cn(
              "md:col-span-1 row-span-1 flex flex-col transition-shadow p-6",
              testState.status === "finished" && outlineStyles
            )}
          >
            <Label isRunning={testState.status === "running"} title="Jitter" />

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-4xl font-semibold tabular-nums leading-none">
                {(testState.result.jitter || 0).toFixed(1)}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ms
                </span>
              </div>
            </div>
          </Card>

          <Card
            className="md:col-span-2 row-span-1 flex flex-col cursor-pointer select-none group border-none bg-foreground"
            onClick={toggleTest}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTest();
              }
            }}
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="text-4xl font-semibold tracking-tight text-background">
                {getButtonLabel(testState.status)}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CallToActionGrid />
    </main>
  );
}

interface LabelProps {
  isRunning: boolean;
  title: string;
}

const Label = (props: LabelProps) => {
  return (
    <div className="flex items-center gap-2">
      <h4 className="text-sm font-medium tracking-wide text-muted-foreground">
        {props.title}
      </h4>
      {props.isRunning && <PulsatingCircle />}
    </div>
  );
};

const PulsatingCircle = () => {
  return (
    <div className="flex w-2 h-2 rounded-full animate-subtle-pulse bg-green-700" />
  );
};

const getButtonLabel = (status: TestState["status"]) => {
  switch (status) {
    case "idle":
      return "START";
    case "running":
      return "STOP";
    case "finished":
      return "RESTART";
    default:
      return "START";
  }
};
