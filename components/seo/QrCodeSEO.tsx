import CodeExample from "../CodeExample";
import GetJamForFree from "./GetJamForFree";

export default function QrCodeSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <p>
          Create customizable QR codes with our free online generator. Add your
          logo, choose different styles (dots, squares, rounded corners), and
          customize colors. Perfect for marketing materials, business cards, and
          digital campaigns. No sign-up required — generate and download
          instantly. Made with 💜 by the developers building Jam.
        </p>
      </section>

      <section>
        <h2>How to Use the QR Code Generator:</h2>
        <p>
          Generate professional QR codes in seconds. Enter your text, URL, or
          data, customize the appearance with different styles and colors, and
          optionally add your logo to the center. Perfect for branding and
          marketing campaigns.
        </p>

        <p>Use Cases:</p>
        <ul>
          <li>
            <b>Marketing Campaigns:</b> Create branded QR codes for flyers,
            posters, and advertisements with your company logo.
          </li>
          <li>
            <b>Business Cards:</b> Generate QR codes linking to your contact
            information, website, or social media profiles.
          </li>
          <li>
            <b>Digital Menus:</b> Create QR codes for restaurant menus that
            customers can scan with their phones.
          </li>
          <li>
            <b>Event Tickets:</b> Generate unique QR codes for event check-ins
            and ticket validation.
          </li>
          <li>
            <b>WiFi Sharing:</b> Create QR codes that automatically connect
            users to your WiFi network.
          </li>
        </ul>
      </section>

      <section>
        <h2>QR Code Customization Options:</h2>
        <p>
          Our QR code generator offers extensive customization options to match
          your brand and style preferences:
        </p>
        <ul>
          <li>
            <b>Logo Integration:</b> Upload your company logo or image to embed
            in the center of the QR code while maintaining scannability.
          </li>
          <li>
            <b>Style Options:</b> Choose from square, rounded, dots, classy, and
            extra-rounded styles for the data modules.
          </li>
          <li>
            <b>Color Customization:</b> Set custom colors for the foreground,
            background, and corner elements to match your brand colors.
          </li>
          <li>
            <b>Error Correction:</b> Adjust error correction levels (L, M, Q, H)
            to balance QR code size with logo compatibility.
          </li>
          <li>
            <b>Multiple Formats:</b> Download your QR code as PNG, SVG, JPEG, or
            WebP for different use cases.
          </li>
        </ul>
      </section>

      <section>
        <h2>Understanding QR Code Error Correction:</h2>
        <p>
          QR codes include built-in error correction that allows them to be read
          even when partially damaged or obscured. This feature is particularly
          important when adding logos:
        </p>
        <ul>
          <li>
            <b>Low (L) ~7%:</b> Smallest QR code size, but less tolerance for
            logos and damage.
          </li>
          <li>
            <b>Medium (M) ~15%:</b> Good balance between size and error
            tolerance. Default for most applications.
          </li>
          <li>
            <b>Quartile (Q) ~25%:</b> Better for noisy environments and small
            logos.
          </li>
          <li>
            <b>High (H) ~30%:</b> Best choice when adding logos or expecting
            damage. Larger file size but maximum customization capability.
          </li>
        </ul>
      </section>

      <section>
        <h2>QR Code Best Practices:</h2>
        <p>
          Follow these guidelines to create effective and scannable QR codes:
        </p>
        <ul>
          <li>
            <b>Adequate Size:</b> Ensure your QR code is at least 2 x 2 cm (0.8
            x 0.8 inches) when printed to maintain scannability.
          </li>
          <li>
            <b>High Contrast:</b> Use high contrast between foreground and
            background colors for better readability.
          </li>
          <li>
            <b>Logo Size:</b> Keep logos under 20% of the QR code area to
            maintain scannability, especially with lower error correction
            levels.
          </li>
          <li>
            <b>Test Scanning:</b> Always test your QR codes with multiple
            devices and scanning apps before final use.
          </li>
          <li>
            <b>Clear Instructions:</b> Include clear call-to-action text like
            "Scan to visit website" near your QR code.
          </li>
        </ul>
      </section>

      <section>
        <h2>Working with QR Codes in JavaScript:</h2>
        <p>
          You can generate and work with QR codes programmatically using
          JavaScript libraries. Here's an example using a popular QR code
          library:
        </p>
        <CodeExample>{qrCodeExample}</CodeExample>
        <p>
          This code demonstrates basic QR code generation. For advanced features
          like custom styling and logos, consider using specialized libraries
          like qr-code-styling or similar tools.
        </p>
      </section>

      <section>
        <h2>Meet Jam: The Ultimate Tool for Debugging Web Apps</h2>
        <p>
          While this tool helps you create professional QR codes quickly,{" "}
          <a href="https://jam.dev?ref=utils" target="_blank" rel="noreferrer">
            Jam
          </a>{" "}
          streamlines your entire development workflow.
        </p>
        <p>
          Jam is{" "}
          <a
            href="https://chromewebstore.google.com/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci"
            target="_blank"
            rel="noreferrer"
          >
            the browser extension
          </a>{" "}
          helping over 140,000 users debug faster. It captures console logs,
          network requests, and more with just one click. Perfect for testing QR
          code landing pages and debugging web applications.
        </p>
      </section>

      <section>
        <GetJamForFree />
      </section>

      <section>
        <h2>FAQs:</h2>
        <ul>
          <li>
            <b>Can I add a logo to my QR code?</b> <br /> Yes! Our generator
            allows you to upload and embed logos in the center of your QR code.
            Use high error correction (H level) for best results with logos.
          </li>
          <li>
            <b>What file formats can I download?</b> <br /> You can download
            your QR code as PNG, SVG, JPEG, or WebP. SVG is recommended for
            print materials as it's vector-based and scalable.
          </li>
          <li>
            <b>How do I ensure my QR code scans properly?</b> <br /> Use high
            contrast colors, maintain adequate size (minimum 2x2 cm when
            printed), test with multiple devices, and avoid making logos too
            large.
          </li>
          <li>
            <b>What's the difference between error correction levels?</b> <br />
            Higher levels (Q, H) can recover from more damage and allow larger
            logos but create bigger QR codes. Lower levels (L, M) create smaller
            codes but are less tolerant of damage.
          </li>
          <li>
            <b>Can I change the shape of QR code elements?</b> <br /> Yes!
            Choose from squares, dots, rounded corners, and other stylish
            options to match your brand while maintaining scannability.
          </li>
          <li>
            <b>Is this QR code generator free?</b> <br /> Yes, our QR code
            generator is completely free with no limits on usage. Generate as
            many customized QR codes as you need.
          </li>
        </ul>
      </section>
    </div>
  );
}

const qrCodeExample = `// Basic QR code generation example
import QRCode from 'qrcode';

// Generate QR code as data URL
const generateQRCode = async (text) => {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
};

// Usage
generateQRCode('https://example.com')
  .then(dataURL => {
    // Use the data URL to display or download the QR code
    console.log('QR Code generated:', dataURL);
  });`;
