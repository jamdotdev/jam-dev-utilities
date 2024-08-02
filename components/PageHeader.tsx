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
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-muted-foreground mb-7 leading-6 font-light">
        {description}
      </p>
    </div>
  );
}
