import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Terminal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "./ds/CardComponent";
import {
  InstallCommand,
  SKILLS_DESCRIPTION,
  SKILLS_TITLE,
} from "./SkillsBanner";
import { SKILLS_URL } from "./utils/jam-cta";

// Grid-sized version of SkillsBanner for the utilities index.
export default function SkillsCard() {
  return (
    <Card>
      <CardContent className="w-full">
        <span className="mb-4 rounded-lg bg-[#A7F374] p-2 text-black">
          <Terminal className="h-4 w-4" aria-hidden="true" />
        </span>
        <CardTitle className="leading-tight">{SKILLS_TITLE}</CardTitle>
        <CardDescription>{SKILLS_DESCRIPTION}</CardDescription>
        <InstallCommand className="self-stretch" />
        <a
          href={SKILLS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <GitHubLogoIcon aria-hidden="true" />
          View on GitHub
        </a>
      </CardContent>
    </Card>
  );
}
