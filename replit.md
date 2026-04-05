# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `node scripts-data/fetch-models.js` — update AI model data JSON files

## Artifacts

### AI Model Directory (`artifacts/ai-model-directory`)
- **Preview path**: `/`
- **Type**: React + Vite (static, no backend required)
- **Purpose**: Searchable directory of 45+ AI models from 13 providers
- **Pages**: Directory (`/`), Model Detail (`/model/:id`), Compare (`/compare`), Glossary (`/glossary`)
- **Data**: Static JSON in `public/data/` — models.json, providers.json, glossary.json
- **Key features**:
  - Search, filter, sort with grid/table view
  - Side-by-side model comparison (up to 4 models)
  - Hover tooltips for all technical terms
  - Fully static, deployable to GitHub Pages

### API Server (`artifacts/api-server`)
- **Preview path**: `/api`
- **Type**: Express 5 server

## Data Pipeline

- Script: `scripts-data/fetch-models.js` (Node.js, no dependencies)
- Output: `artifacts/ai-model-directory/public/data/*.json`
- GitHub Actions: `.github/workflows/update-models.yml` runs daily at 19:30 UTC (1 AM IST)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
