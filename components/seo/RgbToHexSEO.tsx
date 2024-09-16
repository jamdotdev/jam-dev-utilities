import Link from "next/link";

export default function RgbToHexSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Easily convert RGB to HEX CSS/HTML color codes. Whether you're working
          with CSS, Objective-C, Swift, or Android, Jam's free color code
          converter has you covered.
        </p>
      </section>

      <section>
        <h2>How to use the RGB to HEX color converter:</h2>
        <ul>
          <li>
            <b>Step 1:</b> <br /> Enter your RGB color code
          </li>
          <li>
            <b>Step 2:</b> <br /> Copy the resulting HEX color code
          </li>
        </ul>
      </section>

      <section>
        <h2>How the CSS color converter works</h2>
        <p>
          This tool takes an RGB color combination of red, green, and blue
          values ranging from 0 to 255 and gives you the resulting hexadecimal
          color code (HEX for short), so you can define colors in HTML and CSS.
          For example, if you're working with Figma designs, this tool allows
          you to input the RGB color codes from your file, to get the HEX code
          you would need for html elements.
        </p>
        <br />
        <p>
          Need to convert the other way? You can use the Hex to RGB converter{" "}
          <Link
            href="/utilities/hex-to-rgb"
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
