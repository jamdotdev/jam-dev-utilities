import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { JamLogo64x64 } from "./JamLogo64x64";

interface PageHeader {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeader) {
  return (
    <div className="container text-center">
      <div className="flex justify-center items-center mb-6">
        <JamLogo64x64 />
      </div>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground mb-2 leading-6 font-light">
        {description}
      </p>

      <div className="flex justify-center items-center gap-2 mt-4">
        <a
          href="https://jam.dev?ref=utils-badge"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] rounded-xl ring-1 ring-purple-200 bg-purple-100/40 hover:bg-purple-100/60 px-2 py-[2px]"
        >
          by Jam.dev — One click bug reports devs love
          <ArrowTopRightIcon className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
