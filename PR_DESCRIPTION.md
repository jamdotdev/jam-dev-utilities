# feat: Add Config Doctor - .env to Deployment Config Converter with AI Security Analysis

## Summary

This PR introduces **Config Doctor**, a new utility that converts `.env` files to platform-specific deployment configurations (Netlify, Vercel, Cloudflare Pages) with built-in security analysis and AI-powered explanations.

**Key highlights:**
- Multi-platform config generation from a single `.env` file
- Automatic detection of 20+ secret patterns (API keys, tokens, credentials)
- Client-side AI explanations using WebLLM (privacy-first, no data leaves the browser)
- Visual security risk indicators (safe/warning/danger)

## Demo

Paste your `.env` file → Select platform → Get converted config + security warnings

```
# Input (.env)
DATABASE_URL=postgres://user:pass@host/db
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_API_URL=https://api.example.com

# Output (netlify.toml)
[context.production.environment]
  DATABASE_URL = "postgres://user:pass@host/db"
  STRIPE_SECRET_KEY = "sk_live_xxx"
  NEXT_PUBLIC_API_URL = "https://api.example.com"

# Security Analysis
🔴 DATABASE_URL - Secret (connection string)
🔴 STRIPE_SECRET_KEY - Secret (API key)  
🟢 NEXT_PUBLIC_API_URL - Safe (public variable)
```

## Architecture

```mermaid
flowchart TB
    subgraph ui [User Interface]
        Input[".env Input"]
        Platform["Platform Selector"]
        Output["Config Output"]
        Warnings["Security Panel"]
    end
    
    subgraph utils [Core Logic]
        Parser["parseEnvFile()"]
        Analyzer["analyzeSecurityRisks()"]
        Converters["Platform Converters"]
    end
    
    subgraph ai [AI Layer - Optional]
        WebLLM["WebLLM Engine"]
        Prompts["Security Prompts"]
    end
    
    Input --> Parser
    Parser --> Analyzer
    Parser --> Converters
    Platform --> Converters
    Analyzer --> Warnings
    Warnings -.->|"User clicks 'Explain'"| WebLLM
    WebLLM -.-> Warnings
    Converters --> Output
```

## Features

### 1. Multi-Platform Support

| Platform | Output Format | Secrets Handling |
|----------|--------------|------------------|
| **Netlify** | `netlify.toml` | All vars in `[context.production.environment]` |
| **Vercel** | `vercel.json` | Secrets use `@secret-name` reference syntax |
| **Cloudflare** | `wrangler.toml` | Public vars in `[vars]`, secrets via CLI instructions |

### 2. Security Pattern Detection

Recognizes and flags:
- **API Keys**: `*_API_KEY`, `*_SECRET`, `OPENAI_*`, `STRIPE_*`
- **Cloud Credentials**: `AWS_*`, `AZURE_*`, `GCP_*`, `GOOGLE_*`
- **Database URLs**: `DATABASE_URL`, `MONGODB_*`, `REDIS_*`, `POSTGRES_*`
- **Auth Tokens**: `JWT_SECRET`, `*_TOKEN`, `SESSION_SECRET`
- **Public Variables**: `NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*` (marked safe)

### 3. AI-Powered Security Explanations

- Uses **WebLLM** with Phi-3.5-mini model
- Runs entirely in the browser (no server, no data leakage)
- Lazy-loaded only when user requests explanation
- Cached in IndexedDB for subsequent uses
- Graceful fallback for browsers without WebGPU

## Files Changed

### New Files

| File | Purpose |
|------|---------|
| `pages/utilities/config-doctor.tsx` | Main page component |
| `components/utils/config-doctor.utils.ts` | Core parsing, analysis, and conversion logic |
| `components/utils/config-doctor.utils.test.ts` | 50+ unit tests |
| `components/config-doctor/PlatformSelector.tsx` | Platform toggle buttons |
| `components/config-doctor/SecurityWarnings.tsx` | Security analysis display |
| `components/config-doctor/AIExplainer.tsx` | WebLLM integration |
| `components/seo/ConfigDoctorSEO.tsx` | SEO/documentation content |

### Modified Files

| File | Change |
|------|--------|
| `components/utils/tools-list.ts` | Added Config Doctor entry |
| `README.md` | Added to utilities list |
| `package.json` | Added `@mlc-ai/web-llm` dependency |

## Technical Decisions

### Why WebLLM?

1. **Privacy**: Aligns with Jam's "data stays on-device" philosophy
2. **No API costs**: No backend or API keys needed
3. **Offline capable**: Works after initial model download
4. **Modern**: Showcases cutting-edge browser AI capabilities

### Why these platforms?

Netlify, Vercel, and Cloudflare Pages are the most popular deployment targets for modern web apps, and each has different config formats that developers frequently need to convert.

## Testing

### Unit Tests

```bash
npm test -- --testPathPattern="config-doctor"
```

Covers:
- `.env` parsing (comments, quotes, multiline, edge cases)
- Security pattern detection for all risk levels
- Platform-specific output formatting
- Summary statistics calculation

### Manual Testing Checklist

- [ ] Paste various `.env` files and verify parsing
- [ ] Switch between platforms and verify output format
- [ ] Verify security warnings appear correctly
- [ ] Test AI explainer (requires WebGPU-enabled browser)
- [ ] Test on browser without WebGPU (should show fallback message)
- [ ] Verify copy-to-clipboard works
- [ ] Test responsive layout

## Screenshots

*[Add screenshots after running locally]*

## Related

- Extends the existing [env-to-netlify-toml](https://jam.dev/utilities/env-to-netlify-toml) utility
- Uses same component patterns as other utilities in the repo

## Checklist

- [x] Code follows project coding standards
- [x] ESLint passes (`npm run lint`)
- [x] Prettier formatting applied (`npm run format`)
- [x] Unit tests written and passing
- [x] Documentation/SEO content added
- [x] README updated
- [x] tools-list.ts updated
- [x] No secrets or sensitive data committed

---

**Note**: This is my first contribution to jam-dev-utilities. I'm excited about what Jam is building for developer debugging workflows and wanted to contribute a tool that combines practical utility with AI capabilities. Happy to iterate based on feedback!
