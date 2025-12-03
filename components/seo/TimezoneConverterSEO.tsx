import CodeExample from "../CodeExample";

export default function TimezoneConverterSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Easily convert times between different timezones with this free tool.
          Perfect for remote software teams who need to schedule syncs,
          meetings, and standups across multiple timezones. No more mental math
          or timezone confusion.
        </p>
      </section>

      <section>
        <h2>Features:</h2>
        <ul>
          <li>
            <b>Instant Conversion:</b> <br /> Select a time and see it converted
            across all major timezones instantly.
          </li>
          <li>
            <b>Common Timezones:</b> <br /> Pre-configured with the most common
            timezones for distributed teams including US, Europe, and Asia.
          </li>
          <li>
            <b>Open Source:</b> <br /> Made with love by the developers building
            Jam.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to use the Timezone Converter:</h2>
        <ul>
          <li>
            <b>Step 1:</b> <br /> Select your source timezone and enter the time
            you want to convert.
          </li>
          <li>
            <b>Step 2:</b> <br /> View the converted times across all selected
            timezones.
          </li>
          <li>
            <b>Step 3:</b> <br /> Toggle timezones on/off to customize your
            view.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why Use a Timezone Converter?</h2>
        <p>
          Remote teams often span multiple continents and timezones. Scheduling
          meetings that work for everyone can be challenging. A timezone
          converter helps you:
        </p>
        <ul>
          <li>
            <b>Schedule Meetings:</b> <br /> Find times that work across
            different regions without manual calculations.
          </li>
          <li>
            <b>Avoid Confusion:</b> <br /> Eliminate timezone math errors that
            can lead to missed meetings.
          </li>
          <li>
            <b>Plan Ahead:</b> <br /> See how a proposed meeting time affects
            team members in different locations.
          </li>
        </ul>
      </section>

      <section>
        <h2>Convert Timezones in JavaScript:</h2>
        <p>
          If you need to convert timezones programmatically in your own
          applications, here is a code snippet using the Intl API:
        </p>
      </section>

      <section>
        <CodeExample>{jsCodeExample}</CodeExample>
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>Does this tool handle Daylight Saving Time?</b> <br /> Yes, the
            converter automatically accounts for DST changes in each timezone.
          </li>
          <li>
            <b>What timezones are supported?</b> <br /> We support all major
            timezones including US (PT, MT, CT, ET), Europe (GMT, CET), and Asia
            (IST, SGT, JST).
          </li>
          <li>
            <b>Can I use this for scheduling recurring meetings?</b> <br /> Yes,
            simply select the date and time for your meeting and see how it
            translates across timezones.
          </li>
        </ul>
      </section>
    </div>
  );
}

const jsCodeExample = `function convertTimezone(date: Date, fromTz: string, toTz: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  return formatter.format(date);
}

// Example usage:
const nyTime = new Date('2024-01-15T09:00:00');
console.log(convertTimezone(nyTime, 'America/New_York', 'Europe/London'));
// Output: "Mon, Jan 15, 02:00 PM"
`;
