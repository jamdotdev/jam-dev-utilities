import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { cn } from "@/lib/utils";

type CameraStatus = "idle" | "requesting" | "active" | "pip" | "error";

type ErrorType =
  | "permission_denied"
  | "not_supported"
  | "pip_not_supported"
  | "stream_error";

interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  instructions: string[];
}

const getPermissionDeniedError = (): ErrorInfo => ({
  type: "permission_denied",
  title: "Camera Access Denied",
  message:
    "You've denied camera access. To use this feature, you'll need to enable camera permissions in your browser.",
  instructions: [
    "Look for the camera icon in your browser's address bar and click it to change permissions",
    "Alternatively, go to your browser's Settings > Privacy & Security > Site Settings > Camera",
    "Find this website and change the camera permission to 'Allow'",
    "Refresh this page after enabling camera access",
  ],
});

const getNotSupportedError = (): ErrorInfo => ({
  type: "not_supported",
  title: "Camera Not Supported",
  message:
    "Your browser doesn't support camera access. This feature requires a modern browser with MediaDevices API support.",
  instructions: [
    "Try using a modern browser like Chrome, Edge, Safari, or Firefox",
    "Make sure your browser is up to date",
    "If you're on iOS, use Safari as other browsers have limited camera support",
  ],
});

const getPipNotSupportedError = (): ErrorInfo => ({
  type: "pip_not_supported",
  title: "Picture-in-Picture Not Supported",
  message:
    "Your browser doesn't support Picture-in-Picture mode. You can still use the camera preview on this page.",
  instructions: [
    "Picture-in-Picture works best in Chrome, Edge, and Safari",
    "Firefox has limited PIP support for camera streams",
    "Try updating your browser to the latest version",
  ],
});

const getStreamError = (errorMessage?: string): ErrorInfo => ({
  type: "stream_error",
  title: "Camera Error",
  message:
    errorMessage ||
    "An error occurred while accessing your camera. Please try again.",
  instructions: [
    "Make sure no other application is using your camera",
    "Check that your camera is properly connected",
    "Try refreshing the page and granting camera access again",
  ],
});

export default function CameraUtility() {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isPipSupported, setIsPipSupported] = useState(true);
  const [isMediaSupported, setIsMediaSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsPipSupported(
      typeof document !== "undefined" &&
        "pictureInPictureEnabled" in document &&
        document.pictureInPictureEnabled
    );
    setIsMediaSupported(
      typeof navigator !== "undefined" &&
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
    );
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePipExit = () => {
      if (status === "pip") {
        setStatus("active");
      }
    };

    video.addEventListener("leavepictureinpicture", handlePipExit);
    return () => {
      video.removeEventListener("leavepictureinpicture", handlePipExit);
    };
  }, [status]);

  const startCamera = useCallback(async () => {
    if (!isMediaSupported) {
      setErrorInfo(getNotSupportedError());
      setStatus("error");
      return;
    }

    setStatus("requesting");
    setErrorInfo(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("active");
    } catch (err) {
      const error = err as Error;

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setErrorInfo(getPermissionDeniedError());
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setErrorInfo(
          getStreamError(
            "No camera found. Please connect a camera and try again."
          )
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        setErrorInfo(
          getStreamError(
            "Camera is in use by another application. Please close other apps using the camera and try again."
          )
        );
      } else {
        setErrorInfo(getStreamError(error.message));
      }

      setStatus("error");
    }
  }, [isMediaSupported]);

  const enablePip = useCallback(async () => {
    if (!videoRef.current) return;

    if (!isPipSupported) {
      setErrorInfo(getPipNotSupportedError());
      return;
    }

    try {
      await videoRef.current.requestPictureInPicture();
      setStatus("pip");
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setErrorInfo({
          type: "pip_not_supported",
          title: "PIP Request Denied",
          message:
            "Picture-in-Picture was blocked. This usually happens if the request wasn't triggered by a user action.",
          instructions: ["Try clicking the button again"],
        });
      }
    }
  }, [isPipSupported]);

  const exitPip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      setStatus("active");
    } catch {
      setStatus("active");
    }
  }, []);

  const stopCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {
      // Ignore errors when exiting PIP
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
    setErrorInfo(null);
  }, []);

  const retry = useCallback(() => {
    setErrorInfo(null);
    setStatus("idle");
  }, []);

  return (
    <main>
      <Meta
        title="Camera with Picture-in-Picture | Free, Open Source & Ad-free"
        description="Use your camera with Picture-in-Picture mode for a floating camera overlay that stays on top of all applications."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-10">
        <PageHeader
          title="Camera with Picture-in-Picture"
          description="A floating camera overlay that stays on top of all applications."
        />
      </section>

      <section className="container max-w-2xl mb-12">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-6 text-center">
                Click the button below to start your camera and enable
                Picture-in-Picture mode.
              </p>
              <Button size="lg" onClick={startCamera}>
                Turn Camera On
              </Button>
            </div>
          )}

          {status === "requesting" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                <p className="text-muted-foreground">
                  Requesting camera access...
                </p>
              </div>
            </div>
          )}

          {status === "error" && errorInfo && (
            <div className="flex flex-col py-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  {errorInfo.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {errorInfo.message}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">How to fix this:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {errorInfo.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={retry}>Try Again</Button>
              </div>
            </div>
          )}

          {(status === "active" || status === "pip") && (
            <div className="flex flex-col">
              <div
                className={cn(
                  "relative rounded-lg overflow-hidden bg-black mb-6",
                  status === "pip" && "opacity-50"
                )}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {status === "pip" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-sm font-medium">
                        Camera is in Picture-in-Picture mode
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {status === "active" && (
                  <>
                    <Button
                      onClick={enablePip}
                      disabled={!isPipSupported}
                      title={
                        !isPipSupported
                          ? "Picture-in-Picture is not supported in your browser"
                          : undefined
                      }
                    >
                      Enable Picture-in-Picture
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Turn Camera Off
                    </Button>
                  </>
                )}

                {status === "pip" && (
                  <>
                    <Button onClick={exitPip}>Exit Picture-in-Picture</Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Turn Camera Off
                    </Button>
                  </>
                )}
              </div>

              {!isPipSupported && status === "active" && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Picture-in-Picture is not supported in your browser. Try using
                  Chrome, Edge, or Safari.
                </p>
              )}
            </div>
          )}
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}
