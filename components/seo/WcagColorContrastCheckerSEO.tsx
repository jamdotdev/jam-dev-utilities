export default function WcagColorContrastCheckerSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>Check Color Contrast for WCAG Compliance</h2>
        <p>
          Ensure your designs meet accessibility standards with our free WCAG
          color contrast checker. This tool helps you verify that your color
          combinations meet WCAG 2.1 AA and AAA compliance requirements for both
          normal and large text.
        </p>
      </section>

      <section>
        <h2>How to Use Jam's WCAG Color Contrast Checker</h2>
        <p>
          Quickly verify color contrast ratios and ensure your designs meet
          accessibility standards. Perfect for designers, developers, and anyone
          working on accessible web content.
        </p>
        <ul>
          <li>
            <b>Enter your foreground color:</b> Input your text color in hex
            format (e.g., #000000)
          </li>
          <li>
            <b>Enter your background color:</b> Input your background color in
            hex format (e.g., #FFFFFF)
          </li>
          <li>
            <b>Review the results:</b> Instantly see the contrast ratio and WCAG
            compliance status for both AA and AAA standards
          </li>
        </ul>
      </section>

      <section>
        <h2>Understanding WCAG Color Contrast Requirements</h2>
        <p>
          The Web Content Accessibility Guidelines (WCAG) 2.1 define minimum
          contrast ratios to ensure text is readable for people with visual
          impairments. The contrast ratio measures the difference in luminance
          between text and background colors.
        </p>
        <ul>
          <li>
            <b>WCAG AA Normal text:</b> Requires 4.5:1 contrast ratio (text
            smaller than 18pt or 14pt bold)
          </li>
          <li>
            <b>WCAG AA Large text:</b> Requires 3:1 contrast ratio (text 18pt+
            or 14pt+ bold)
          </li>
          <li>
            <b>WCAG AA Graphical objects and UI components:</b> Requires 3:1
            contrast ratio for essential visual information like icons, buttons,
            form controls, and other interactive elements
          </li>
          <li>
            <b>WCAG AAA Normal text:</b> Requires 7:1 contrast ratio (text
            smaller than 18pt or 14pt bold)
          </li>
          <li>
            <b>WCAG AAA Large text:</b> Requires 4.5:1 contrast ratio (text
            18pt+ or 14pt+ bold)
          </li>
        </ul>
      </section>

      <section>
        <h2>Graphical Objects and User Interface Components</h2>
        <p>
          WCAG 2.1 also requires a minimum 3:1 contrast ratio for graphical
          objects and user interface components. This includes icons, buttons,
          form controls, charts, graphs, and other essential visual elements
          that convey information or require user interaction. Our tool checks
          compliance for these elements, helping you ensure that all parts of
          your interface are accessible to users with visual impairments.
        </p>
      </section>

      <section>
        <h2>Why Color Contrast Matters for Accessibility</h2>
        <p>
          Proper color contrast is essential for accessibility. It ensures that
          people with visual impairments, color blindness, or those viewing
          content in bright sunlight can read your text and interact with your
          interface. Meeting WCAG standards not only improves accessibility but
          also helps you comply with legal requirements in many jurisdictions.
          Our tool calculates the contrast ratio using the WCAG 2.1 formula,
          which considers the relative luminance of colors.
        </p>
      </section>
    </div>
  );
}
