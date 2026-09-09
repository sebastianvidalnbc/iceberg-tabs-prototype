# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Peacock / NBCU commerce content authors. They compose and manage customer-facing
commerce pages — plan pickers, offer cards, and their variants — inside the
Iceberg CMS, working through a Pages/Structure explorer, a live preview, and a
schema-driven properties panel. QA reviewers and admins act on the same surfaces
via the QA → Publish workflow.

## Product Purpose

Iceberg is the authoring tool for Peacock commerce pages. It lets authors
assemble pages from schema-defined layouts (plan pickers, offer cards, product
features), edit their content in structured property forms, preview the real
customer result live, and move work through a QA and publish workflow — without
hand-coding pages.

## Positioning

Schema-driven authoring paired with a live, isolated customer-facing preview: the
editor renders the actual Peacock page in a separate iframe document synchronized
over postMessage, and lets authors preview MVT/A-B variations and per-audience
results in place. The authoring chrome and the customer render are deliberately
different design systems, so the preview reads as a faithful customer artifact
rather than an editor mock.

## Operating Context

- Three-region editor: left **Explorer** (resizable Pages tree + Structure
  tree), center **Live Preview** (isolated Peacock renderer with device /
  audience / MVT controls, click-to-select, highlight, and a live accessibility
  score), right **Properties** (schema-driven forms).
- Top action bar mirrors the real Iceberg editor: Publish, Send To QA, Save
  (validation-gated), QA Review, QA Notes, CSS, JSON-LD, Settings.
- Hash-routed views: Pages / Widgets lists, Variants lists, and the editor, with
  a persistent left nav rail across all levels (Pages, Widgets, Content Pages,
  Event Pages, Central Mgmt, QA Queue, Optimizely, Scheduled Pages, Redirects,
  Services CMS, Help).
- **V4-eos** is the active workstream: the V2 prototype migrated to the Eos
  design system, progressively gaining real-Iceberg authoring behavior. Earlier
  prototypes (V1, V2) remain in the repo and are currently untouched.

## Capabilities and Constraints

- Schema-driven structure and property editing derived from the real Iceberg
  schema (layouts, modules, validations).
- Live preview sync (CMS ↔ renderer over postMessage), Pick Section /
  click-to-select round-trip, device presets, audience overlay, MVT override.
- Validation gating on Save (required fields must be complete).
- Structure editing: drag-reorder among siblings; add / duplicate / copy /
  paste / disable / delete; add-layout page building from the schema catalog.
- Deployment: V4-eos builds to a standalone GitHub Pages site (separate repo)
  from the built output via `npm run deploy:v4`.

## Brand Commitments

- **Two design systems stay strictly separate and must not bleed into each
  other** (binding constraint): **Eos** owns the authoring UI (the editor
  chrome); the **Peacock Commerce UI Kit** owns the customer-facing preview.
- Product name: Iceberg.

## Evidence on Hand

- Real Iceberg schema and layout definitions extracted from the source app
  (`iceberg-commerce-main`), driving structure + properties.
- Figma sources of visual truth: the **Eos Library** (authoring UI) and the
  **Peacock Commerce UI Kit** / IA Plan Picker (customer preview).
- Sample data: Pages (`/plans`, `/plans/all-monthly`, variants), plan-picker
  products (Select / Premium / Premium Plus), product features, and offers.
- Absence future work must not fabricate: **Peacock Sans TF** (the brand font)
  is proprietary and not available to this prototype; the preview uses a
  documented substitute recorded in the renderer, not the real face.

## Product Principles

- Preserve product truth — routes, IA, data model, and authoring behavior — as
  the tool evolves; apply Eos as the visual layer for the chrome rather than
  reinterpreting the product.
- Keep the customer preview a faithful Peacock artifact, isolated from the
  editor's design system.
- Author by schema, not by hand: what is editable, and how, is governed by the
  real Iceberg schema.
- Make the live result and its correctness (validation, accessibility) visible
  while authoring.
