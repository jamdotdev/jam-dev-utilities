import CodeExample from "../CodeExample";
import { Button } from "../ds/ButtonComponent";
import GetJamForFree from "./GetJamForFree";

export default function Base64SEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Free, Open Source & Ad-free</h2>
        <p>
          Effortlessly encode and decode text or files to and from Base64 format
          with this free tool. Safe data transmission and storage in a
          web-friendly text format. Made with 💜 by the developers building Jam.
        </p>
      </section>

      <section>
        <h2>How to Use Jam's Base64 Decode Tool:</h2>
        <p>
          Paste your text and copy the result. Works for Base64 to image, Base64
          to text, encoded strings, and decoding text strings back to their
          original binary string.
        </p>
      </section>

      <section>
        <h2>Why Encode Data?</h2>
        <p>
          Base64 encoding converts binary data, such as images or files, into a
          text format that can be safely transmitted over text-based protocols
          like HTTP, email, and more. This process ensures that the data remains
          intact and prevents corruption during transmission.
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
            <b>Text to Binary Conversion:</b> <br /> Converts text strings to
            their original binary form, useful for handling encoded text data.
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
        <h2>Discover Jam: The Ultimate Tool for Web Developers</h2>
        <p>
          While this tool helps you manage encoding and decoding efficiently,
          Jam takes your debugging process to the next level.
        </p>
        <p>
          Meet Jam, the browser extension helping over 130,000 users debug
          faster. Jam captures console logs, network requests, and more with
          just one click. Now anyone can log comprehensive bug reports and you
          can debug so much faster.
        </p>
        <p>
          No more guesswork—just clear, actionable data that helps you identify
          and fix issues without having to follow up. Whether you're dealing
          with Base64-encoded data, debugging JavaScript functions, or ensuring
          data integrity in your web applications, Jam is here to help.
        </p>

        <GetJamForFree />
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>What is a Base64 encoder and decoder?</b> <br /> It's a tool that
            converts binary data into a text format, while a decoder converts
            text back to its original binary format.
          </li>
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
            <b>How to decode Base64 text online?</b> <br /> Use our online tool
            by pasting the Base64 encoded text into the input box and copying
            the decoded output.
          </li>
          <li>
            <b>What is Base64?</b> <br /> It's an encoding scheme used to
            convert binary data into a text format that can be safely
            transmitted over the internet, using a combination of ASCII
            characters.
          </li>
          <li>
            <b>Can I use this tool for files?</b> <br /> Yes, our tool works for
            files and text making it useful for web applications and APIs.
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
