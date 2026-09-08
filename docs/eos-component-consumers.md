# Iceberg V4 — Generic Primitive Consumer / Call-Site Inventory

> Companion to [`eos-adoption.md`](./eos-adoption.md). Maps every **generic
> primitive** to (a) its implementation file(s) and (b) every V4 consumer, so the
> blast radius of a future Eos swap is known **before** we touch anything.
>
> **Nothing here is changed in this pass** — inventory only.
> Checkpoint: `v4-pre-eos-adoption` (`becfa790be443834081a4311078fc99dba992e31`).

**Two systems:** `A = src/v4-eos/ui/**` (shadcn/Radix), `B = src/v4-eos/ui-lib/**`
(bespoke). Many editor form primitives are consumed **indirectly** through the
`ui/form-controls.tsx` aggregator — those consumers are marked *(via form-controls)*.

---

## Button
**Implementations:** `A ui/button.tsx` · `B ui-lib/Button.tsx`
**Consumers:**
- `WorkspaceShell.tsx` — **A**
- `regions/Properties.tsx` — **A**
- `regions/LayoutPicker.tsx` — **A**
- `regions/catalog/sections.tsx` — **A**
- `regions/LivePreview.tsx` — **B**
- `views/PagesView.tsx` — **B**
- `views/VariantsView.tsx` — **B**
- `views/WidgetsView.tsx` — **B**

## IconButton
**Implementations:** `B ui-lib/Button.tsx` (A has no dedicated IconButton — uses `button size="icon"`)
**Consumers:**
- `views/PagesView.tsx` — **B**
- `views/VariantsView.tsx` — **B**
- `views/WidgetsView.tsx` — **B**

## Input
**Implementations:** `A ui/input.tsx` · `B ui-lib/TextInput.tsx`
**Consumers:**
- `ui/panel.tsx` (`SearchInput` builds on it) — **A**
- `ui/form-controls.tsx` (`TextField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*
- *(Direct `ui-lib/TextInput` `TextInput` export: no V4 consumer — only `SearchInput` is used; see Search.)*

## Search
**Implementations:** `A ui/panel.tsx → SearchInput` · `B ui-lib/TextInput.tsx → SearchInput`
**Consumers:**
- `regions/Explorer.tsx` — **A** (collection + offers search)
- `regions/LayoutPicker.tsx` — **A**
- `views/PagesView.tsx` — **B**
- `views/VariantsView.tsx` — **B**
- `views/WidgetsView.tsx` — **B**

## Textarea
**Implementations:** `A ui/textarea.tsx` · `B ui-lib/Textarea.tsx` *(B dead in V4)*
**Consumers:**
- `ui/form-controls.tsx` (`TextAreaField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*

## Select
**Implementations:** `A ui/select.tsx` (Radix, portal) · `B ui-lib/Select.tsx` (native `<select>`)
**Consumers:**
- `ui/form-controls.tsx` (`SelectField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*
- `regions/LivePreview.tsx` — **B** (device / audience / MVT selectors)

## Checkbox
**Implementations:** `A ui/checkbox.tsx` · `B ui-lib/Checkbox.tsx` *(B dead in V4)*
**Consumers:**
- `ui/form-controls.tsx` (`CheckboxField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*

## Switch
**Implementations:** `A ui/switch.tsx` · `B ui-lib/Switch.tsx` *(B dead in V4)*
**Consumers:**
- `ui/form-controls.tsx` (`SwitchField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*

## Radio
**Implementations:** `A ui/radio-group.tsx` · `B ui-lib/Radio.tsx` *(B dead in V4)*
**Consumers:**
- `ui/form-controls.tsx` (`RadioField`) — **A**
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*

## Badge
**Implementations:** `A ui/badge.tsx` · `B ui-lib/Badge.tsx` (also exports `StatusDot`)
**Consumers:**
- `regions/Properties.tsx` — **A**
- `regions/catalog/sections.tsx` — **A**
- `regions/LivePreview.tsx` — **B** (LIVE / LOADING / DISABLED + audience)
- `views/PagesView.tsx` — **B** (`Badge` + `StatusDot`)
- `views/VariantsView.tsx` — **B** (`Badge` + `StatusDot`)
- `views/WidgetsView.tsx` — **B** (`Badge`)

## Menu
**Implementations:** `A ui/dropdown-menu.tsx`, `A ui/context-menu.tsx` *(context-menu dead)* · `B ui-lib/Menu.tsx` *(B dead in V4)*
**Consumers:**
- `ui/row-actions.tsx` (`RowActionsMenu`, built on `ui/dropdown-menu`) — **A**
  - → `regions/Explorer.tsx` *(structure row overflow: rename/duplicate/copy/paste/disable/delete)*

## Tooltip
**Implementations:** `A ui/tooltip.tsx` · `B ui-lib/Tooltip.tsx`
**Consumers:** **None at runtime.** The app rail's tooltip is pure CSS
(`.ui-ws-nav__label` in `styles/eos.css`). Both Tooltip primitives are dead in V4.

## Dialog
**Implementations:** `A ui/dialog.tsx` (Radix) · `B ui-lib/ConfirmationDialog.tsx` *(B dead in V4)*
**Consumers:**
- `regions/LayoutPicker.tsx` — **A**

## Tabs
**Implementations:** `B ui-lib/Tabs.tsx`, `B ui-lib/SegmentedControl.tsx` *(both dead in V4)*
**Consumers:** **None.** The preview Plans/Bundles toggle is bespoke markup in
`renderer/BrandRender.tsx` (`.ui-brand__cat-toggle`), not the Tabs primitive.

## Field / Label
**Implementations:** `A ui/label.tsx` · `B ui-lib/Field.tsx` *(B dead in V4)*
**Consumers:**
- `ui/form-controls.tsx` — **A** (`label` wiring for each field)
  - → `regions/Properties.tsx` *(via form-controls)*
  - → `regions/catalog/sections.tsx` *(via form-controls)*

## Separator
**Implementations:** `A ui/separator.tsx` (no B)
**Consumers:**
- `regions/Properties.tsx` — **A**
- `regions/catalog/sections.tsx` — **A**

---

## Supporting shadcn helpers (Iceberg compositions, for context)
Not "generic primitives," but they wrap the primitives above and will move with them:

- `ui/panel.tsx` (`Panel`, `PanelHeader`, `SearchInput`) → `Explorer`, `LayoutPicker`
- `ui/property.tsx` (`ObjectHeader`, `PropertyRow`, `PropertyRows`, `PropertySection`) → `Properties`
- `ui/tree-row.tsx` (`TreeRow`) → `Explorer` (collection + structure)
- `ui/row-actions.tsx` (`RowActionsMenu`) → `Explorer`
- `ui/scroll-area.tsx` (Radix) → `Explorer`, `Properties`, `LayoutPicker`, `DesignSystem`
- `ui/form-controls.tsx` → `Properties`, `catalog/sections`
- `ui/msym.tsx` (`MSym`, Material Symbols) → `Explorer`, `Properties`, `TopBar`, `DesignSystem`

## Icon (Material Symbols)
**Implementations:** `A ui/msym.tsx` (`MSym`) · `B ui-lib/Icon.tsx` (`Icon`)
**Consumers:** `MSym` — `Explorer`, `Properties`, `TopBar`, `DesignSystem`.
`Icon` — `WorkspaceShell`, `AppNav`, `Properties`, `LayoutPicker`, `layouts.ts`.
