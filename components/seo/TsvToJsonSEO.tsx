import Link from "next/link";

export default function TsvToJsonSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Quickly transform tab-separated values into structured JSON with this
          free online tool. TSV files are widely used in spreadsheet exports,
          database dumps, and scientific datasets — our converter handles them
          all, preserving your data exactly as-is.
        </p>
      </section>

      <section>
        <p>
          Paste your TSV content or drag and drop a .tsv file to get instant
          JSON output. Built with 💜 by the developers at Jam, using the
          open-source{" "}
          <a
            href="https://github.com/mholt/PapaParse"
            target="_blank"
            rel="noopener noreferrer"
          >
            PapaParse
          </a>{" "}
          package.
        </p>
      </section>

      <section>
        <h2>How to Convert TSV to JSON</h2>
        <p>
          Tab-separated data is common in exports from Excel, Google Sheets,
          databases, and scientific tools. Converting it to JSON makes it ready
          for APIs, config files, and modern web applications.
        </p>
        <ul>
          <li>
            <b>Paste or upload your TSV:</b> <br /> Drop in your tab-separated
            content directly or upload a .tsv file from your machine.
          </li>
          <li>
            <b>Instant JSON output:</b> <br /> The first row is used as keys and
            each subsequent row becomes a JSON object in an array.
          </li>
          <li>
            <b>Normalize keys to lowercase:</b> <br /> Toggle the lowercase
            option to standardize all JSON keys, useful when merging data from
            multiple sources with inconsistent casing.
          </li>
        </ul>
        <p>
          Going the other direction? Convert JSON back to TSV with our{" "}
          <Link href="/utilities/json-to-tsv">JSON to TSV converter</Link>.
        </p>
      </section>

      <section>
        <h2>Related Developer Utilities</h2>
        <p>
          Jam offers a suite of free data conversion tools for developers. No
          ads, no sign-ups, and dark mode included.
        </p>
        <ul>
          <li>
            <Link href="/utilities/json-formatter">JSON Formatter</Link>:
            Pretty-print and validate your JSON with syntax highlighting.
          </li>
          <li>
            <Link href="/utilities/csv-to-json">CSV to JSON</Link>: Convert
            comma-separated data to JSON when your source uses commas instead of
            tabs.
          </li>
          <li>
            <Link href="/utilities/yaml-to-json">YAML to JSON</Link>: Switch
            between YAML config files and JSON for use in different
            environments.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why Convert TSV to JSON?</h2>
        <p>
          TSV (Tab-Separated Values) stores tabular data using tab characters as
          column delimiters. Unlike CSV, TSV avoids ambiguity with commas inside
          field values, making it a popular export format for databases and
          spreadsheets.
        </p>
        <ul>
          <li>
            <b>API-ready data:</b> <br /> Most REST APIs and web services expect
            JSON. Converting TSV to JSON lets you feed spreadsheet or database
            exports directly into API requests.
          </li>
          <li>
            <b>No quoting headaches:</b> <br /> Because TSV uses tabs rather
            than commas, fields with commas, quotes, or special characters
            convert cleanly to JSON without escaping issues.
          </li>
          <li>
            <b>Structured and nested-ready:</b> <br /> JSON supports nested
            objects and arrays, so once your flat TSV data is in JSON form, you
            can easily reshape it for more complex data models.
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>What makes TSV different from CSV?</b> <br /> TSV uses tab
            characters to separate columns, while CSV uses commas. TSV is
            generally safer for data that contains commas, such as addresses or
            descriptions, because no extra quoting is needed.
          </li>
          <li>
            <b>Does the converter handle large TSV files?</b> <br /> Yes. The
            tool processes TSV data in the browser using PapaParse, which is
            optimized for handling large datasets efficiently without uploading
            anything to a server.
          </li>
          <li>
            <b>How are column headers mapped to JSON keys?</b> <br /> The first
            row of your TSV is treated as the header row. Each column header
            becomes a key in the resulting JSON objects, and every subsequent
            row becomes an object in the output array.
          </li>
          <li>
            <b>What if my TSV has missing or extra columns?</b> <br /> The
            converter handles ragged rows gracefully — missing values are left
            empty and extra values are still captured in the output.
          </li>
          <li>
            <b>Is my data sent to a server?</b> <br /> No. All conversion
            happens locally in your browser. Your data never leaves your
            machine.
          </li>
        </ul>
      </section>
    </div>
  );
}
