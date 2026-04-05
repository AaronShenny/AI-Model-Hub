# AI Model Directory

A production-ready, searchable directory of AI models from the world's top providers — including OpenAI, Anthropic, Google, Mistral, Meta, DeepSeek, Cohere, xAI, Perplexity, Alibaba, Together AI, and Microsoft.

## Features

- **40+ models** from 13 major providers, with full specs
- **Search** by model name, provider, specialty, or use case
- **Filter** by provider, capability, context window, and price
- **Sort** by cheapest, largest context, newest, provider, or name
- **Grid & table views** for browsing models
- **Model detail pages** with full specs, pricing, rate limits, and capabilities
- **Side-by-side comparison** for up to 4 models
- **Glossary** page with definitions for all technical terms
- **Hover tooltips** on technical terms (context window, RPM, TPM, RPD, tokens, pricing)
- **Responsive design** for mobile and desktop

---

## Technical Terms Explained

### Context Window
The maximum number of **tokens** a model can process in one request, including both your input and the model's output. Larger context windows let you process longer documents or conversations.

### Rate Limit
The maximum API usage allowed in a given time period. Exceeding it causes temporary request rejections. Measured as:
- **RPM** — Requests Per Minute
- **TPM** — Tokens Per Minute  
- **RPD** — Requests Per Day

### Token
The basic unit AI models process. ~4 characters or 0.75 words in English. One page of text ≈ 500 tokens.

### Pricing per 1M Tokens
The cost to process one million tokens. Input (your prompt) and output (model response) are priced separately. Output is typically more expensive.

---

## Data Pipeline

Model data is stored as static JSON files in `artifacts/ai-model-directory/public/data/`:

| File | Contents |
|------|----------|
| `models.json` | All AI models with full specs, pricing, capabilities |
| `providers.json` | Provider metadata (name, website, description) |
| `glossary.json` | Technical term definitions |

### Updating Data

Run the update script manually:

```bash
node scripts-data/fetch-models.js
```

This updates all three JSON files. Safe to run at any time — if one file fails, others continue. Missing values stay as `null`.

---

## GitHub Actions Automation

The workflow at `.github/workflows/update-models.yml` runs daily at **1:00 AM IST (19:30 UTC)**.

It:
1. Checks out the repository
2. Runs `node scripts-data/fetch-models.js`
3. Commits updated JSON files
4. Pushes back to the repo

To trigger manually: **Actions → Update AI Model Data → Run workflow**

---

## Project Structure

```
artifacts/ai-model-directory/
├── public/
│   └── data/
│       ├── models.json         # Model data
│       ├── providers.json      # Provider metadata
│       └── glossary.json       # Term definitions
├── src/
│   ├── components/
│   │   ├── CapabilityBadge.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── GlossaryTooltip.tsx
│   │   ├── ModelCard.tsx
│   │   └── Navbar.tsx
│   ├── hooks/
│   │   └── useData.ts          # Data fetching hooks
│   ├── pages/
│   │   ├── Directory.tsx       # Main listing page
│   │   ├── ModelDetail.tsx     # Single model detail
│   │   ├── Compare.tsx         # Side-by-side comparison
│   │   └── Glossary.tsx        # Term definitions
│   ├── utils/
│   │   └── format.ts           # Number/date formatting
│   ├── types.ts                # TypeScript types
│   ├── App.tsx                 # Router setup
│   └── index.css               # Theme variables
scripts-data/
└── fetch-models.js             # Data update script
.github/workflows/
└── update-models.yml           # GitHub Actions workflow
```

---

## Deployment (GitHub Pages)

The app is a static React + Vite app. To deploy to GitHub Pages:

1. Set `base` in `vite.config.ts` to your repo path (e.g., `/ai-model-directory/`)
2. Run `pnpm --filter @workspace/ai-model-directory run build`
3. Deploy the `dist/public` folder to GitHub Pages
4. Set `BASE_PATH` env var to match your GitHub Pages URL path

The app has no backend dependency at runtime — all data is served from the static JSON files.

---

## Adding New Models

Edit `scripts-data/fetch-models.js` and add an entry to the `base` array inside `buildModels()`. The script preserves existing entries not in the base list, so you can safely add models without losing any existing data.

Each model entry follows this schema:

```json
{
  "id": "unique-slug",
  "provider": "Provider Name",
  "model_name": "Display Name",
  "model_id": "api-model-id",
  "specialty": "What it's good at",
  "context_window": 128000,
  "pricing": {
    "input_price_per_1m_tokens": 1.00,
    "output_price_per_1m_tokens": 3.00
  },
  "rate_limits": { "rpm": 1000, "tpm": 100000, "rpd": null },
  "capabilities": {
    "text": true, "vision": false, "audio": false,
    "code": true, "function_calling": true, "reasoning": false
  },
  "best_for": "Short description of ideal use cases",
  "source_url": "https://docs.example.com/models",
  "last_updated": "2025-01-01",
  "notes": "Any extra context"
}
```

Use `null` for any value you don't know. Never invent values.
