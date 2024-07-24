import HomeCard from "../components/HomeCard";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  return (
    <main>
      <header className="flex justify-between px-6 py-4">
        <div>Jam.dev</div>
        <ThemeToggle />
      </header>

      <div className="container text-center">
        <div className="flex justify-center items-center mb-4">
          <img
            className="rounded-2xl"
            src="logo.png"
            width="64"
            height="64"
            alt="Logo"
          />
        </div>
        <h1 className="text-3xl font-bold mb-5">Dev Utilities</h1>
        <p className="text-lg text-muted-foreground mb-7 leading-6 font-light">
          Jam exists to make developers lives easier.
          <br />
          Here are fast, free, open source, ad-free tools.
        </p>
      </div>

      <div className="container grid grid-cols-3 gap-6">
        {cardData.map((card) => (
          <HomeCard
            key={card.title}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </main>
  );
}

const cardData = [
  {
    title: "Timestamp to date",
    description:
      "Easily convert epoch time (also known as Unix time or Unix timestamp) to a human-readable month/day/year and time format.",
  },
  {
    title: "HEX to RGB",
    description:
      "Quickly convert hexadecimal color codes to their corresponding RGB values for easy use in various programming contexts.",
  },
  {
    title: "CSV to JSON",
    description:
      "Seamlessly transform CSV data into JSON format, enabling easy data interchange and parsing across different systems and applications.",
  },
  {
    title: "Base64 encoder/decoder",
    description:
      "Effortlessly encode and decode text or files to and from Base64 format, facilitating data transmission and storage in a web-safe text format.",
  },
  {
    title: "JSON formatter",
    description:
      "Beautify and structure raw JSON data with proper indentation and formatting, making it easier to read, edit, and validate JSON content.",
  },
  {
    title: "YAML to JSON",
    description:
      "Effortlessly convert YAML data to JSON format, enabling smooth transitions between different data serialization formats in your projects.",
  },
  {
    title: "Query params to JSON",
    description:
      "Convert URL query parameters into a structured JSON object, simplifying the process of parsing and manipulating URL data in web applications.",
  },
  {
    title: "URL encoder/decoder",
    description:
      "Encode and decode URLs to ensure proper handling of special characters, spaces, and non-ASCII symbols in web addresses and query strings.",
  },
];
