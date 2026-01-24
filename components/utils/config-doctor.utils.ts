/**
 * Config Doctor Utility Functions
 * Parses .env files, analyzes security risks, and converts to platform-specific formats.
 */

// Types
export type Platform = "netlify" | "vercel" | "cloudflare";
export type RiskLevel = "safe" | "warning" | "danger";
export type SecretType =
  | "api_key"
  | "password"
  | "token"
  | "private_key"
  | "connection_string"
  | "cloud_credential"
  | "public"
  | "unknown";

export interface EnvVariable {
  key: string;
  value: string;
  line: number;
  isSecret: boolean;
  secretType: SecretType;
  riskLevel: RiskLevel;
  recommendation?: string;
}

export interface SecurityPattern {
  pattern: RegExp;
  type: SecretType;
  risk: RiskLevel;
  recommendation: string;
}

// Security patterns for detecting sensitive environment variables
export const SECRET_PATTERNS: SecurityPattern[] = [
  // Danger - API Keys and Secrets
  {
    pattern: /^(.*_)?API_KEY$/i,
    type: "api_key",
    risk: "danger",
    recommendation: "Store as a secret environment variable, never commit to git",
  },
  {
    pattern: /^(.*_)?SECRET(_KEY)?$/i,
    type: "api_key",
    risk: "danger",
    recommendation: "Store as a secret environment variable, never commit to git",
  },
  {
    pattern: /^(.*_)?API_SECRET$/i,
    type: "api_key",
    risk: "danger",
    recommendation: "Store as a secret environment variable, never commit to git",
  },
  {
    pattern: /^OPENAI_/i,
    type: "api_key",
    risk: "danger",
    recommendation:
      "OpenAI API keys can incur significant costs if exposed. Rotate immediately if compromised.",
  },
  {
    pattern: /^STRIPE_(SECRET|LIVE|TEST)_/i,
    type: "api_key",
    risk: "danger",
    recommendation:
      "Stripe secret keys allow full access to your account. Use restricted keys when possible.",
  },
  {
    pattern: /^STRIPE_.*_KEY$/i,
    type: "api_key",
    risk: "danger",
    recommendation:
      "Stripe keys should be stored securely. Publishable keys are safe for client-side use.",
  },

  // Danger - Cloud Credentials
  {
    pattern: /^AWS_/i,
    type: "cloud_credential",
    risk: "danger",
    recommendation:
      "AWS credentials can access your entire cloud infrastructure. Use IAM roles instead when possible.",
  },
  {
    pattern: /^AZURE_/i,
    type: "cloud_credential",
    risk: "danger",
    recommendation:
      "Azure credentials should use managed identities in production.",
  },
  {
    pattern: /^GCP_/i,
    type: "cloud_credential",
    risk: "danger",
    recommendation:
      "GCP credentials should use service accounts with minimal permissions.",
  },
  {
    pattern: /^GOOGLE_/i,
    type: "cloud_credential",
    risk: "danger",
    recommendation: "Google credentials should be stored as secrets.",
  },

  // Danger - Database and Connection Strings
  {
    pattern: /^DATABASE_URL$/i,
    type: "connection_string",
    risk: "danger",
    recommendation:
      "Database URLs contain credentials. Never expose in client-side code.",
  },
  {
    pattern: /^(MONGODB|MONGO)_/i,
    type: "connection_string",
    risk: "danger",
    recommendation:
      "MongoDB connection strings contain credentials. Use environment secrets.",
  },
  {
    pattern: /^(REDIS|REDISCLOUD)_/i,
    type: "connection_string",
    risk: "danger",
    recommendation: "Redis URLs may contain authentication. Store securely.",
  },
  {
    pattern: /^(POSTGRES|PG|MYSQL|MARIA)_/i,
    type: "connection_string",
    risk: "danger",
    recommendation:
      "Database credentials should be stored as secrets, not in version control.",
  },
  {
    pattern: /^SUPABASE_/i,
    type: "connection_string",
    risk: "danger",
    recommendation:
      "Supabase keys should be stored securely. Anon keys are safe for client-side.",
  },

  // Danger - Auth and Tokens
  {
    pattern: /^JWT_SECRET$/i,
    type: "token",
    risk: "danger",
    recommendation:
      "JWT secrets allow forging authentication tokens. Keep strictly confidential.",
  },
  {
    pattern: /^(.*_)?TOKEN$/i,
    type: "token",
    risk: "danger",
    recommendation:
      "Tokens should be stored as secrets and rotated regularly.",
  },
  {
    pattern: /^AUTH_/i,
    type: "token",
    risk: "danger",
    recommendation:
      "Authentication secrets should never be exposed in client-side code.",
  },
  {
    pattern: /^SESSION_SECRET$/i,
    type: "token",
    risk: "danger",
    recommendation:
      "Session secrets allow session hijacking if exposed. Keep confidential.",
  },
  {
    pattern: /^ENCRYPTION_KEY$/i,
    type: "token",
    risk: "danger",
    recommendation:
      "Encryption keys should be stored in a secrets manager, never in code.",
  },

  // Danger - Private Keys
  {
    pattern: /^PRIVATE_KEY$/i,
    type: "private_key",
    risk: "danger",
    recommendation:
      "Private keys should be stored in a secrets manager or HSM.",
  },
  {
    pattern: /^(.*_)?PRIVATE(_KEY)?$/i,
    type: "private_key",
    risk: "danger",
    recommendation:
      "Private keys grant access to encrypted communications. Protect carefully.",
  },

  // Warning - Passwords
  {
    pattern: /^(.*_)?PASSWORD$/i,
    type: "password",
    risk: "warning",
    recommendation:
      "Passwords should be stored as secrets, not in configuration files.",
  },

  // Safe - Public keys (designed to be exposed)
  {
    pattern: /^NEXT_PUBLIC_/i,
    type: "public",
    risk: "safe",
    recommendation: "Safe to expose in client-side code by design.",
  },
  {
    pattern: /^VITE_/i,
    type: "public",
    risk: "safe",
    recommendation: "Vite public variables are designed for client-side use.",
  },
  {
    pattern: /^REACT_APP_/i,
    type: "public",
    risk: "safe",
    recommendation:
      "Create React App public variables are designed for client-side use.",
  },
  {
    pattern: /^NUXT_PUBLIC_/i,
    type: "public",
    risk: "safe",
    recommendation: "Nuxt public variables are designed for client-side use.",
  },
  {
    pattern: /^EXPO_PUBLIC_/i,
    type: "public",
    risk: "safe",
    recommendation: "Expo public variables are designed for client-side use.",
  },
];

/**
 * Analyze a single environment variable key for security risks
 */
export function analyzeSecurityRisk(key: string): {
  isSecret: boolean;
  secretType: SecretType;
  riskLevel: RiskLevel;
  recommendation: string;
} {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.pattern.test(key)) {
      return {
        isSecret: pattern.risk !== "safe",
        secretType: pattern.type,
        riskLevel: pattern.risk,
        recommendation: pattern.recommendation,
      };
    }
  }

  // Default: unknown variables get a warning
  return {
    isSecret: false,
    secretType: "unknown",
    riskLevel: "warning",
    recommendation:
      "Review if this variable contains sensitive data before exposing.",
  };
}

/**
 * Parse a .env file content into structured EnvVariable objects
 */
export function parseEnvFile(content: string): EnvVariable[] {
  if (!content.trim()) {
    return [];
  }

  const lines = content.split("\n");
  const variables: EnvVariable[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      return;
    }

    // Parse KEY=VALUE format
    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex === -1) {
      return; // Invalid line, skip
    }

    const key = trimmedLine.substring(0, equalIndex).trim();
    let value = trimmedLine.substring(equalIndex + 1).trim();

    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Analyze security risk
    const securityAnalysis = analyzeSecurityRisk(key);

    variables.push({
      key,
      value,
      line: index + 1,
      ...securityAnalysis,
    });
  });

  return variables;
}

/**
 * Convert environment variables to Netlify TOML format
 */
export function convertToNetlify(vars: EnvVariable[]): string {
  if (vars.length === 0) {
    return "";
  }

  const envLines = vars
    .map((v) => `  ${v.key} = "${escapeTomlValue(v.value)}"`)
    .join("\n");

  return `[context.production.environment]\n${envLines}`;
}

/**
 * Convert environment variables to Vercel JSON format
 */
export function convertToVercel(vars: EnvVariable[]): string {
  if (vars.length === 0) {
    return "{}";
  }

  const envObject: Record<string, string> = {};
  const secretsComments: string[] = [];

  vars.forEach((v) => {
    if (v.riskLevel === "danger") {
      // For secrets, suggest using Vercel's secret reference format
      const secretName = v.key.toLowerCase().replace(/_/g, "-");
      envObject[v.key] = `@${secretName}`;
      secretsComments.push(
        `# ${v.key}: Add secret via: vercel secrets add ${secretName} "your-value"`
      );
    } else {
      envObject[v.key] = v.value;
    }
  });

  const jsonOutput = JSON.stringify({ env: envObject }, null, 2);

  if (secretsComments.length > 0) {
    return `${secretsComments.join("\n")}\n\n${jsonOutput}`;
  }

  return jsonOutput;
}

/**
 * Convert environment variables to Cloudflare Pages wrangler.toml format
 */
export function convertToCloudflare(vars: EnvVariable[]): string {
  if (vars.length === 0) {
    return "";
  }

  const publicVars: EnvVariable[] = [];
  const secretVars: EnvVariable[] = [];

  vars.forEach((v) => {
    if (v.riskLevel === "danger") {
      secretVars.push(v);
    } else {
      publicVars.push(v);
    }
  });

  let output = "";

  if (publicVars.length > 0) {
    output += "[vars]\n";
    publicVars.forEach((v) => {
      output += `${v.key} = "${escapeTomlValue(v.value)}"\n`;
    });
  }

  if (secretVars.length > 0) {
    output += "\n# Secrets - set via Cloudflare dashboard or wrangler CLI:\n";
    secretVars.forEach((v) => {
      output += `# wrangler secret put ${v.key}\n`;
    });
  }

  return output.trim();
}

/**
 * Convert environment variables to the specified platform format
 */
export function convertToPlatform(
  vars: EnvVariable[],
  platform: Platform
): string {
  switch (platform) {
    case "netlify":
      return convertToNetlify(vars);
    case "vercel":
      return convertToVercel(vars);
    case "cloudflare":
      return convertToCloudflare(vars);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Escape special characters for TOML values
 */
function escapeTomlValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Get summary statistics for security analysis
 */
export function getSecuritySummary(vars: EnvVariable[]): {
  total: number;
  safe: number;
  warning: number;
  danger: number;
} {
  return {
    total: vars.length,
    safe: vars.filter((v) => v.riskLevel === "safe").length,
    warning: vars.filter((v) => v.riskLevel === "warning").length,
    danger: vars.filter((v) => v.riskLevel === "danger").length,
  };
}

/**
 * Platform display information
 */
export const PLATFORM_INFO: Record<
  Platform,
  { name: string; configFile: string; docsUrl: string }
> = {
  netlify: {
    name: "Netlify",
    configFile: "netlify.toml",
    docsUrl: "https://docs.netlify.com/environment-variables/overview/",
  },
  vercel: {
    name: "Vercel",
    configFile: "vercel.json",
    docsUrl:
      "https://vercel.com/docs/projects/environment-variables",
  },
  cloudflare: {
    name: "Cloudflare Pages",
    configFile: "wrangler.toml",
    docsUrl:
      "https://developers.cloudflare.com/pages/functions/bindings/#environment-variables",
  },
};
