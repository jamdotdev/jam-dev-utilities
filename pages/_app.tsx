import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { AppProps } from "next/app";
import { RecordVideoFeedback } from "@/components/RecordVideoFeedback";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const params = useSearchParams();
  const showButton = Boolean(params?.get("report-a-bug"));

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Head>
        <link rel="canonical" href={`https://jam.dev${pathname}`} />
      </Head>
      <Component {...pageProps} />
      {showButton && <RecordVideoFeedback />}
    </ThemeProvider>
  );
}
