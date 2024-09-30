import Link from "next/link";
import CodeExample from "../CodeExample";
import GetJamForFree from "./GetJamForFree";

export default function Base64SEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Use this free Base64 encoder and decoder to easily convert between
          plain text and Base64-encoded strings. This tool is perfect for
          decoding API responses. No need to sign up — just paste your data and
          convert instantly. Made with 💜 by the developers building Jam.
        </p>
      </section>

      <section>
        <h2>How to Use the Base64 Decode Tool:</h2>
        <p>
          You can use this tool to decode Base64-encoded strings, or to convert
          Base64 text strings back to their original binary string. Just paste
          your data and copy the result. If you need to convert images to Base64
          you can use this{" "}
          <Link
            href="/utilities/image-to-base64"
            target="_blank"
            rel="noopener noreferrer"
          >
            tool
          </Link>
          .
        </p>

        <p>Use Cases:</p>
        <ul>
          <li>
            Data Conversion: Convert text strings to their original binary form,
            useful for handling encoded text data.
          </li>
          <li>
            Debugging: Decode Base64 data when troubleshooting or analyzing web
            resources.
          </li>
        </ul>
      </section>

      <section>
        <h2>How Does the Base64 Tool Work?</h2>
        <p>
          Base64 encoding converts binary string into a text format that can be
          safely transmitted over text-based protocols like HTTP, email, and
          more. This process ensures that the data remains intact and prevents
          corruption during transmission.
        </p>
        <ul>
          <li>
            <b>Data Integrity:</b> <br /> Ensures that binary data, special
            characters, and non-ASCII symbols are correctly transmitted over the
            internet without corruption.
          </li>
          <li>
            <b>Data Embedding:</b> <br /> Allows embedding binary data within
            text-based formats like JSON, XML, and HTML, making it useful for
            web applications and APIs.
          </li>
          <li>
            <b>Compatibility:</b> <br /> Facilitates easier data sharing and
            exchange between different systems and platforms that handle
            text-based data.
          </li>
          <li>
            <b>ASCII Decoding:</b> <br /> Converts ASCII strings back to their
            original binary form, ensuring accurate data reconstruction.
          </li>
        </ul>
      </section>

      <section>
        <h2>Using Base64 in JavaScript:</h2>
        <p>
          In JavaScript, Base64 encoding and decoding can be done using the
          built-in <kbd>btoa</kbd> and <kbd>atob</kbd> functions.
        </p>
        <CodeExample>{b64codeExample}</CodeExample>
        <p>
          These functions make it easy to handle encoding and decoding directly
          within your JavaScript code, enabling smooth data processing and
          transmission in web applications.
        </p>
      </section>

      <section>
        <h2>Meet Jam: The Ultimate Tool for Debugging Web Apps</h2>
        <p>
          While this tool helps you manage encoding and decoding efficiently,{" "}
          <a href="https://jam.dev?ref=utils" target="_blank" rel="noreferrer">
            Jam
          </a>{" "}
          takes your debugging process to the next level.
        </p>
        <p>
          Jam is{" "}
          <a
            href="https://chromewebstore.google.com/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci"
            target="_blank"
            rel="noreferrer"
          >
            the browser extension
          </a>{" "}
          helping over 140,000 users debug faster. It captures console logs,
          network requests, and more with just one click. Now anyone can log
          comprehensive bug reports and you can debug so much faster without
          having to follow up.
        </p>
        <p>
          Whether you're dealing with Base64-encoded data or debugging
          JavaScript functions in your web applications, you can use Jam to
          capture your screen and it automatically includes all the debug
          details developers need to fix issues in a shareable link.
        </p>
      </section>

      <section>
        <GetJamForFree />
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>Can you decode Base64?</b> <br /> Yes, you can. Use this tool to
            decode online by pasting the text into the input box and copying the
            decoded output.
          </li>
          <li>
            <b>How to convert Base64 encoding?</b> <br /> Using our free online
            tool right here. Drop your file or text and get an ASCII string
            output that you can easily copy and use.
          </li>
          <li>
            <b>Can you encode Base64?</b> <br /> Yes, you can encode text using
            our online tool. Just paste your text and get the encoded result.
          </li>
          <li>
            <b>How to encode text to Base64 online?</b> <br /> Use our online
            tool by pasting your text into the input box and copying the output.
            In a few seconds, you'll be effectively converting the characters to
            a web-safe format.
          </li>
          <li>
            <b>What is Base64?</b> <br /> It's an encoding scheme used to
            convert binary data into a text format that can be safely
            transmitted over the internet, using a combination of ASCII
            characters.
          </li>
          <li>
            <b>What is the difference between encoding and decoding?</b> <br />{" "}
            Encoding converts binary data to Base64 text format, while decoding
            converts Base64 text back to its original binary format.
          </li>
        </ul>
      </section>
    </div>
  );
}

const b64codeExample = `let text = "Hello, world!";
let encoded = btoa(text);
console.log(encoded); // Outputs: "SGVsbG8sIHdvcmxkIQ=="

let encoded = "SGVsbG8sIHdvcmxkIQ==";
let decoded = atob(encoded);
console.log(decoded); // Outputs: "Hello, world!"
`;
