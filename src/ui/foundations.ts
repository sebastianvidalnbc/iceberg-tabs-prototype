// Single source of truth for the docs Foundations section. Values mirror
// tokens.css so the swatches/scales render the real token values.

export const colorGroups = [
  {
    name: "Background",
    tokens: [
      { var: "--color-bg-canvas", value: "#f6f7f9" },
      { var: "--color-bg-surface", value: "#ffffff" },
      { var: "--color-bg-subtle", value: "#fbfbfc" },
      { var: "--color-bg-selected", value: "#eef4ff" },
    ],
  },
  {
    name: "Text",
    tokens: [
      { var: "--color-text-primary", value: "#1a1d23" },
      { var: "--color-text-secondary", value: "#667085" },
      { var: "--color-text-muted", value: "#98a2b3" },
      { var: "--color-text-inverse", value: "#ffffff" },
    ],
  },
  {
    name: "Border",
    tokens: [
      { var: "--color-border-default", value: "#e4e7ec" },
      { var: "--color-border-strong", value: "#d0d5dd" },
    ],
  },
  {
    name: "Action",
    tokens: [
      { var: "--color-action-primary", value: "#2563eb" },
      { var: "--color-action-primary-hover", value: "#1d4ed8" },
      { var: "--color-action-primary-bg", value: "#eef4ff" },
      { var: "--color-action-primary-border", value: "#b8d0ff" },
    ],
  },
  {
    name: "Status",
    tokens: [
      { var: "--color-status-success", value: "#12855c" },
      { var: "--color-status-warning", value: "#b45309" },
      { var: "--color-status-danger", value: "#d92d20" },
      { var: "--color-status-info", value: "#2563eb" },
    ],
  },
] as const;

export const spacingSteps = [
  { var: "--space-1", px: 4 },
  { var: "--space-2", px: 8 },
  { var: "--space-3", px: 12 },
  { var: "--space-4", px: 16 },
  { var: "--space-5", px: 20 },
  { var: "--space-6", px: 24 },
  { var: "--space-8", px: 32 },
] as const;

export const radii = [
  { var: "--radius-sm", px: 6 },
  { var: "--radius-md", px: 8 },
  { var: "--radius-pill", px: 100 },
] as const;

export const controlHeights = [
  { var: "--control-height-sm", px: 32 },
  { var: "--control-height-md", px: 40 },
  { var: "--control-height-lg", px: 48 },
] as const;

export const typeScale = [
  { var: "--text-xs", px: 11 },
  { var: "--text-sm", px: 12 },
  { var: "--text-md", px: 13 },
  { var: "--text-base", px: 14 },
  { var: "--text-lg", px: 16 },
  { var: "--text-xl", px: 20 },
] as const;
