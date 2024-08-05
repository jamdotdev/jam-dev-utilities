import HomeCard from "@/components/HomeCard";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { tools } from "@/components/tools-list";
import { JamLogo64x64 } from "@/components/JamLogo64x64";
import Meta from "@/components/Meta";

export default function Home() {
  return (
    <main className="pb-8">
      <Meta
        title="Open Source Developer Tools | Free Utilities by Jam.dev"
        description="Jam exists to make developers lives easier. Here are fast, free, open source, ad-free tools. Simplify your coding tasks with utilities like Base64 encode/decode, URL encode/decode, HEX to RGB converter, Timestamp to Date converter, and more."
      />
      <Header />

      <div className="container text-center mb-14">
        <div className="flex justify-center items-center mb-4">
          <JamLogo64x64 />
        </div>

        <h1 className="text-3xl font-bold mb-5">Dev Utilities</h1>

        <p className="text-lg text-muted-foreground mb-7 leading-6 font-light">
          Jam exists to make developers lives easier.
          <br />
          Here are fast, free, open source, ad-free tools.
        </p>
        <CMDK showSearch />
      </div>

      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((card) => (
          <HomeCard
            key={card.title}
            title={card.title}
            description={card.description}
            link={card.link}
          />
        ))}
      </div>
    </main>
  );
}
