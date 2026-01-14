import Link from "next/link";

export default function Base64ToImageSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Convert Base64 to Image</h2>
        <p>
          Jam's free Base64 to Image converter lets you instantly preview
          Base64-encoded image data. Simply paste your Base64 string and see the
          decoded image. This tool is perfect for developers working with
          embedded images, debugging API responses, or verifying Base64-encoded
          image data.
        </p>
      </section>

      <section>
        <h2>How to Use:</h2>
        <ul>
          <li>
            <b>Paste your Base64 string:</b> <br /> Enter the Base64-encoded
            image data into the text field. You can paste either a raw Base64
            string or a complete data URI (e.g., data:image/png;base64,...).
          </li>
          <li>
            <b>View the preview:</b> <br /> The decoded image will automatically
            appear below the input field.
          </li>
        </ul>
      </section>

      <section>
        <h2>Related Tools</h2>
        <p>
          Need to convert an image to Base64 instead? Use our{" "}
          <Link
            href="/utilities/image-to-base64"
            className="text-primary underline hover:no-underline"
          >
            Image to Base64 Converter
          </Link>{" "}
          to encode images into Base64 format. For encoding and decoding text
          strings, check out our{" "}
          <Link
            href="/utilities/base-64-encoder"
            className="text-primary underline hover:no-underline"
          >
            Base64 Encoder/Decoder
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Base64 Image Decoding Use Cases</h2>
        <ul>
          <li>
            <b>Debugging API responses:</b> <br /> Quickly verify that
            Base64-encoded images in API responses are correct.
          </li>
          <li>
            <b>Email template development:</b> <br /> Preview embedded images in
            email templates that use Base64 encoding.
          </li>
          <li>
            <b>Data URI validation:</b> <br /> Verify that data URIs are
            properly formatted and contain valid image data.
          </li>
          <li>
            <b>Database content inspection:</b> <br /> View images stored as
            Base64 strings in databases.
          </li>
        </ul>
      </section>

      <section>
        <h2>Understanding Base64 Image Encoding</h2>
        <p>
          Base64 encoding converts binary image data into ASCII text, making it
          safe to transmit over text-based protocols like HTTP, email, and JSON.
          This is commonly used for embedding small images directly in HTML,
          CSS, or JavaScript without requiring separate HTTP requests.
        </p>
        <p>
          A Base64-encoded image typically appears as a data URI in the format:
          <code className="block mt-2 p-2 bg-muted rounded text-sm">
            data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...
          </code>
        </p>
        <p>
          This tool accepts both the full data URI format and raw Base64 strings
          without the prefix.
        </p>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>What image formats are supported?</b> <br /> This tool supports
            all common image formats including PNG, JPEG, GIF, WebP, and SVG
            when properly Base64-encoded.
          </li>
          <li>
            <b>Do I need to include the data URI prefix?</b> <br /> No, you can
            paste either a raw Base64 string or a complete data URI. The tool
            will handle both formats.
          </li>
          <li>
            <b>Is my data secure?</b> <br /> Yes, all processing happens locally
            in your browser. Your data is never sent to any server.
          </li>
          <li>
            <b>Why is my image not displaying?</b> <br /> Make sure your Base64
            string is valid and represents actual image data. The string should
            only contain valid Base64 characters (A-Z, a-z, 0-9, +, /, =).
          </li>
        </ul>
      </section>
    </div>
  );
}
