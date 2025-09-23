import CodeExample from "../CodeExample";

export default function TimestampSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Convert between Unix timestamps and human-readable dates bidirectionally with
          this free epoch converter tool. Whether you&apos;re{" "}
          <a
            href="https://jam.dev/tracing"
            target="_blank"
            rel="noopener noreferrer"
          >
            debugging logs
          </a>
          , analyzing datasets, or working on web development projects, this comprehensive epoch
          converter handles both timestamp-to-date and date-to-timestamp conversions seamlessly.
        </p>
      </section>

      <section>
        <h2>Features:</h2>
        <ul>
          <li>
            <b>Bidirectional Conversion:</b> <br /> Convert Unix timestamps to dates or 
            dates to Unix timestamps - both directions supported.
          </li>
          <li>
            <b>Multiple Formats:</b> <br /> Supports Unix seconds, milliseconds, ISO 8601 dates,
            and human-readable date strings.
          </li>
          <li>
            <b>Instant Conversion:</b> <br /> No need to click any buttons—just
            enter your input and get the result instantly.
          </li>
          <li>
            <b>Accurate Results:</b> <br /> Provides precise conversion for both
            your local time zone and UTC time.
          </li>
          <li>
            <b>Open Source:</b> <br /> Made with 💜 by the developers building
            Jam.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to use Jam&apos;s Online Epoch Converter:</h2>
        <p>
          Convert between Unix timestamps and dates in both directions. Using our bidirectional epoch
          converter is straightforward:
        </p>
        <ul>
          <li>
            <b>Timestamp to Date:</b> <br /> Enter a Unix timestamp (seconds or milliseconds)
            to get human-readable date formats.
          </li>
          <li>
            <b>Date to Timestamp:</b> <br /> Enter an ISO date string or human-readable date
            to get Unix timestamps in both seconds and milliseconds.
          </li>
          <li>
            <b>Auto-detection:</b> <br /> The tool automatically detects your input format
            and converts accordingly.
          </li>
        </ul>
        <p>
          Your converted result is displayed instantly and ready to be
          copied to your clipboard.
        </p>
      </section>

      <section>
        <h2>What is a Unix Timestamp?</h2>
        <p>
          A Unix timestamp numerically represents a specific point in time. It
          shows the number of seconds since January 1st, 1970, UTC—known as the
          Unix epoch. Computers use this format, also called Epoch time, to
          track and sort dated information without accounting for leap seconds.
          Epoch timestamps are essential for operating systems and file formats.
        </p>
      </section>

      <section>
        <h2>The Year 2038 Problem:</h2>
        <p>
          Computing systems often store Unix timestamps as 32-bit integers. A
          32-bit integer can only represent dates up to January 19, 2038,
          causing the Year 2038 problem. Converting these timestamps into
          readable dates often requires understanding this 32-bit limitation.
        </p>
      </section>

      <section>
        <h2>Why Convert Unix Time to Dates?</h2>
        <p>
          While timestamps are useful for calculations and data storage, they
          are not user-friendly. Converting epoch time to readable dates helps
          you:
        </p>
        <ul>
          <li>
            <b>Understand Logs:</b> <br /> Easily read and analyze event logs.
          </li>
          <li>
            <b>Debugging:</b> <br /> Quickly identify when specific events
            occurred in your applications.
          </li>
          <li>
            <b>Study Data:</b> <br /> Change Unix timestamp to date in your data
            to better understand time-related trends and patterns.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to Convert Timestamps to Date:</h2>
        <p>
          If you need to convert epoch to time directly in your own
          applications, here is the code snippet from our app that you can use
          for JavaScript/TypeScript. This snippet automatically handles both
          milliseconds and seconds:
        </p>
      </section>

      <section>
        <CodeExample>{jsCodeExample}</CodeExample>
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>How accurate is Jam&apos;s Unix time converter?</b> <br /> Our
            converter gives you the correct date and time by taking into account
            both local and UTC time formats.
          </li>
          <li>
            <b>
              Is the Timestamp to Date converter suitable for all time-related
              data?
            </b>{" "}
            <br /> Yes, we&apos;ve designed our tool to handle any type of
            time-related data, making it perfect for developers, data analysts,
            and anyone working with time data.
          </li>
          <li>
            <b>How easy is it to use the Timestamp to Date converter?</b> <br />{" "}
            Our converter is user-friendly and intuitive, allowing anyone to use
            it without technical knowledge. Simply enter your Unix timestamp,
            and the tool will do the rest.
          </li>
          <li>
            <b>What happens in 2038?</b> <br /> Unix timestamps stored as 32-bit
            integers will overflow, causing systems to misinterpret the date as
            December 13, 1901. Upgrading to 64-bit integers extends the
            timestamp range and solves the issue.
          </li>
        </ul>
      </section>
    </div>
  );
}

const jsCodeExample = `function convertTimestampToDate(timestamp: string) {
  let date: Date;

  if (/^\\d{11,13}$/.test(timestamp)) {
    // Milliseconds
    date = new Date(parseInt(timestamp, 10));
  } else if (/^\\d{1,10}$/.test(timestamp)) {
    // Seconds
    date = new Date(parseInt(timestamp, 10) * 1000);
  } else {
    throw new Error("Invalid timestamp format");
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date.toUTCString(); // Returns the date in UTC string format
}
`;
