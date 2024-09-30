import Link from "next/link";

export default function HexToRgbSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Easily convert HEX CSS/HTML color codes to RGB. Whether you're working
          with CSS, Objective-C, Swift, or Android, Jam's free color code
          converter has you covered.
        </p>
      </section>

      <section>
        <h2>How to use the HEX to RGB color converter:</h2>
        <ul>
          <li>
            <b>Step 1:</b> <br /> Enter your HEX color code
          </li>
          <li>
            <b>Step 2:</b> <br /> Copy the resulting RGB color code
          </li>
        </ul>
      </section>

      <section>
        <h2>How the CSS color converter works</h2>
        <p>
          This tool takes your hexadecimal color code (HEX for short) and gives
          you the resulting RGB color combination of red, green, and blue values
          ranging from 0 to 255 — so you can match HTML/CSS colors to design
          files and other editing software. For example, if you're working with
          Figma designs, this tool allows you to input the HEX code you're using
          for HTML elements and get the RGB color codes to match in Figma.
        </p>
        <br />
        <p>
          Need to convert the other way? You can use the RGB to HEX converter{" "}
          <Link
            href="/utilities/rgb-to-hex"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
