/**
 * Function to convert environment variables to Netlify TOML format.
 * Contributed by Cassidy Williams: https://x.com/cassidoo
 */
export function envToToml(envString: string): string {
  const lines = envString
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));

  if (lines.length === 0) {
    return "";
  }

  const environmentVariables = lines
    .map((line) => {
      const [key, value] = line.split("=");
      const sanitizedValue = value.replace(/^"|"$/g, "");

      return `${key}="${sanitizedValue}"`;
    })
    .join(", ");

  return `[context.production]
  environment = {${environmentVariables}}`;
}
