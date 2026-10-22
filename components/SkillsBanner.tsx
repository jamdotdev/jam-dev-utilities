import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { SKILLS_URL } from "./utils/jam-cta";

interface SkillsBannerProps {
  className?: string;
}

export default function SkillsBanner({ className }: SkillsBannerProps) {
  return (
    <div
      className={cn(
        "border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4",
        className
      )}
    >
      <div className="flex-1 text-left">
        <p className="font-medium">Agent skills for Jam</p>
        <p className="text-sm text-muted-foreground leading-5">
          Let your coding agent read Jams and record proof.
        </p>
        <code className="mt-1.5 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">
          npx skills add jamdotdev/skills
        </code>
      </div>

      <a
        href={SKILLS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium leading-none transition-colors hover:bg-muted"
      >
        <GitHubLogoIcon />
        View on GitHub
      </a>
    </div>
  );
}
