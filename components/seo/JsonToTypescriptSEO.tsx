import CodeExample from "../CodeExample";
import GetJamForFree from "./GetJamForFree";

export default function JsonToTypescriptSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Instantly generate TypeScript interfaces and types from any JSON data.
          Paste an API response, a config file, or any JSON structure and get
          clean, ready-to-use TypeScript types. No sign-up required. Made with
          💜 by the developers building Jam.
        </p>
      </section>

      <section>
        <h2>How to Use the JSON to TypeScript Generator:</h2>
        <p>
          Paste your JSON into the input field and get TypeScript interfaces
          generated in real time. You can customize the root interface name to
          match your project conventions. Copy the result and drop it into your
          codebase.
        </p>

        <p>Use Cases:</p>
        <ul>
          <li>
            API Integration: Generate types for REST or GraphQL API responses so
            you get full autocomplete and type safety in your editor.
          </li>
          <li>
            Configuration Files: Convert JSON config structures into typed
            interfaces for safer access across your application.
          </li>
          <li>
            Prototyping: Quickly scaffold TypeScript types when exploring a new
            API or data source without writing them by hand.
          </li>
          <li>
            Code Reviews: Paste JSON payloads from bug reports or logs and
            generate the corresponding types to understand the data shape.
          </li>
        </ul>
      </section>

      <section>
        <h2>How Does It Work?</h2>
        <p>
          The tool parses your JSON and recursively walks through every key and
          value. It infers TypeScript types from JavaScript primitives, creates
          named interfaces for nested objects, and correctly types arrays —
          including mixed-type arrays with union types. Special characters in
          keys are safely quoted.
        </p>
        <ul>
          <li>
            <b>Nested Objects:</b> <br /> Each nested object gets its own named
            interface, derived from the property key, keeping your types clean
            and reusable.
          </li>
          <li>
            <b>Arrays:</b> <br /> Homogeneous arrays produce clean{" "}
            <kbd>Type[]</kbd> syntax. Mixed arrays generate union types like{" "}
            <kbd>(string | number)[]</kbd>.
          </li>
          <li>
            <b>Null &amp; Empty Values:</b> <br /> Null values are typed as{" "}
            <kbd>null</kbd> and empty arrays as <kbd>unknown[]</kbd>, so you can
            refine them as needed.
          </li>
          <li>
            <b>Root Arrays:</b> <br /> If your JSON is an array of objects, the
            tool generates an interface for the item shape plus a type alias for
            the array.
          </li>
        </ul>
      </section>

      <section>
        <h2>Doing It Manually in TypeScript:</h2>
        <p>
          You can write TypeScript interfaces by hand, but it gets tedious fast
          — especially for deeply nested API responses. Here is what the manual
          process looks like:
        </p>
        <CodeExample>{codeExample}</CodeExample>
        <p>
          This tool automates exactly that process. Paste the JSON, get the
          types, and move on to building features instead of writing
          boilerplate.
        </p>
      </section>

      <section>
        <h2>Meet Jam: The Ultimate Tool for Debugging Web Apps</h2>
        <p>
          While this tool helps you generate TypeScript types instantly,{" "}
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
          Whether you&apos;re integrating a new API and need TypeScript types or
          tracking down a payload mismatch, Jam captures your screen alongside
          all the debug details developers need to fix issues — in a shareable
          link.
        </p>
      </section>

      <section>
        <GetJamForFree />
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>Can I convert any JSON to TypeScript?</b> <br /> Yes. The tool
            handles objects, arrays, nested structures, primitives, null values,
            and mixed-type arrays. Paste any valid JSON and get TypeScript
            interfaces instantly.
          </li>
          <li>
            <b>Does it handle nested JSON objects?</b> <br /> Each nested object
            is extracted into its own named interface. The name is derived from
            the property key, so the output stays readable and organized.
          </li>
          <li>
            <b>What happens with arrays?</b> <br /> Arrays of a single type
            produce <kbd>Type[]</kbd>. Arrays with mixed types produce union
            types like <kbd>(string | number)[]</kbd>. Empty arrays are typed as{" "}
            <kbd>unknown[]</kbd>.
          </li>
          <li>
            <b>Can I customize the root interface name?</b> <br /> Yes. Type
            your preferred name in the &quot;Root interface name&quot; field and
            the generated output updates in real time.
          </li>
          <li>
            <b>Is my data safe?</b> <br /> All processing happens entirely in
            your browser. No data is sent to any server.
          </li>
          <li>
            <b>What if my JSON has keys with special characters?</b> <br /> Keys
            that aren&apos;t valid JavaScript identifiers are automatically
            quoted in the output, so the generated interfaces are always valid
            TypeScript.
          </li>
        </ul>
      </section>
    </div>
  );
}

const codeExample = `// Given this API response:
// { "user": { "name": "Alice", "age": 30 }, "posts": [{ "title": "Hello" }] }

// You'd manually write:
interface Post {
  title: string;
}

interface User {
  name: string;
  age: number;
}

interface ApiResponse {
  user: User;
  posts: Post[];
}

// This tool generates those interfaces for you instantly.`;
