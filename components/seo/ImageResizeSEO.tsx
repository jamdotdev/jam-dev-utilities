import Link from "next/link";

export default function ImageResizeSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Free, Open Source & Ad-free</h2>
        <p>
          This free image resizer is a versatile tool that allows you to resize
          various image formats, including PNG, JPEG, and SVG. While PNG and
          JPEG images are raster-based and can have their dimensions adjusted,
          SVGs are vector-based and can be scaled infinitely without losing
          quality. Whether you need to reduce file size, adjust dimensions, or
          convert formats, our tool can help. Made with 💜 by the developers
          building Jam.
        </p>
      </section>

      <section>
        <h2>How to Use the Image Resizer</h2>
        <p>
          Resizing images with our online tool is simple and straightforward.
          Just upload your image, select the desired dimensions and format, and
          download the resized image. No signup required. Here's how:
        </p>
        <ul>
          <li>
            <b>Step 1:</b> <br /> Upload your image: Choose the image file you
            want to resize. Supported formats include PNG, JPEG, and SVG.
          </li>
          <li>
            <b>Step 2:</b> <br /> Select dimensions (for PNG/JPEG): Enter the
            width or height, and the tool will maintain the aspect ratio. For
            SVG, you can scale the image as needed.
          </li>
          <li>
            <b>Step 3:</b> <br /> Choose the format: Select between PNG, JPEG,
            or keep it as SVG.
          </li>
          <li>
            <b>Step 4:</b> <br /> Download: Click the button to download the
            resized image.
          </li>
        </ul>
      </section>

      <section>
        <h2>Benefits of Using an Image Resizer</h2>
        <p>
          Resizing images helps in optimizing their use across different
          platforms and devices. Whether you're a developer, designer, or
          content creator, resizing images can greatly enhance the performance
          and aesthetics of your work.
        </p>
        <ul>
          <li>
            <b>Performance:</b> <br /> Smaller image files load faster,
            improving website performance and user experience.
          </li>
          <li>
            <b>Compatibility:</b> <br /> Ensure your images fit perfectly on
            different screens and devices by adjusting their dimensions.
          </li>
          <li>
            <b>File Size Reduction:</b> <br /> Reducing the dimensions can
            significantly decrease the file size without losing quality. This is
            particularly effective with PNG and JPEG formats.
          </li>
          <li>
            <b>SVG Scalability:</b> <br /> SVG images are vector-based, meaning
            they can be scaled infinitely without losing quality. Our tool
            allows you to resize SVGs for different contexts or convert them to
            PNG/JPEG if needed.
          </li>
        </ul>
      </section>

      <section>
        <h2>More Image Tools: Easy Conversion</h2>
        <p>
          Explore other image conversion tools available on Jam.dev for
          developers and designers. They're all free, open source, and available
          in dark mode too.
        </p>
        <ul>
          <li>
            <Link href="/utilities/image-to-base64">Image to Base64</Link>:
            Instantly convert images to Base64 strings. Embed images directly in
            your code with ease.
          </li>
          <li>
            <Link href="/utilities/hex-to-rgb">HEX to RGB</Link>: Easily convert
            HEX to RGB and generate CSS snippets for web development.
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQs</h2>
        <ul>
          <li>
            <b>How does the image resizer maintain quality?</b> <br /> Our tool
            uses advanced algorithms to resize images while preserving their
            original quality, ensuring sharpness and clarity. For SVGs, the tool
            ensures that the vector quality is maintained at any size.
          </li>
          <li>
            <b>What formats are supported?</b> <br /> Currently, our tool
            supports PNG, JPEG, and SVG formats, which are the most commonly
            used image formats on the web.
          </li>
          <li>
            <b>Can I resize images to specific dimensions?</b> <br /> Yes, you
            can specify either the width or height, and the aspect ratio will be
            maintained automatically. This applies to both raster formats (PNG,
            JPEG) and vector formats (SVG).
          </li>
          <li>
            <b>Is there a limit to the image size?</b> <br /> Our tool is
            designed to handle typical image sizes used in web and mobile
            applications, but extremely large files may take longer to process.
            SVGs are generally lightweight and can be resized quickly.
          </li>
          <li>
            <b>Is this tool free to use?</b> <br /> Yes, the image resizer is
            completely free to use, without any hidden costs or limitations.
          </li>
        </ul>
      </section>
    </div>
  );
}
