export default function EnvToTomlSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          This free tool allows you to quickly and easily convert your{" "}
          <kbd>.env</kbd> file variables into the format needed for your{" "}
          <kbd>netlify.toml</kbd> file. This tool was contributed to Jam's dev
          utilities by{" "}
          <a href="https://x.com/cassidoo" target="_blank" rel="noreferrer">
            Cassidy Williams
          </a>{" "}
          - software engineer, dev advocate, startup advisor, and investor. You
          can find her posting memes on Twitter and sharing learnings and tools for
          developers in her{" "}
          <a
            href="https://cassidoo.co/newsletter/"
            target="_blank"
            rel="noreferrer"
          >
            newsletter.
          </a>
        </p>
      </section>

      <section>
        <h2>How to Use:</h2>
        <ol>
          <li>
            <b>Paste your variables:</b>
            <br />
            <p>
              Copy the variables from your <kbd>.env</kbd> file and paste them
              into the input box.
            </p>
          </li>
          <li>
            <b>Handles comments and empty lines:</b>
            <br />
            <p>
              The tool works with comments and empty lines, so you don't need to
              remove them manually.
            </p>
          </li>
          <li>
            <b>Copy the Result:</b>
            <br />
            <p>
              Copy the converted output and paste it into your{" "}
              <kbd>netlify.toml</kbd> file.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
