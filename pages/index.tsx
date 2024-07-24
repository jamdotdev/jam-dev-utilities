import HomeCard from "../components/HomeCard";

export default function Home() {
  return (
    <main>
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
