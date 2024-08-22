export default function CssUnitsConverter() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>CSS Units Converter by Jam.dev</h2>
        <p>
          Jam's free tool for converting CSS units. Whether you need to convert
          from pixels (px) to rem, vw, or other units, this tool makes it easy
          to switch between different CSS units with precision. It's designed
          for developers and designers who need to ensure their web layouts are
          consistent across various screen sizes and devices.
        </p>
      </section>

      <section>
        <h2>How to Use:</h2>
        <ul>
          <li>
            Enter the value you want to convert in the "Input Value" field.
          </li>
          <li>Select the unit of the value from the "From Unit" dropdown.</li>
          <li>
            Choose the unit to which you want to convert from the "To Unit"
            dropdown.
          </li>
          <li>
            If converting to or from units like vw, vh, vmin, or vmax, specify
            the container width in pixels.
          </li>
          <li>Click "Convert" to see the result.</li>
          <li>
            You can copy the converted value by clicking the "Copy" button.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why CSS Unit Conversions Matter</h2>
        <p>
          Converting CSS units is essential for creating responsive and
          accessible web designs. Different units serve different purposes:
        </p>
        <ul>
          <li>
            <b>Pixels (px):</b> Ideal for fixed-size elements, but not always
            suitable for responsive designs.
          </li>
          <li>
            <b>Rems:</b> These relative units scale based on the root or parent
            element, making it easier to create flexible and scalable designs.
          </li>
          <li>
            <b>Viewport Units (vw, vh, vmin, vmax):</b> These units are based on
            the size of the viewport, allowing for designs that adapt fluidly to
            different screen sizes. They're particularly useful for setting
            dimensions that should be a percentage of the viewport's width or
            height.
          </li>
        </ul>
        <p>
          By using the right units, you can ensure your designs are both
          visually consistent and adaptable, enhancing the user experience
          across a wide range of devices.
        </p>
      </section>
    </div>
  );
}
