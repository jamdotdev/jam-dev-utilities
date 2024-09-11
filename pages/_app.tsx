import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import router from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const path = router.asPath;
    if (path.startsWith("/utilities/utilities/")) {
      const correctedPath = path.replace(
        "/utilities/utilities/",
        "/utilities/"
      );
      router.replace(correctedPath);
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
