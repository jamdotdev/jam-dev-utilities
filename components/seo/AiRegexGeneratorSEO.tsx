import Link from "next/link";

export default function AiRegexGeneratorSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Generate regex patterns from natural language with Jam&apos;s AI Regex
          Generator. Bring your own API key, keep data in your browser, and get a
          clean pattern with explanations and examples.
        </p>
      </section>

      <section>
        <h2>How to use the AI Regex Generator</h2>
        <p>
          Describe what you want to match, add optional sample text, and let the
          generator build a JavaScript-compatible regex. You can instantly test
          the output against your own text.
        </p>
      </section>

      <section>
        <h2>Privacy-friendly by design</h2>
        <p>
          This tool runs entirely in the browser and uses your own API key. Your
          key stays on your device and is never sent to Jam servers.
        </p>
      </section>

      <section>
        <h2>Why use an AI regex generator?</h2>
        <ul>
          <li>
            <b>Faster debugging:</b> <br /> Quickly generate patterns that can
            filter logs, parse errors, or validate input.
          </li>
          <li>
            <b>Clear explanations:</b> <br /> Understand why a regex works so
            you can maintain it confidently.
          </li>
          <li>
            <b>Real-world examples:</b> <br /> Get sample matches to validate
            behavior before shipping.
          </li>
        </ul>
      </section>

      <section>
        <h2>More regex tools</h2>
        <p>
          Need to dive deeper? Pair this with our{" "}
          <Link href="/utilities/regex-tester">Regex Tester</Link> to visualize
          matches, flags, and capture groups.
        </p>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>Does this tool store my API key?</b> <br /> Only if you choose to
            remember it in your browser. It is never sent to Jam servers.
          </li>
          <li>
            <b>Which providers are supported?</b> <br /> OpenAI and Anthropic
            are supported, and you can choose the model you want to use.
          </li>
          <li>
            <b>Is the generated regex always correct?</b> <br /> AI output can
            be imperfect. Always validate with your own test cases.
          </li>
        </ul>
      </section>
    </div>
  );
}
