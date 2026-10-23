import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { getBannerCopy, JAM_URL } from "./utils/jam-cta";
import SkillsBanner from "./SkillsBanner";

interface JamCallToActionProps {
  // Page slug under /utilities, used to pick the banner copy.
  tool?: string;
}

export default function JamCallToAction({ tool }: JamCallToActionProps) {
  const copy = getBannerCopy(tool);

  return (
    <section className="container max-w-2xl mb-16">
      <div className="border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-start gap-2">
          <img
            src="https://storage.googleapis.com/jam-assets/jam-logo.webp"
            width="40"
            height="40"
            alt=""
          />
          <div>
            <p className="font-medium text-left">{copy.title}</p>
            <p className="text-sm text-muted-foreground leading-5 text-left">
              {copy.description}
            </p>
          </div>
        </div>

        <a
          href={JAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-full sm:w-auto rounded-lg bg-[#A7F374] px-4 py-2 text-sm font-medium leading-none text-black transition-colors hover:bg-[#9AEA5F]"
        >
          Try Jam
        </a>
      </div>

      <SkillsBanner className="mt-4" />

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <GitHubLogoIcon />
        <span>
          These tools are open source.{" "}
          <a
            href="https://github.com/jamdotdev/jam-dev-utilities"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Contribute on GitHub
          </a>
        </span>
      </p>
    </section>
  );
}
