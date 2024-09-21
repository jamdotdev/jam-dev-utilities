import { GitHubLogoIcon } from "@radix-ui/react-icons";

interface Contributor {
  username: string;
}

interface GitHubContributionProps {
  contributors: Contributor[];
}

export default function GitHubContribution(props: GitHubContributionProps) {
  return (
    <section className="container max-w-2xl content-wrapper mb-6">
      <p className="flex items-center gap-2 justify-center">
        <span>Built by</span> <GitHubLogoIcon />
        {props.contributors.map((contributor: Contributor) => (
          <a
            href={`https://github.com/${contributor.username}`}
            target="_blank"
            rel="noreferrer"
            key={contributor.username}
          >
            @{contributor.username}
          </a>
        ))}
      </p>
    </section>
  );
}
