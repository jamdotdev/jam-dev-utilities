export default function UnserializerSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Free Online Unserializer - Parse Serialized Data Instantly</h2>
        <p>
          Paste a serialized string and instantly convert it into a
          human-readable format. Choose between print_r() for a quick overview
          or var_dump() for type-annotated detail. Ideal for inspecting
          WordPress options, transients, and metadata stored in the database.
        </p>
      </section>

      <section>
        <h2>How to Use the Unserializer</h2>
        <ul>
          <li>
            <b>Step 1:</b> <br />
            Paste a serialized string into the input box. You can grab these
            from database fields, API responses, or debug logs.
          </li>
          <li>
            <b>Step 2:</b> <br />
            Select an output format — <kbd>print_r()</kbd> for a compact view or{" "}
            <kbd>var_dump()</kbd> for detailed type and length information.
          </li>
          <li>
            <b>Step 3:</b> <br />
            Copy the formatted output and use it in your debugging workflow.
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>What is a serialized string?</b>
            <br />
            Serialization converts a data structure into a compact string
            representation for storage or transfer. This tool reverses that
            process so you can read the original data.
          </li>
          <li>
            <b>Where do I find serialized data?</b>
            <br />
            Common sources include the WordPress wp_options table, user meta
            fields, WooCommerce order meta, transient caches, and plugin
            settings stored in the database.
          </li>
          <li>
            <b>What is the difference between print_r() and var_dump()?</b>
            <br />
            print_r() shows values and structure in a concise format. var_dump()
            adds explicit type and length annotations for every value, which is
            more useful for type-sensitive debugging.
          </li>
          <li>
            <b>Does this tool modify the original data?</b>
            <br />
            No. The tool only reads and formats the input — nothing is stored,
            sent, or altered.
          </li>
        </ul>
      </section>
    </div>
  );
}
