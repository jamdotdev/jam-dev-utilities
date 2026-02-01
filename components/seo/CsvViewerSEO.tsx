import Link from "next/link";

export default function CsvViewerSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Free Online Log File Viewer for CSV, TSV, and Log Files</h2>
        <p>
          Quickly view, search, and filter your log files online with this free
          tool. Whether you're a developer debugging application logs or just
          need to explore a CSV file, this viewer makes it easy to find what
          you're looking for. Drag and drop your file and start searching
          instantly.
        </p>
        <p>
          Built with care by the developers at Jam. Open source, ad-free, and
          works entirely in your browser.
        </p>
      </section>

      <section>
        <h2>How to Use the Log File Viewer</h2>
        <p>
          This tool works with CSV files, TSV files, and plain text log files.
          It automatically detects the file format and displays your data in an
          easy-to-read table.
        </p>
        <ul>
          <li>
            <b>Upload your file:</b> <br /> Drag and drop any .csv, .tsv, .txt,
            or .log file into the upload area, or click to browse.
          </li>
          <li>
            <b>Search instantly:</b> <br /> Use the search bar to find any text
            across all columns. Matches are highlighted in yellow for easy
            spotting.
          </li>
          <li>
            <b>Filter by values:</b> <br /> Click on column headers to filter by
            specific values. Great for narrowing down logs by service, host, or
            any other field.
          </li>
          <li>
            <b>Mark rows for tracing:</b> <br /> Click the # column to mark
            important rows. Use Cmd/Ctrl+click to create a second trace flow in
            a different color.
          </li>
          <li>
            <b>Expand for details:</b> <br /> Click any row to see the full
            content of each field.
          </li>
        </ul>
      </section>

      <section>
        <h2>Dev Mode for Log Analysis</h2>
        <p>
          Toggle Dev Mode to unlock advanced features designed for developers
          analyzing application logs. When enabled, you'll see color-coded
          severity levels (error, warning, info, debug) and a Datadog-style
          sidebar for filtering by log level and other attributes.
        </p>
        <p>
          Dev Mode is automatically enabled when the tool detects log-like
          files. For regular CSV data files, it stays off to give you a clean,
          simple table view.
        </p>
      </section>

      <section>
        <h2>Works with Any CSV or Log File</h2>
        <p>
          This viewer handles a wide variety of file formats and use cases. It's
          perfect for exploring data exports, analyzing server logs, reviewing
          application traces, or just quickly searching through any tabular
          data.
        </p>
        <ul>
          <li>
            <b>Application logs:</b> Debug errors, trace requests, and analyze
            service behavior.
          </li>
          <li>
            <b>Server logs:</b> Review access logs, error logs, and system
            events.
          </li>
          <li>
            <b>Data exports:</b> Explore CSV exports from databases,
            spreadsheets, or analytics tools.
          </li>
          <li>
            <b>Custom log formats:</b> Works with any comma, tab, or
            semicolon-separated file.
          </li>
        </ul>
      </section>

      <section>
        <h2>More CSV and Data Utilities</h2>
        <p>
          Jam offers a collection of free developer tools for working with data.
          Convert between formats, parse files, and debug faster.
        </p>
        <ul>
          <li>
            <Link href="/utilities/csv-to-json">CSV to JSON Converter</Link>:
            Convert CSV files to JSON format for APIs and web applications.
          </li>
          <li>
            <Link href="/utilities/json-to-csv">JSON to CSV Converter</Link>:
            Transform JSON data into CSV for spreadsheets and data analysis.
          </li>
          <li>
            <Link href="/utilities/har-file-viewer">HAR File Viewer</Link>:
            Analyze HTTP Archive files to debug network requests and
            performance.
          </li>
          <li>
            <Link href="/utilities/json-formatter">JSON Formatter</Link>:
            Beautify and validate JSON data for easier reading.
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>What file types are supported?</b> <br /> The viewer supports
            .csv, .tsv, .txt, and .log files. It automatically detects whether
            your file uses commas, tabs, or semicolons as delimiters.
          </li>
          <li>
            <b>Is my data secure?</b> <br /> Yes. All processing happens
            entirely in your browser. Your files are never uploaded to any
            server.
          </li>
          <li>
            <b>Can I use this for large files?</b> <br /> Yes. The viewer is
            optimized for performance and can handle files with thousands of
            rows. Facet filtering is limited to the most common values to keep
            things fast.
          </li>
          <li>
            <b>What is Dev Mode?</b> <br /> Dev Mode enables log-specific
            features like color-coded severity levels and advanced filtering.
            It's automatically enabled for log files and can be toggled manually
            for any file.
          </li>
          <li>
            <b>How do I trace multiple flows?</b> <br /> Click the # column to
            mark rows for your first trace (blue). Hold Cmd/Ctrl and click to
            create a second trace (green). Each trace has independent numbering.
          </li>
          <li>
            <b>Can I filter by multiple values?</b> <br /> Yes. Use the sidebar
            or column header dropdowns to select multiple values. The viewer
            shows rows matching any of the selected values.
          </li>
          <li>
            <b>How do I search for specific text?</b> <br /> Type in the search
            bar at the top. The viewer searches across all columns and
            highlights matches in yellow.
          </li>
          <li>
            <b>Does this work offline?</b> <br /> Once the page is loaded, yes.
            Since all processing happens in your browser, you can use it without
            an internet connection.
          </li>
        </ul>
      </section>
    </div>
  );
}
