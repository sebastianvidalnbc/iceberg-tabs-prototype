# Peacock Preview — Fidelity QA & Lineage (Phase 13)

Element-by-element provenance for the customer-facing preview render inside
Iceberg V4 (`src/v4-eos/renderer/`). This covers **only** the preview iframe
(the Peacock customer output). It does **not** cover the Eos-styled authoring UI
(OpsHub bar, Explorer, Properties), which is intentionally a separate system.

## Methodology

Each treatment was traced to one of the sources below and tagged inline in
`brand.css` / `CommerceWebButton.tsx`. This document rolls those tags up.

- **[VERIFIED]** — read directly from a Figma node in the Commerce UI Kit
  (`EpM4nZGcDrbLmGhl2et7TUqW`) or the IA Plan Picker (`roOR88JWhOcpVLuXQGzfgG`)
  via Figma MCP (`get_design_context` / `get_metadata` / `get_variable_defs`).
- **[OBSERVED]** — read from a rendered Commerce screenshot, not a bound token.
- **[FROM SCREENSHOT]** — derived by pixel-sampling a Figma screenshot
  (Homepage Working File `ryf8WPilNqEJEfA9h2Gcmx`) where no live node was available.
- **[APPROX]** — geometry interpolated from a related verified variant.
- **[PROTOTYPE-LOCAL]** — a deliberate prototype decision; no verified source
  exists in the kit (documented, not guessed to be real).
- **[UNVERIFIED]** — placeholder value not yet confirmed against any node.

## Tag tally (current)

| Status | brand.css | CommerceWebButton | Notes |
|---|---:|---:|---|
| VERIFIED | 91 | 4 | primary render path |
| APPROX | 11 | 1 | button heights, hover/active filters, icon size, gaps |
| PROTOTYPE-LOCAL | 9 | — | composition rhythm, mobile threshold, cat toggle |
| FROM SCREENSHOT | 3 | — | Plans/Bundles category toggle |
| OBSERVED | 2 | — | nav/page pure-black |
| UNVERIFIED | 9 | — | generic-section chrome tokens (see below) |

## Element lineage

### Fonts (Phase 1/5)
| Element | Treatment | Status | Source |
|---|---|---|---|
| Brand typeface | Plus Jakarta Sans (substitute for **Peacock Sans TF**, proprietary — deliberately not bundled) | PROTOTYPE-LOCAL (substitute); geometry VERIFIED | renderer.html + Toolkit Typography Specimen `63956:33500` |
| Type scale (`--pk-type-*`) | 13 semantic roles: display 104/112 … legal 12/16, eyebrow 15/15 uppercase, label 10/16 | VERIFIED | Desktop Styles `63956:33547` |

### Commerce Nav (Phase 3/10)
| Element | Treatment | Status | Source |
|---|---|---|---|
| Header bg | pure black `#000` | OBSERVED / VERIFIED (background/primary) | Nav `45799:660` |
| Desktop | h88, px56 | VERIFIED | `45799:660` |
| Tablet | h72, px32, gap16 | VERIFIED | `47001:3466` |
| Mobile | h72, px16, gap8 | VERIFIED (values); threshold ≤480 PROTOTYPE-LOCAL | `47009:3458` |
| Logo | real Peacock wordmark SVG, 100px | VERIFIED asset | `.Web/Logo` → Wordmark `47100:3994` |
| Sign In / Get Started | compact WebButton at every breakpoint (no hamburger) | VERIFIED | nav variants |

### Web Button (Phase 2/3) — `CommerceWebButton.tsx`
| Element | Treatment | Status | Source |
|---|---|---|---|
| Primary | brand gradient 180°, `#000` label, pill | VERIFIED | WebButtonPrimary |
| Secondary | action-secondary `#323538`@64% + blur(50) | VERIFIED | WebButtonSecondary |
| Tertiary | transparent, white@80% label | VERIFIED | text button |
| Compact size | 32h, py8 px16, 10/16 uppercase | VERIFIED | nav `45799:660` |
| Tablet-mobile / Desktop size | 40h / 48h heights, 12/14px labels | APPROX | interpolated |
| Hover/active/disabled | brightness filters, opacity .4 | APPROX | — |

### Icons (Phase 4)
| Element | Treatment | Status | Source |
|---|---|---|---|
| Feature checkmark | real Commerce Checkmark SVG, 20px, dark on light card | VERIFIED asset (`44540:975`); 20px scale APPROX | commerce-check.svg |

### Plan Card (Phase 7 revised) — IA "Plan Picker Card Now" `11051:8463`
| Element | Treatment | Status |
|---|---|---|
| Surface | white `#ffffff` (background/secondary), radius 36, pad 40 | VERIFIED |
| Card gap | 24px between description & pricing blocks | VERIFIED |
| Badge | top-left gold pill (status/recommended), x40 y-16 | VERIFIED |
| Eyebrow | 15/15 uppercase +1px, secondary `#494b4e` | VERIFIED |
| Title | title-xl 32/40 bold, black | VERIFIED |
| Description | body 16/20 | VERIFIED |
| Features | body 16/20, items-center, 20px check | VERIFIED |
| Featured emphasis | shadow only (same white card) | VERIFIED |

### Pricing block (Phase 9) — Plan Card pricing fields
| Element | Field | Status |
|---|---|---|
| Savings eyebrow | "Offer Detail" — 15/15 uppercase +1px | VERIFIED |
| Strikethrough | "Strike Through Price" — body-sm line-through | VERIFIED |
| Offer price | "Offer Price" — title-s 24/32 | VERIFIED |
| Cadence subtext | "Price Cadence and Subtext" | VERIFIED |
| Offer details | "Offer Detail Description" (stripHtml) | VERIFIED |
| CTA | full-width WebButtonPrimary | VERIFIED |
| **Note** | all rows are **data-gated** (render only when authored). Live-verified with the `0609 premium card test 2` variant's Price Cadence node (`SAVE 30%`, ~~$15.99~~ $10.99 /month). | — |

### Plans / Bundles selector (Phase 8)
| Element | Treatment | Status |
|---|---|---|
| Category toggle | dark capsule `rgba(255,255,255,.1)`, white active pill, black label, hover | FROM SCREENSHOT (Homepage `4699:34053`) — **PEACOCK-SPECIFIC COMPOSITION** (no live component) |

### Page composition (Phase 11)
| Element | Treatment | Status |
|---|---|---|
| Horizontal gutter (`--pk-gutter`) | 56 / 32 / 16 shared by nav + all sections | VERIFIED (from nav) |
| Content cap (`--pk-content-max`) | 1440 | VERIFIED (design frame) |
| Vertical rhythm (`--pk-section-y`) | 56 / 44 / 32 | PROTOTYPE-LOCAL |
| Hero / banner / footer vertical pad | 96 / 32 / 48 | PROTOTYPE-LOCAL |
| Plan-cards layout | intrinsic grid `auto-fit minmax(300,384)` | PROTOTYPE-LOCAL (no verified plan-picker responsive spec) |

### Editor overlay (Phase 12) — NOT brand
| Element | Treatment | Status |
|---|---|---|
| Selection / hover / pick outlines | `--preview-editor-*` tokens only, `outline`-based (no layout shift) | Iceberg authoring (intentional, isolated from `--pk-*`) |

## Known non-verified items (confined to generic/schematic sections)

These `--pk-*` tokens are **UNVERIFIED** and are used only in generic/on-brand
schematic sections (rail/grid tiles, FAQ, comparison table, dark footer text) —
**never** in the fully-verified Plan Picker path:

| Token | Used in render? | Disposition |
|---|---|---|
| `--pk-card` | yes (1) | dark generic-section surface — UNVERIFIED, no card node in kit |
| `--pk-card-border` | yes (1) | as above |
| `--pk-muted` | yes (5) | secondary text on dark sections/footer |
| `--pk-muted-2` | yes (1) | comparison-cell muted |
| `--pk-ink-2` | no | dormant → **remove in Phase 14** |
| `--pk-blue` | no | dormant → **remove in Phase 14** |
| `--pk-error` | no | dormant → **remove in Phase 14** |
| `--pk-radius-card` | no | dormant → **remove in Phase 14** |

## Blockers / open source gaps

- **No verified Product/Plan Card node in the Commerce UI Kit itself** — the Plan
  Card was verified against the **IA Plan Picker** file instead (canonical live,
  tokenized). Acceptable, documented.
- **No verified Plans/Bundles category switcher component** — treated as a
  Peacock-specific composition derived from a homepage screenshot.
- **No verified page-grid / spacing spec** — vertical rhythm and the plan-cards
  responsive layout are prototype-local (horizontal gutters are verified from nav).
- **Badge data gap** — the badge treatment is verified, but `previewModel` does
  not currently emit `card.badge` from schema defaults. This is a frozen-derivation
  data gap (out of scope for the preview styling work), not a styling defect.

## Verdict

The **primary customer render path** — nav, logo, buttons, checkmark, typography,
plan card, and pricing block — is **source-verified** against Figma. Remaining
non-verified values are (a) dormant tokens slated for removal, or (b) confined to
generic schematic sections that have no verified source component. Editor
affordances are fully isolated from the brand namespace.
