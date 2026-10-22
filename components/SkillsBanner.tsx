import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { SKILLS_URL } from "./utils/jam-cta";

const INSTALL_COMMAND = "npx skills add jamdotdev/skills";

export const SKILLS_TITLE = "Teach your coding agent to show its work";
export const SKILLS_DESCRIPTION =
  "Open-source Jam skills: record a demo, attach proof to the PR, mark up a screenshot, fix a bug from a recording. More on the way.";

export function InstallCommand({ className }: { className?: string }) {
  const { buttonText, handleCopy } = useCopyToClipboard();
  const copied = buttonText !== "Copy";

  return (
    <button
      type="button"
      onClick={() => handleCopy(INSTALL_COMMAND)}
      aria-label={copied ? "Copied" : "Copy install command"}
      className={cn(
        "flex w-full items-start gap-2 sm:items-center rounded-lg bg-muted px-3 py-2 font-mono text-sm transition-[background-color,transform] duration-150 ease-out hover:bg-border/60 active:scale-[0.98] sm:py-1.5 sm:pr-1.5",
        className
      )}
    >
      <span
        className="shrink-0 leading-5 text-muted-foreground"
        aria-hidden="true"
      >
        {copied ? <Check className="h-4 w-4 text-[#5BA832]" /> : "$"}
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
  );
}

interface SkillsBannerProps {
  className?: string;
}

export default function SkillsBanner({ className }: SkillsBannerProps) {
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
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-[#A7F374] p-2 text-black">
          <Terminal className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 font-medium leading-5">{SKILLS_TITLE}</p>
        <span className="hidden sm:inline-flex">{githubLink}</span>
      </div>

      <p className="mt-2 text-sm leading-5 text-muted-foreground sm:mt-1 sm:pl-11">
        {SKILLS_DESCRIPTION}
      </p>

      <InstallCommand className="mt-4" />

      <div className="mt-3 sm:hidden">{githubLink}</div>
    </div>
  );
}
