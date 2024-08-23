import GetJamForFree from "./GetJamForFree";

export default function HarFileViewerSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>HAR File Viewer</h2>
        <p>
          Effortlessly view and analyze HAR (HTTP Archive) files with our free
          online tool. Debugging network performance has never been easier (or
          has it?).
        </p>
        <p>Scroll down for a debugging surprise.</p>
      </section>

      <section>
        <h2>Free, Open Source & Ad-free</h2>
        <p>
          Upload your HAR file and start analyzing immediately. Made with 💜 by
          the developers at Jam.
        </p>
      </section>

      <section>
        <h2>Benefits of Using HAR File Analyzer</h2>
        <p>
          HAR files capture a comprehensive record of web requests and
          responses, making them essential for debugging and analyzing web
          traffic. They provide invaluable insights into network performance and
          help troubleshoot issues efficiently.
        </p>
        <ul>
          <li>
            <b>Network Requests:</b> <br /> Inspect all network requests made
            during a page load.
          </li>
          <li>
            <b>Performance Analysis:</b> <br /> Analyze load times, resource
            sizes, and more.
          </li>
          <li>
            <b>Error Detection:</b> <br /> Identify and troubleshoot errors in
            web requests.
          </li>
          <li>
            <b>Data Sharing:</b> <br /> Share with team members or support for
            collaborative debugging.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to Create a HAR File</h2>
        <ul>
          <li>Navigate to the page where the issue is occurring.</li>
          <li>
            In the web browser menu (we’re using Google Chrome), choose "View" →
            "Developer" → "Developer Tools". Or right-click anywhere in your
            browser window and select "Inspect".
          </li>
          <li>Select the "Network" tab within the Developer Tools panel.</li>
          <li>Check "Preserve log" to ensure all requests are recorded.</li>
          <li>
            Stop the current recording by clicking the 🔴 button (it will turn
            ⚫️).
          </li>
          <li>Clear existing logs with the 🚫 button to start fresh.</li>
          <li>
            Start a new recording by clicking the record button (it will turn
            🔴).
          </li>
          <li>Reproduce the issue for HAR capture.</li>
          <li>Once done, click the ⬇ "Export HAR" button to save it.</li>
        </ul>
        <p>
          <a
            href="https://jam.dev/blog/the-easiest-step-by-step-guide-to-sending-a-har-file-on-chrome-edge-safari-firefox/"
            target="_blank"
            rel="noreferrer"
          >
            Detailed steps for generating HAR files on Edge, Safari, and Firefox
          </a>{" "}
          are available on our site.
        </p>
      </section>

      <section>
        <h2>How to View a HAR File</h2>
        <ul>
          <li>
            <b>Web Browser Developer Tools:</b> <br /> If you don't use our
            tool, you can view HAR files using various methods. Most modern web
            browsers like Google Chrome, Firefox, and Microsoft Edge have
            built-in developer tools that can open and analyze HAR files.
          </li>
          <li>
            <b>Text Editor:</b> <br /> HAR files are essentially JSON files and
            can be opened in any text editor.
          </li>
          <li>
            <b>Browser Extensions:</b> <br /> There are{" "}
            <a href="https://jam.dev/" target="_blank" rel="noreferrer">
              browser extensions
            </a>{" "}
            available that can help you analyze HAR files.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to Read a HAR File</h2>
        <ul>
          <li>
            <b>Upload:</b> <br /> HAR file analysis is simple with our online
            viewer. Drag and drop into our viewer or click to upload.
          </li>
          <li>
            <b>Navigate the entries:</b> <br /> Review the list of all network
            requests made during the session.
          </li>
          <li>
            <b>Examine request details:</b> <br /> Click on any entry to see
            detailed information, including headers, payload, and response.
          </li>
          <li>
            <b>Analyze timings:</b> <br /> Understand request durations,
            including DNS lookup, connection, SSL handshake, and response time.
          </li>
          <li>
            <b>Identify issues:</b> <br /> Spot requests that failed or took
            unusually long. Check headers and payloads for error messages or
            clues.
          </li>
          <li>
            <b>Export data:</b> <br /> Export the data for further analysis or
            sharing with your team.
          </li>
        </ul>
      </section>

      <section>
        <h2>Meet Jam: The Ultimate HAR File</h2>
        <p>
          While our HAR file viewer is great and helps you analyze network logs,
          there's a better way. Imagine having a tool that not only captures all
          the network requests, responses, and console logs like a HAR file but
          goes beyond that. Jam auto-includes reproduction steps, custom
          metadata, and much more—all packaged and ready to go in a link you can
          share.
        </p>
        <p>
          All in one single click. It's just a browser extension. It's
          impossible to get it wrong, click Jam to capture your screen, and
          that's it.
        </p>
        <p>
          Never write repro steps again. Never follow up to debug an issue. Just
          ask your team to report bugs with Jam.
        </p>
      </section>

      <section>
        <GetJamForFree />
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>What is a HAR file?</b> <br /> A HAR (HTTP Archive) file records
            all web requests and responses during a page load, including
            detailed information about network performance, load times, and
            errors.
          </li>
          <li>
            <b>How to open a HAR file?</b> <br /> Use our online viewer to open
            and analyze your HAR files. Simply upload the file and start viewing
            detailed network data.
          </li>
          <li>
            <b>How to analyze a HAR file?</b> <br /> Upload to our online viewer
            to gain comprehensive insights into network requests, load times,
            errors, and more.
          </li>
          <li>
            <b>What is a HAR file used for?</b> <br /> Debugging web traffic and
            analyzing network performance, helping developers and QA engineers
            troubleshoot issues and optimize performance.
          </li>
          <li>
            <b>How to get a HAR file in Chrome?</b> <br /> Open Chrome DevTools
            (F12 or right-click {">"} Inspect), go to the Network tab, check the
            "Preserve log" checkbox, and start recording. Then reproduce the
            issue. Once done, click the export button to save.
          </li>
          <li>
            <b>Can I use this tool for debugging?</b> <br /> Yes, our HAR file
            reader is useful for debugging web traffic and network performance,
            providing insights into network requests and responses.
          </li>
        </ul>
      </section>
    </div>
  );
}
