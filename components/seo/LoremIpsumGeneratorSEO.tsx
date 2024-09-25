import GetJamForFree from "./GetJamForFree";

export default function LoremIpsumGeneratorSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Quickly generate random Lorem Ipsum text for your projects. Whether
          you're designing websites, creating mockups, or testing layouts, Jam's
          free Lorem Ipsum Generator helps you produce placeholder text in
          seconds.
        </p>
      </section>

      <section>
        <GetJamForFree />
      </section>

      <section>
        <h2>How the Lorem Ipsum Generator works</h2>
        <p>
          This tool produces random sequences of placeholder text, commonly
          referred to as "Lorem Ipsum," which is pseudo-Latin and widely used in
          design mockups. It helps designers focus on layout and visual elements
          without the distraction of real content.
        </p>
        <br />
        <p>
          Need more customization? You can adjust the amount of text to better
          suit your needs.
        </p>
      </section>
    </div>
  );
}