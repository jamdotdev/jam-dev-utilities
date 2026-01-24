import { useCallback, useState, useMemo } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import PlatformSelector from "@/components/config-doctor/PlatformSelector";
import SecurityWarnings from "@/components/config-doctor/SecurityWarnings";
import ConfigDoctorSEO from "@/components/seo/ConfigDoctorSEO";
import {
  Platform,
  parseEnvFile,
  convertToPlatform,
  PLATFORM_INFO,
} from "@/components/utils/config-doctor.utils";

export default function ConfigDoctor() {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("netlify");
  const { buttonText, handleCopy } = useCopyToClipboard();

  // Parse env variables with security analysis
  const variables = useMemo(() => {
    if (!input.trim()) {
      return [];
    }
    try {
      return parseEnvFile(input);
    } catch {
      return [];
    }
  }, [input]);

  // Convert to selected platform format
  const output = useMemo(() => {
    if (variables.length === 0) {
      return "";
    }
    try {
      return convertToPlatform(variables, platform);
    } catch {
      return "Error converting configuration";
    }
  }, [variables, platform]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.currentTarget.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const platformInfo = PLATFORM_INFO[platform];

  return (
    <main>
      <Meta
        title="Config Doctor - .env to Deployment Config Converter | Free, Open Source & Ad-free"
        description="Convert .env files to Netlify, Vercel, or Cloudflare Pages configuration with AI-powered security analysis. Detect secrets, get recommendations, and deploy safely."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Config Doctor"
          description="Convert .env files to deployment configs with security analysis"
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label className="mb-2 block">Target Platform</Label>
              <PlatformSelector selected={platform} onSelect={setPlatform} />
              <p className="mt-2 text-xs text-muted-foreground">
                Output format:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  {platformInfo.configFile}
                </code>
              </p>
            </div>

            {/* Input */}
            <div>
              <Label className="mb-2 block">.env File Contents</Label>
              <Textarea
                rows={8}
                placeholder={`# Paste your .env file here
DATABASE_URL=postgres://user:pass@localhost/db
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_API_URL=https://api.example.com
NODE_ENV=production`}
                onChange={handleInputChange}
                value={input}
                className="font-mono text-sm"
              />
            </div>

            {/* Security Analysis */}
            {input.trim() && (
              <div>
                <Label className="mb-2 block">Security Analysis</Label>
                <Card className="p-4 bg-muted/30 border-dashed">
                  <SecurityWarnings variables={variables} />
                </Card>
              </div>
            )}

            {/* Output */}
            <div>
              <Label className="mb-2 block">
                {platformInfo.name} Configuration
              </Label>
              <Textarea
                rows={8}
                value={output}
                readOnly
                className="font-mono text-sm"
                placeholder={`Your ${platformInfo.configFile} output will appear here...`}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(output)}
                disabled={!output}
              >
                {buttonText}
              </Button>
              <Button variant="ghost" onClick={handleClear} disabled={!input}>
                Clear
              </Button>
              <a
                href={platformInfo.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="link" className="text-xs">
                  {platformInfo.name} Docs
                  <ExternalLinkIcon className="w-3 h-3 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <ConfigDoctorSEO />
      </section>
    </main>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
