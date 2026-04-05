# AI Model Hub

A modern, open-source directory for discovering, comparing, and evaluating leading AI models across major providers.

## Why this project exists

Choosing the right model is hard. Specs are scattered, pricing changes often, and capabilities differ by provider. **AI Model Hub** brings this information together in one place so builders can make faster, better decisions.

## What you can do

- Search models by name, provider, and use case
- Filter by capabilities, context window, and price
- Compare multiple models side-by-side
- Explore glossary definitions for key AI terms
- Browse a responsive UI built for quick research

## Tech stack

- **Frontend:** React + Vite + TypeScript
- **Backend artifact:** Express + TypeScript (optional API components)
- **Data source:** Static JSON data generated via scripts
- **Monorepo:** pnpm workspaces

## Project structure

```txt
artifacts/ai-model-directory/    # Main web app
artifacts/api-server/            # API server artifact
scripts-data/                    # Data update scripts
lib/                             # Shared packages (DB, API spec/clients)
```

## Quick start

### Prerequisites

- Node.js 24+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Run the app locally

```bash
pnpm --filter @workspace/ai-model-directory run dev
```

### Build

```bash
pnpm run build
```

### Typecheck

```bash
pnpm run typecheck
```

## Data updates

Refresh provider/model/glossary data:

```bash
node scripts-data/fetch-models.js
```

## Contributing

We welcome contributions of all sizes — from typo fixes to major features.

### Ways to contribute

- Add or update model entries
- Improve filtering/sorting UX
- Fix bugs and improve performance
- Improve docs and glossary clarity
- Add tests and strengthen reliability

### Contribution workflow

1. Fork the repo
2. Create a feature branch (`feat/your-change`)
3. Make focused commits with clear messages
4. Run build + typecheck before opening PR
5. Open a pull request with:
   - what changed
   - why it matters
   - screenshots (if UI changes)

## Donations & sponsorship

If this project saves you time or helps your team, consider supporting development.

- **GitHub Sponsors:** add your profile/org sponsor link
- **Buy Me a Coffee / Ko-fi:** add your donation link
- **Company sponsorships:** open an issue to discuss partnership support

> Maintainers: replace the placeholder links above with your real funding URLs.

## Community & support

- Open an issue for bugs or feature requests
- Start a discussion for roadmap ideas
- Tag PRs with clear context so reviewers can help quickly

## License

Choose and add your preferred license (MIT/Apache-2.0 recommended for open collaboration).

---

If you find this repository useful, please ⭐ the project and share it with other builders.
