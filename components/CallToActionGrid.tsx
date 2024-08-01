import SquareCard from "./SquareCard";

export default function CallToActionGrid() {
  return (
    <section className="grid grid-cols-2 gap-4 container max-w-2xl mb-16">
      <SquareCard
        logo="github"
        description="Our tools are free and open source. Feel free to contribute."
        buttonText="Contribute"
        href="https://google.com"
      />
      <SquareCard
        logo="jam"
        description="Auto-capture all the info engineers need to debug!"
        buttonText="Try Jam"
        href="https://google.com"
      />
    </section>
  );
}
