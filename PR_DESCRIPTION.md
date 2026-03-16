## Summary

- Add new AI Eval Playground utility for comparing AI model outputs and prompts
- Implement BYOK (Bring Your Own Key) support for OpenAI, Anthropic, and Google AI
- Build LLM-as-judge scoring system with configurable criteria weights
- Create clean, table-based comparison UI following Linear.app design patterns

## Features

### Comparison Modes
- **Model vs Model**: Compare 2-4 models with the same prompt
- **Prompt vs Prompt**: Compare 2-4 prompt variations with the same model

### Supported Providers
| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo |
| Anthropic | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| Google AI | Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash |

### LLM-as-Judge Scoring
- 5 evaluation criteria: Accuracy, Relevance, Clarity, Completeness, Conciseness
- Adjustable weight sliders for custom scoring emphasis
- Pairwise comparison with winner detection
- Visual score badges and breakdown bars

### Security
- API keys stored in sessionStorage only (cleared on browser close)
- All processing happens client-side
- Keys never leave the browser

## Files Added

```
components/
├── ai-eval/
│   ├── ApiKeyDialog.tsx
│   ├── EvalComparisonGrid.tsx
│   ├── EvalConfigPanel.tsx
│   ├── EvalJudgePanel.tsx
│   ├── EvalModelSelector.tsx
│   ├── EvalResultCell.tsx
│   └── EvalScoreDisplay.tsx
├── hooks/
│   └── useApiKeys.ts
└── utils/
    ├── ai-eval-judge.ts
    ├── ai-eval-providers.ts
    ├── ai-eval-schemas.ts
    └── ai-eval-schemas.test.ts

pages/utilities/
└── ai-eval.tsx
```

## Screenshots

<!-- Add screenshots here -->

## Test Plan

- [x] Unit tests for schema validation and utility functions (37 tests passing)
- [x] Build passes with no TypeScript errors
- [ ] Manual testing with real API keys for each provider
- [ ] Verify API key dialog saves/clears correctly
- [ ] Test both comparison modes with multiple models
- [ ] Verify judge scoring produces valid results
