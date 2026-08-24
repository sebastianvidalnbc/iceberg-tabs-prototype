# Iceberg CMS — UX Prototypes

This repository contains **UX prototypes** exploring the evolution of the Iceberg
CMS authoring experience. It is a product-design artifact for review and
iteration — **not production CMS source code** (see
[Prototype vs. production](#prototype-vs-production)).

Two prototypes and a shared UI system live side by side in one repo:

| Layer | Path | What it is |
|---|---|---|
| **V1** | `src/v1/**` | Incremental Iceberg redesign — the primary concept for engineering/product review. A recursive tree-based content editor inside a familiar Iceberg shell. |
| **V2** | `src/v2/**` | Exploratory alternative architecture — an Explorer / Live Preview / Properties three-region workspace. |
| **Shared UI** | `src/ui/**` | Proposed reusable design system (tokens + primitives + patterns) consumed by both prototypes. |

## Architecture

```
        src/ui        ← shared design system (tokens, primitives, patterns)
          ↑
   ┌──────┴──────┐
 src/v1        src/v2  ← application/prototype layers
```

**Dependency rule:** the prototypes depend on `src/ui`; `src/ui` never imports
from `src/v1` or `src/v2`. See [`src/ui/README.md`](src/ui/README.md) for the
design-system architecture and extraction notes.

- **V1** — incremental Iceberg redesign (`src/v1`).
- **V2** — Explorer / Live Preview / Properties architecture (`src/v2`).
- **Shared UI** — reusable primitives and design tokens (`src/ui`).

## Stack

Deliberately dependency-light: **React 18** + **TypeScript 5** + **Vite 5**.
Styling is **hand-written CSS with CSS custom-property design tokens** — no
Tailwind, no CSS-in-JS, no third-party component kit. The design system in
`src/ui` is entirely home-grown.

## Build / dev

Install once:

```bash
npm install
```

Run a prototype locally (Vite dev server, hot reload):

```bash
npm run dev:v1   # V1 → http://localhost:5173/iceberg-tabs-prototype/
npm run dev:v2   # V2 → http://localhost:5173/iceberg-v2-prototype/
```

Both apps share a base path, so open the printed URL (dev:v2 auto-opens it). If
port 5173 is taken, Vite picks the next free port — use whatever it prints.

Production builds:

```bash
npm run build:v1   # → dist/       (tsc -b + vite build)
npm run build:v2   # → dist-v2/    (tsc -b + vite build, vite.v2.config.ts)
```

`npm run build` is an alias for `build:v1`. Preview a build with
`npm run preview:v1` / `npm run preview:v2`.

## Deployment

Two independent GitHub Pages targets, wired via GitHub Actions on push to `main`
and **path-filtered** so a change scoped to one prototype only redeploys that
prototype (a shared `src/ui/**` change triggers both):

| Target | URL | How it deploys |
|---|---|---|
| **V1** | https://sebastianvidalnbc.github.io/iceberg-tabs-prototype/ | This repo's built-in Pages environment (`dist/`). |
| **V2** | https://sebastianvidalnbc.github.io/iceberg-v2-prototype/ | Static output (`dist-v2/`) published to the separate `iceberg-v2-prototype` repo's `gh-pages` branch. |

Workflows: `.github/workflows/deploy-v1.yml` and `deploy-v2.yml`.

## Design system

`src/ui` holds the reusable primitives (Button, inputs, Select, Badge, Icon,
TreeRow, Menu, Tooltip, …) and design tokens (`tokens.css`) used across both
prototypes. Tokens (CSS custom properties) are the canonical source of design
decisions — components reference tokens, not raw values.

**Component catalog:** a lightweight, self-hosted catalog lives at the
`#/design-system` route. Run V1 and click **Design System** (top-right), or open
`http://localhost:5173/iceberg-tabs-prototype/#/design-system`. It documents each
primitive's variants, sizes, and states — the shared system, not V1/V2 screens.

## Prototype vs. production

This is a **product-design prototype**. It demonstrates interaction models,
information architecture, and a candidate design system for discussion and
usability review. It is **not** the production Iceberg CMS: there is no backend,
no persistence beyond the browser, no auth, and the data is illustrative sample
content. Do not treat any file here as production CMS source.
