import { GitHubLogoIcon } from "@radix-ui/react-icons";

interface GitHubContributionProps {
  username: string;
  customUrl?: string;
}

export default function GitHubContribution(props: GitHubContributionProps) {
  return (
    <section className="container max-w-2xl content-wrapper mb-6">
      <p className="flex items-center gap-2 justify-center">
        <span>Built by</span> <GitHubLogoIcon />
        <a
          href={props.customUrl || `https://github.com/${props.username}`}
          target="_blank"
          rel="noreferrer"
        >
          @{props.username}
        </a>
      </p>
    </section>
  );
}
