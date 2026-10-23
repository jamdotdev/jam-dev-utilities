import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { SKILLS_URL } from "./utils/jam-cta";

const INSTALL_COMMAND = "npx skills add jamdotdev/skills";

interface SkillsBannerProps {
  className?: string;
}

export default function SkillsBanner({ className }: SkillsBannerProps) {
  const { buttonText, handleCopy } = useCopyToClipboard();
  const copied = buttonText !== "Copy";

  const githubLink = (
    <a
      href={SKILLS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <GitHubLogoIcon aria-hidden="true" />
      View on GitHub
    </a>
  );

  return (
    <div className={cn("rounded-xl border p-4 text-left sm:p-5", className)}>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground">
          <Terminal className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 font-medium leading-5">
          Teach your coding agent to show its work
        </p>
        <span className="hidden sm:inline-flex">{githubLink}</span>
      </div>

      <p className="mt-2 text-sm leading-5 text-muted-foreground sm:mt-1 sm:pl-12">
        Open-source Jam skills: record a demo, attach proof to the PR, mark up a
        screenshot, fix a bug from a recording.
      </p>

      <button
        type="button"
        onClick={() => handleCopy(INSTALL_COMMAND)}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="mt-4 flex w-full items-start gap-2 sm:items-center rounded-lg bg-muted py-1.5 pl-3 pr-1.5 font-mono text-sm transition-[background-color,transform] duration-150 ease-out hover:bg-border/60 active:scale-[0.98]"
      >
        <span
          className="shrink-0 leading-5 text-muted-foreground"
          aria-hidden="true"
        >
          $
        </span>
        <code className="min-w-0 flex-1 break-words text-left leading-5 sm:truncate">
          {INSTALL_COMMAND}
        </code>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md p-1.5 text-muted-foreground"
          aria-hidden="true"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#5BA832]" />
              <span className="font-sans text-xs leading-4">Copied</span>
            </>
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </span>
      </button>

      <div className="mt-3 sm:hidden">{githubLink}</div>
    </div>
  );
}
