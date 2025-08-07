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
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 9.5L8.5 3.5M8.5 3.5C6.9379 3.5 5.0621 3.5 3.5 3.5M8.5 3.5V8.5"
              stroke="#9E5BE5"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
