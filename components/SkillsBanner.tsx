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
      className="inline-flex shrink-0 items-center gap-1.5 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
    >
      <GitHubLogoIcon aria-hidden="true" />
      View on GitHub
    </a>
  );

  return (
    <div
      className={cn(
        "rounded-xl bg-primary p-4 text-left text-primary-foreground sm:p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-[#A7F374] p-2 text-black">
          <Terminal className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 font-medium leading-5">
          Make your coding agent show its work
        </p>
        <span className="hidden sm:inline-flex">{githubLink}</span>
      </div>

      <p className="mt-2 text-sm leading-5 text-primary-foreground/70 sm:mt-1 sm:pl-11">
        Open-source agent skills for demo videos, proof on every PR, marked-up
        screenshots and fixes from a bug recording. Four skills today, more on
        the way.
      </p>

      <button
        type="button"
        onClick={() => handleCopy(INSTALL_COMMAND)}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="mt-4 flex w-full items-start gap-2 sm:items-center rounded-lg bg-primary-foreground/10 px-3 py-2 font-mono text-sm transition-[background-color,transform] duration-150 ease-out hover:bg-primary-foreground/15 active:scale-[0.98] sm:py-1.5 sm:pr-1.5"
      >
        <span className="shrink-0 leading-5 text-[#A7F374]" aria-hidden="true">
          {copied ? <Check className="h-4 w-4" /> : "$"}
        </span>
        <code className="min-w-0 flex-1 break-words text-left leading-5 sm:truncate">
          {INSTALL_COMMAND}
        </code>
        <span
          className="hidden shrink-0 rounded-md p-1.5 sm:inline-flex"
          aria-hidden="true"
        >
          <Copy className="h-4 w-4" />
        </span>
      </button>

      <div className="mt-3 sm:hidden">{githubLink}</div>
    </div>
  );
}
