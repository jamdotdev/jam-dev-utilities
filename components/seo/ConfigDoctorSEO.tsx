export default function ConfigDoctorSEO() {
  return (
    <div className="content-wrapper">
      <section>
        <h2>What is Config Doctor?</h2>
        <p>
          Config Doctor is a free tool that converts your <kbd>.env</kbd>{" "}
          environment files into platform-specific deployment configurations for{" "}
          <strong>Netlify</strong>, <strong>Vercel</strong>, and{" "}
          <strong>Cloudflare Pages</strong>. It also analyzes your environment
          variables for security risks and provides AI-powered explanations for
          sensitive configurations.
        </p>
      </section>

      <section>
        <h2>Features</h2>
        <ul>
          <li>
            <strong>Multi-Platform Support:</strong> Convert to Netlify&apos;s{" "}
            <kbd>netlify.toml</kbd>, Vercel&apos;s <kbd>vercel.json</kbd>, or
            Cloudflare&apos;s <kbd>wrangler.toml</kbd> formats.
          </li>
          <li>
            <strong>Security Analysis:</strong> Automatically detects API keys,
            database credentials, authentication tokens, and other sensitive
            data.
          </li>
          <li>
            <strong>AI Explanations:</strong> Get detailed security
            recommendations powered by on-device AI (no data sent to servers).
          </li>
          <li>
            <strong>Smart Secret Handling:</strong> Secrets are flagged with
            instructions for secure storage using each platform&apos;s secrets
            management.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to Use</h2>
        <ol>
          <li>
            <strong>Select your target platform:</strong>
            <p>
              Choose Netlify, Vercel, or Cloudflare Pages depending on where
              you&apos;re deploying.
            </p>
          </li>
          <li>
            <strong>Paste your .env file:</strong>
            <p>
              Copy the contents of your <kbd>.env</kbd> file and paste them into
              the input area. Comments and empty lines are handled
              automatically.
            </p>
          </li>
          <li>
            <strong>Review security warnings:</strong>
            <p>
              Check the security analysis panel to see which variables are
              flagged as sensitive. Click on any variable for details and
              AI-powered explanations.
            </p>
          </li>
          <li>
            <strong>Copy the output:</strong>
            <p>
              Copy the generated configuration and add it to your deployment
              config file. Follow the instructions for storing secrets securely.
            </p>
          </li>
        </ol>
      </section>

      <section>
        <h2>Security Levels Explained</h2>
        <ul>
          <li>
            <strong>
              <span style={{ color: "#dc2626" }}>Secrets (Red):</span>
            </strong>{" "}
            Variables that should never be exposed in client-side code or
            committed to version control. These include API keys, database URLs,
            authentication tokens, and private keys.
          </li>
          <li>
            <strong>
              <span style={{ color: "#ca8a04" }}>Review (Yellow):</span>
            </strong>{" "}
            Variables that may or may not be sensitive. Review these to
            determine if they contain confidential data.
          </li>
          <li>
            <strong>
              <span style={{ color: "#16a34a" }}>Safe (Green):</span>
            </strong>{" "}
            Variables explicitly designed for client-side use, such as{" "}
            <kbd>NEXT_PUBLIC_*</kbd>, <kbd>VITE_*</kbd>, or{" "}
            <kbd>REACT_APP_*</kbd> prefixed variables.
          </li>
        </ul>
      </section>

      <section>
        <h2>Supported Patterns</h2>
        <p>Config Doctor recognizes common environment variable patterns:</p>
        <ul>
          <li>
            <strong>API Keys:</strong> <kbd>*_API_KEY</kbd>, <kbd>*_SECRET</kbd>,{" "}
            <kbd>OPENAI_*</kbd>, <kbd>STRIPE_*</kbd>
          </li>
          <li>
            <strong>Cloud Credentials:</strong> <kbd>AWS_*</kbd>,{" "}
            <kbd>AZURE_*</kbd>, <kbd>GCP_*</kbd>, <kbd>GOOGLE_*</kbd>
          </li>
          <li>
            <strong>Database URLs:</strong> <kbd>DATABASE_URL</kbd>,{" "}
            <kbd>MONGODB_*</kbd>, <kbd>REDIS_*</kbd>, <kbd>POSTGRES_*</kbd>
          </li>
          <li>
            <strong>Auth Tokens:</strong> <kbd>JWT_SECRET</kbd>,{" "}
            <kbd>*_TOKEN</kbd>, <kbd>SESSION_SECRET</kbd>
          </li>
          <li>
            <strong>Public Variables:</strong> <kbd>NEXT_PUBLIC_*</kbd>,{" "}
            <kbd>VITE_*</kbd>, <kbd>REACT_APP_*</kbd>, <kbd>NUXT_PUBLIC_*</kbd>
          </li>
        </ul>
      </section>

      <section>
        <h2>AI-Powered Analysis</h2>
        <p>
          The &quot;Explain with AI&quot; feature uses{" "}
          <a
            href="https://webllm.mlc.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            WebLLM
          </a>{" "}
          to run a language model directly in your browser. This means:
        </p>
        <ul>
          <li>
            <strong>Privacy First:</strong> Your environment variables never
            leave your device. All AI processing happens locally.
          </li>
          <li>
            <strong>One-Time Download:</strong> The AI model is downloaded once
            and cached in your browser for future use.
          </li>
          <li>
            <strong>Requires WebGPU:</strong> Works best in Chrome 113+ or Edge
            113+ with WebGPU support.
          </li>
        </ul>
      </section>

      <section>
        <h2>Platform-Specific Notes</h2>
        <h3>Netlify</h3>
        <p>
          Variables are output in the{" "}
          <kbd>[context.production.environment]</kbd> section of{" "}
          <kbd>netlify.toml</kbd>. For sensitive values, use Netlify&apos;s
          environment variable UI or CLI instead of committing them to the file.
        </p>

        <h3>Vercel</h3>
        <p>
          Secrets are referenced using the <kbd>@secret-name</kbd> syntax in{" "}
          <kbd>vercel.json</kbd>. You&apos;ll need to add the actual secret
          values using <kbd>vercel secrets add</kbd> or the Vercel dashboard.
        </p>

        <h3>Cloudflare Pages</h3>
        <p>
          Public variables go in the <kbd>[vars]</kbd> section of{" "}
          <kbd>wrangler.toml</kbd>. Secrets should be added using{" "}
          <kbd>wrangler secret put</kbd> or the Cloudflare dashboard.
        </p>
      </section>
    </div>
  );
}
