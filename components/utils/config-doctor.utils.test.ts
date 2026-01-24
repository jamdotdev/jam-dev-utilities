import {
  parseEnvFile,
  analyzeSecurityRisk,
  convertToNetlify,
  convertToVercel,
  convertToCloudflare,
  convertToPlatform,
  getSecuritySummary,
  EnvVariable,
} from "./config-doctor.utils";

describe("parseEnvFile", () => {
  it("should return an empty array for empty input", () => {
    expect(parseEnvFile("")).toEqual([]);
    expect(parseEnvFile("   ")).toEqual([]);
  });

  it("should parse a single environment variable", () => {
    const result = parseEnvFile("KEY=value");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("KEY");
    expect(result[0].value).toBe("value");
    expect(result[0].line).toBe(1);
  });

  it("should parse multiple environment variables", () => {
    const input = `KEY1=value1
KEY2=value2
KEY3=value3`;
    const result = parseEnvFile(input);
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("KEY1");
    expect(result[1].key).toBe("KEY2");
    expect(result[2].key).toBe("KEY3");
  });

  it("should ignore comments", () => {
    const input = `# This is a comment
KEY=value
# Another comment`;
    const result = parseEnvFile(input);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("KEY");
  });

  it("should ignore empty lines", () => {
    const input = `
KEY1=value1

KEY2=value2

`;
    const result = parseEnvFile(input);
    expect(result).toHaveLength(2);
  });

  it("should handle values with double quotes", () => {
    const result = parseEnvFile('KEY="quoted value"');
    expect(result[0].value).toBe("quoted value");
  });

  it("should handle values with single quotes", () => {
    const result = parseEnvFile("KEY='quoted value'");
    expect(result[0].value).toBe("quoted value");
  });

  it("should handle values with equals signs", () => {
    const result = parseEnvFile("DATABASE_URL=postgres://user:pass@host/db?ssl=true");
    expect(result[0].key).toBe("DATABASE_URL");
    expect(result[0].value).toBe("postgres://user:pass@host/db?ssl=true");
  });

  it("should track correct line numbers", () => {
    const input = `# Comment
KEY1=value1

KEY2=value2`;
    const result = parseEnvFile(input);
    expect(result[0].line).toBe(2);
    expect(result[1].line).toBe(4);
  });

  it("should handle empty values", () => {
    const result = parseEnvFile("KEY=");
    expect(result[0].key).toBe("KEY");
    expect(result[0].value).toBe("");
  });
});

describe("analyzeSecurityRisk", () => {
  describe("danger level - API keys", () => {
    it("should detect API_KEY patterns", () => {
      expect(analyzeSecurityRisk("API_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("STRIPE_API_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("MY_SERVICE_API_KEY").riskLevel).toBe("danger");
    });

    it("should detect SECRET patterns", () => {
      expect(analyzeSecurityRisk("SECRET").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("SECRET_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("APP_SECRET").riskLevel).toBe("danger");
    });

    it("should detect OpenAI keys", () => {
      expect(analyzeSecurityRisk("OPENAI_API_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("OPENAI_ORG_ID").riskLevel).toBe("danger");
    });

    it("should detect Stripe keys", () => {
      expect(analyzeSecurityRisk("STRIPE_SECRET_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("STRIPE_LIVE_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("STRIPE_TEST_KEY").riskLevel).toBe("danger");
    });
  });

  describe("danger level - cloud credentials", () => {
    it("should detect AWS credentials", () => {
      expect(analyzeSecurityRisk("AWS_ACCESS_KEY_ID").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("AWS_SECRET_ACCESS_KEY").riskLevel).toBe("danger");
    });

    it("should detect Azure credentials", () => {
      expect(analyzeSecurityRisk("AZURE_CLIENT_ID").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("AZURE_CLIENT_SECRET").riskLevel).toBe("danger");
    });

    it("should detect GCP credentials", () => {
      expect(analyzeSecurityRisk("GCP_PROJECT_ID").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("GOOGLE_APPLICATION_CREDENTIALS").riskLevel).toBe("danger");
    });
  });

  describe("danger level - database connections", () => {
    it("should detect DATABASE_URL", () => {
      expect(analyzeSecurityRisk("DATABASE_URL").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("DATABASE_URL").secretType).toBe("connection_string");
    });

    it("should detect MongoDB URLs", () => {
      expect(analyzeSecurityRisk("MONGODB_URI").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("MONGO_URL").riskLevel).toBe("danger");
    });

    it("should detect Redis URLs", () => {
      expect(analyzeSecurityRisk("REDIS_URL").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("REDISCLOUD_URL").riskLevel).toBe("danger");
    });

    it("should detect SQL database URLs", () => {
      expect(analyzeSecurityRisk("POSTGRES_URL").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("MYSQL_HOST").riskLevel).toBe("danger");
    });
  });

  describe("danger level - auth tokens", () => {
    it("should detect JWT_SECRET", () => {
      expect(analyzeSecurityRisk("JWT_SECRET").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("JWT_SECRET").secretType).toBe("token");
    });

    it("should detect TOKEN patterns", () => {
      expect(analyzeSecurityRisk("ACCESS_TOKEN").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("REFRESH_TOKEN").riskLevel).toBe("danger");
    });

    it("should detect AUTH patterns", () => {
      expect(analyzeSecurityRisk("AUTH_SECRET").riskLevel).toBe("danger");
    });
  });

  describe("danger level - private keys", () => {
    it("should detect PRIVATE_KEY", () => {
      expect(analyzeSecurityRisk("PRIVATE_KEY").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("PRIVATE_KEY").secretType).toBe("private_key");
    });

    it("should detect private patterns", () => {
      expect(analyzeSecurityRisk("RSA_PRIVATE").riskLevel).toBe("danger");
      expect(analyzeSecurityRisk("SSH_PRIVATE_KEY").riskLevel).toBe("danger");
    });
  });

  describe("warning level", () => {
    it("should detect PASSWORD patterns", () => {
      expect(analyzeSecurityRisk("PASSWORD").riskLevel).toBe("warning");
      expect(analyzeSecurityRisk("DB_PASSWORD").riskLevel).toBe("warning");
      expect(analyzeSecurityRisk("USER_PASSWORD").riskLevel).toBe("warning");
    });

    it("should return warning for unknown variables", () => {
      expect(analyzeSecurityRisk("SOME_RANDOM_VAR").riskLevel).toBe("warning");
      expect(analyzeSecurityRisk("MY_CONFIG").riskLevel).toBe("warning");
    });
  });

  describe("safe level - public variables", () => {
    it("should detect NEXT_PUBLIC_ prefix", () => {
      expect(analyzeSecurityRisk("NEXT_PUBLIC_API_URL").riskLevel).toBe("safe");
      expect(analyzeSecurityRisk("NEXT_PUBLIC_SITE_NAME").riskLevel).toBe("safe");
    });

    it("should detect VITE_ prefix", () => {
      expect(analyzeSecurityRisk("VITE_API_URL").riskLevel).toBe("safe");
      expect(analyzeSecurityRisk("VITE_PUBLIC_KEY").riskLevel).toBe("safe");
    });

    it("should detect REACT_APP_ prefix", () => {
      expect(analyzeSecurityRisk("REACT_APP_API_URL").riskLevel).toBe("safe");
    });

    it("should detect NUXT_PUBLIC_ prefix", () => {
      expect(analyzeSecurityRisk("NUXT_PUBLIC_API_URL").riskLevel).toBe("safe");
    });

    it("should detect EXPO_PUBLIC_ prefix", () => {
      expect(analyzeSecurityRisk("EXPO_PUBLIC_API_URL").riskLevel).toBe("safe");
    });
  });
});

describe("convertToNetlify", () => {
  it("should return empty string for empty array", () => {
    expect(convertToNetlify([])).toBe("");
  });

  it("should convert a single variable", () => {
    const vars: EnvVariable[] = [
      {
        key: "KEY",
        value: "value",
        line: 1,
        isSecret: false,
        secretType: "unknown",
        riskLevel: "warning",
      },
    ];
    const result = convertToNetlify(vars);
    expect(result).toContain("[context.production.environment]");
    expect(result).toContain('KEY = "value"');
  });

  it("should convert multiple variables", () => {
    const vars: EnvVariable[] = [
      {
        key: "KEY1",
        value: "value1",
        line: 1,
        isSecret: false,
        secretType: "unknown",
        riskLevel: "warning",
      },
      {
        key: "KEY2",
        value: "value2",
        line: 2,
        isSecret: false,
        secretType: "unknown",
        riskLevel: "warning",
      },
    ];
    const result = convertToNetlify(vars);
    expect(result).toContain('KEY1 = "value1"');
    expect(result).toContain('KEY2 = "value2"');
  });

  it("should escape special characters in values", () => {
    const vars: EnvVariable[] = [
      {
        key: "KEY",
        value: 'value with "quotes"',
        line: 1,
        isSecret: false,
        secretType: "unknown",
        riskLevel: "warning",
      },
    ];
    const result = convertToNetlify(vars);
    expect(result).toContain('\\"quotes\\"');
  });
});

describe("convertToVercel", () => {
  it("should return empty object for empty array", () => {
    expect(convertToVercel([])).toBe("{}");
  });

  it("should convert variables to JSON format", () => {
    const vars: EnvVariable[] = [
      {
        key: "PUBLIC_KEY",
        value: "value",
        line: 1,
        isSecret: false,
        secretType: "public",
        riskLevel: "safe",
      },
    ];
    const result = convertToVercel(vars);
    const parsed = JSON.parse(result);
    expect(parsed.env.PUBLIC_KEY).toBe("value");
  });

  it("should use @ prefix for secrets", () => {
    const vars: EnvVariable[] = [
      {
        key: "DATABASE_URL",
        value: "postgres://...",
        line: 1,
        isSecret: true,
        secretType: "connection_string",
        riskLevel: "danger",
      },
    ];
    const result = convertToVercel(vars);
    expect(result).toContain("@database-url");
    expect(result).toContain("vercel secrets add database-url");
  });
});

describe("convertToCloudflare", () => {
  it("should return empty string for empty array", () => {
    expect(convertToCloudflare([])).toBe("");
  });

  it("should separate public vars and secrets", () => {
    const vars: EnvVariable[] = [
      {
        key: "NEXT_PUBLIC_URL",
        value: "https://example.com",
        line: 1,
        isSecret: false,
        secretType: "public",
        riskLevel: "safe",
      },
      {
        key: "DATABASE_URL",
        value: "postgres://...",
        line: 2,
        isSecret: true,
        secretType: "connection_string",
        riskLevel: "danger",
      },
    ];
    const result = convertToCloudflare(vars);
    expect(result).toContain("[vars]");
    expect(result).toContain('NEXT_PUBLIC_URL = "https://example.com"');
    expect(result).toContain("wrangler secret put DATABASE_URL");
  });

  it("should only show secrets section if there are secrets", () => {
    const vars: EnvVariable[] = [
      {
        key: "DATABASE_URL",
        value: "postgres://...",
        line: 1,
        isSecret: true,
        secretType: "connection_string",
        riskLevel: "danger",
      },
    ];
    const result = convertToCloudflare(vars);
    expect(result).not.toContain("[vars]");
    expect(result).toContain("wrangler secret put DATABASE_URL");
  });
});

describe("convertToPlatform", () => {
  const testVars: EnvVariable[] = [
    {
      key: "KEY",
      value: "value",
      line: 1,
      isSecret: false,
      secretType: "unknown",
      riskLevel: "warning",
    },
  ];

  it("should convert to Netlify format", () => {
    const result = convertToPlatform(testVars, "netlify");
    expect(result).toContain("[context.production.environment]");
  });

  it("should convert to Vercel format", () => {
    const result = convertToPlatform(testVars, "vercel");
    expect(result).toContain('"env"');
  });

  it("should convert to Cloudflare format", () => {
    const result = convertToPlatform(testVars, "cloudflare");
    expect(result).toContain("[vars]");
  });

  it("should throw for unknown platform", () => {
    expect(() => convertToPlatform(testVars, "unknown" as any)).toThrow();
  });
});

describe("getSecuritySummary", () => {
  it("should return correct counts", () => {
    const vars: EnvVariable[] = [
      { key: "NEXT_PUBLIC_URL", value: "", line: 1, isSecret: false, secretType: "public", riskLevel: "safe" },
      { key: "SOME_VAR", value: "", line: 2, isSecret: false, secretType: "unknown", riskLevel: "warning" },
      { key: "ANOTHER_VAR", value: "", line: 3, isSecret: false, secretType: "unknown", riskLevel: "warning" },
      { key: "API_KEY", value: "", line: 4, isSecret: true, secretType: "api_key", riskLevel: "danger" },
      { key: "DATABASE_URL", value: "", line: 5, isSecret: true, secretType: "connection_string", riskLevel: "danger" },
    ];

    const summary = getSecuritySummary(vars);
    expect(summary.total).toBe(5);
    expect(summary.safe).toBe(1);
    expect(summary.warning).toBe(2);
    expect(summary.danger).toBe(2);
  });

  it("should return zeros for empty array", () => {
    const summary = getSecuritySummary([]);
    expect(summary.total).toBe(0);
    expect(summary.safe).toBe(0);
    expect(summary.warning).toBe(0);
    expect(summary.danger).toBe(0);
  });
});

describe("integration: parseEnvFile with security analysis", () => {
  it("should correctly analyze a typical .env file", () => {
    const input = `# Database
DATABASE_URL=postgres://user:pass@localhost/db

# API Keys
STRIPE_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx

# Public
NEXT_PUBLIC_API_URL=https://api.example.com

# General
NODE_ENV=production`;

    const result = parseEnvFile(input);
    
    expect(result).toHaveLength(5);
    
    const dbUrl = result.find(v => v.key === "DATABASE_URL");
    expect(dbUrl?.riskLevel).toBe("danger");
    expect(dbUrl?.secretType).toBe("connection_string");
    
    const stripeKey = result.find(v => v.key === "STRIPE_SECRET_KEY");
    expect(stripeKey?.riskLevel).toBe("danger");
    
    const openaiKey = result.find(v => v.key === "OPENAI_API_KEY");
    expect(openaiKey?.riskLevel).toBe("danger");
    
    const publicUrl = result.find(v => v.key === "NEXT_PUBLIC_API_URL");
    expect(publicUrl?.riskLevel).toBe("safe");
    
    const nodeEnv = result.find(v => v.key === "NODE_ENV");
    expect(nodeEnv?.riskLevel).toBe("warning");
  });
});
