// Per-Variant preview state and property schemas. SAMPLE DATA — representative
// only. The point is that switching Variants visibly changes the preview and
// the Properties, not production fidelity.
import type {
  ObjectProperties,
  PreviewData,
  ResolvedProperties,
  SectionDesign,
} from "./data";

// --- Preview data (center canvas) -------------------------------------------
export const VARIANT_PREVIEWS: Record<string, PreviewData> = {
  "pg-spanish": {
    title: "Mensaje de error de cupón",
    subtitle: "Voucher Error",
    tone: "error",
    body: "El código de cupón no es válido o ha caducado. Inténtalo de nuevo.",
  },
  "pg-disclaimer2": {
    title: "Testing disclaimer 2",
    subtitle: "Disclaimer treatment",
    tone: "neutral",
    body: "Single-card layout with an expanded legal disclaimer beneath the plan.",
  },
  "pg-annual": {
    title: "Annual Select Update",
    subtitle: "Plan Picker — 2 plans",
    tone: "plans",
    body: "Premium and Premium Plus shown side by side with annual pricing emphasis.",
  },
  "pg-0609": {
    title: "0609 premium card test 2",
    subtitle: "Plan Picker — 3 plans",
    tone: "plans",
    body: "Premium (Best Value), Premium Plus, and Sports with feature lists and pricing.",
  },
  "pg-premium-test-2": {
    title: "Premium_Test__2",
    subtitle: "Premium Plan Picker — 2 plans",
    tone: "plans",
    body: "Trimmed plan picker showing Premium and Premium Plus only.",
  },
};

// --- Default Structure selection per Variant --------------------------------
export const VARIANT_DEFAULT_SELECTION: Record<string, string> = {
  "pg-spanish": "sv-voucher-error",
  "pg-disclaimer2": "td-disclaimer",
  "pg-annual": "as-plans",
  "pg-0609": "pc-premium",
  "pg-premium-test-2": "pt-plan-picker",
};

// --- TYPE-keyed schema templates --------------------------------------------
// Generic field schemas keyed by object TYPE, using EXACT confirmed V1 labels
// and the real fields visible in the Iceberg screenshots. These give every
// non-authored node a meaningful field set. Explicit OBJECT_PROPERTIES[nodeId]
// (and per-node authored props) take precedence.

const ALIGNMENTS = ["Left", "Centre", "Right"];
const PICK_VARIANTS = ["Button Variant", "Card Variant", "Compact Variant"];
const BACKGROUNDS = ["None", "Dark", "Light", "Transparent"];
const CTA_CHOICES = ["None", "Primary", "Secondary"];
const LEGAL_TYPES = ["None", "Standard", "Custom"];

// Control (and other content variations). Real V1 fields, grouped under an
// ACCESSIBILITY header for the region toggle to keep the panel scannable.
export function controlSchema(label: string): ObjectProperties {
  return {
    eyebrow: "CONTENT VARIATION",
    name: label,
    groups: [
      {
        header: "ACCESSIBILITY",
        fields: [
          {
            label: "Include this section as a region",
            value: "true",
            kind: "checkbox",
            helper: "Exposes the section as an ARIA landmark region.",
          },
        ],
      },
      {
        header: "CONTENT",
        fields: [
          { label: "Plan Picker Title", value: "Pick a Plan. Cancel Anytime." },
          { label: "Subtitle", value: "" },
          {
            label: "Title & Subtitle Alignment",
            value: "Centre",
            kind: "select",
            options: ALIGNMENTS,
          },
          {
            label: "Enable Horizontal Scroll on Mobile",
            value: "false",
            kind: "checkbox",
          },
          {
            label: "Pick Variant",
            value: "Button Variant",
            kind: "select",
            options: PICK_VARIANTS,
          },
        ],
      },
    ],
  };
}

// Section Options has two real shapes depending on the section's Design mode.
// Custom → the layout/whitespace field list (screenshots 3–4).
// Intelligent authoring → the variant-name list (screenshot 8).
export function sectionOptionsSchema(design?: SectionDesign): ObjectProperties {
  if (design === "Intelligent authoring") {
    return {
      eyebrow: "SECTION OPTIONS",
      name: "Section Options",
      fields: [
        { label: "Label", value: "Premium card first test" },
        { label: "Type", value: "Modules" },
        { label: "Control / Default Variant - Name", value: "Control" },
        { label: "Variant A - Name", value: "Variant A" },
        { label: "Variant B - Name", value: "" },
        { label: "Variant C - Name", value: "" },
      ],
    };
  }
  return {
    eyebrow: "SECTION OPTIONS",
    name: "Section Options",
    groups: [
      {
        fields: [
          { label: "Label", value: "Title" },
          { label: "Type", value: "Modules" },
          { label: "Activate Tablet View", value: "false", kind: "switch" },
        ],
      },
      {
        header: "LAYOUT",
        fields: [
          { label: "Make section Full Width", value: "false", kind: "checkbox" },
          { label: "Hide section", value: "false", kind: "checkbox" },
          {
            label: "Include Vertical Whitespace (Gutters)",
            value: "false",
            kind: "checkbox",
          },
          {
            label: "Include Horizontal Whitespace",
            value: "false",
            kind: "checkbox",
          },
          {
            label: "Section Background Colour",
            value: "None",
            kind: "select",
            options: BACKGROUNDS,
          },
          {
            label: "Placeholder Vertical Alignment",
            value: "Top",
            kind: "select",
            options: ["Top", "Centre", "Bottom"],
          },
          {
            label: "Section Overlap Size",
            value: "None",
            kind: "select",
            options: ["None", "Small", "Medium", "Large"],
          },
          {
            label: "Rounded Corners",
            value: "None",
            kind: "select",
            options: ["None", "Small", "Medium", "Large"],
          },
          {
            label: "Inner Padding for Devices",
            value: "Default",
            kind: "select",
            options: ["Default", "Compact", "Spacious"],
          },
        ],
      },
    ],
  };
}

export function categorySchema(label: string): ObjectProperties {
  return {
    eyebrow: "VARIANT CATEGORY",
    name: label,
    fields: [
      { label: "Category Title", value: label, required: true },
      { label: "Category Query Parameter", value: label.toLowerCase() },
    ],
  };
}

// Plan (Plan Picker Data). Real fields grouped into PRODUCT / CTA / LEGAL,
// matching §17. Icon fields use the asset-picker control.
export function planSchema(label: string): ObjectProperties {
  return {
    eyebrow: "PLAN PICKER DATA",
    name: label,
    groups: [
      {
        header: "PRODUCT",
        fields: [
          { label: "Product Logo", value: "peacock-logo", kind: "asset" },
          { label: "Badge Title", value: "" },
          { label: "Lower Case Badge Title", value: "false", kind: "checkbox" },
          { label: "Eyebrow", value: "" },
          { label: "Product Title Icon", value: "", kind: "asset" },
          { label: "Product Title", value: label, required: true },
          { label: "Product Description", value: "", kind: "textarea" },
        ],
      },
      {
        header: "CTA",
        fields: [
          {
            label: "Choose a Primary CTA",
            value: "None",
            kind: "select",
            options: CTA_CHOICES,
          },
          { label: "Primary CTA Text", value: "" },
          { label: "Primary CTA HREF", value: "" },
          { label: "Voucher error text", value: "", kind: "textarea" },
          { label: "Product ID", value: "" },
          { label: "Voucher ID", value: "" },
          { label: "Remove Product ID", value: "false", kind: "checkbox" },
          { label: "Remove Voucher ID", value: "false", kind: "checkbox" },
          { label: "Maintain query parameters", value: "false", kind: "checkbox" },
        ],
      },
      {
        header: "LEGAL",
        fields: [
          {
            label: "Choose a Legal Description type",
            value: "None",
            kind: "select",
            options: LEGAL_TYPES,
          },
          { label: "Description - Legal", value: "", kind: "textarea" },
        ],
      },
    ],
  };
}

export function featureSchema(label: string): ObjectProperties {
  return {
    eyebrow: "PRODUCT FEATURE",
    name: label,
    fields: [
      { label: "Product Feature Icon", value: "check", kind: "asset" },
      { label: "Product Feature", value: label, kind: "textarea", required: true },
    ],
  };
}

// Pricing Option. Full §21 target list (extends V1's 4-field model with the
// additional pricing fields called for by the spec — clearly prototype).
export function pricingSchema(label: string): ObjectProperties {
  return {
    eyebrow: "PRICING OPTION",
    name: label,
    groups: [
      {
        header: "PRICING",
        fields: [
          { label: "Offer Detail", value: "" },
          { label: "Button Description", value: "", kind: "textarea" },
          { label: "Previous Price", value: "" },
          { label: "Offer Price", value: "" },
          { label: "Price Cadence and Subtext", value: "", kind: "textarea" },
          { label: "Aria Label", value: label, required: true },
        ],
      },
      {
        header: "CTA",
        fields: [
          {
            label: "Choose a Primary CTA",
            value: "None",
            kind: "select",
            options: CTA_CHOICES,
          },
          { label: "Primary CTA Text", value: "" },
          { label: "Primary CTA HREF", value: "" },
        ],
      },
    ],
  };
}

// Desktop / Mobile Content — a meaningful representation of the configured
// module (real Iceberg shows a grid; we surface the configured module here).
export function contentAreaSchema(label: string): ResolvedProperties {
  return {
    kind: "fields",
    data: {
      eyebrow: label.toUpperCase(),
      name: label,
      fields: [
        {
          label: "Configured Module",
          value: "NS - S-64afd60a-4d14-42ea-b12d-a7e872b23577",
          kind: "select",
          options: [
            "NS - S-64afd60a-4d14-42ea-b12d-a7e872b23577",
            "NS - Title Text",
          ],
          helper: "The module currently placed in this content area.",
        },
        {
          label: "Columns",
          value: label.toLowerCase().includes("mobile") ? "4" : "12",
          kind: "select",
          options: ["4", "12"],
        },
      ],
    },
  };
}

// Behaviours — a deliberate, minimal state (real Iceberg shows a single
// behaviour selector, screenshot 5). We do not invent a large schema.
export function behavioursState(sectionName: string): ResolvedProperties {
  return {
    kind: "fields",
    data: {
      eyebrow: "BEHAVIOURS",
      name: sectionName,
      fields: [
        {
          label: "Behaviour",
          value: "None",
          kind: "select",
          options: ["None"],
          helper: "No behaviour configured for this section.",
        },
      ],
    },
  };
}

// --- Property schemas per Structure object ----------------------------------
// Keyed by structure node id. Only objects with authored fields appear here;
// everything else falls back to a name-only panel (see data.ts).
export const OBJECT_PROPERTIES: Record<string, ObjectProperties> = {
  // 0609 premium card test 2 → Premium
  "pc-premium": {
    eyebrow: "PLAN PICKER DATA",
    name: "Premium",
    fields: [
      { label: "Product Logo", value: "peacock-logo" },
      { label: "Badge Title", value: "Best Value" },
      { label: "Lower Case Badge Title", value: "false", kind: "checkbox" },
      { label: "Eyebrow", value: "" },
      { label: "Product Title Icon", value: "" },
      { label: "Product Title", value: "Premium", required: true },
      {
        label: "Product Description",
        value:
          "Stream hit movies, bingeworthy shows, and live sports — plus new series the day after they air.",
        kind: "textarea",
      },
      { label: "Disclaimer", value: "", kind: "textarea" },
    ],
  },
  // Spanish voucher error message → Voucher Error
  "sv-voucher-error": {
    eyebrow: "ERROR MESSAGE",
    name: "Voucher Error",
    fields: [
      { label: "Error Title", value: "Cupón no válido", required: true },
      {
        label: "Error Body",
        value: "El código de cupón no es válido o ha caducado.",
        kind: "textarea",
      },
      { label: "Retry CTA Label", value: "Inténtalo de nuevo" },
    ],
  },
  // Testing disclaimer 2 → Disclaimer
  "td-disclaimer": {
    eyebrow: "SECTION CONTENT",
    name: "Disclaimer",
    fields: [
      { label: "Show Disclaimer", value: "true", kind: "checkbox" },
      {
        label: "Disclaimer Text",
        value:
          "Compatible device and Peacock account required. Live sports subject to regional availability.",
        kind: "textarea",
      },
    ],
  },
  // Annual Select Update → Plans
  "as-plans": {
    eyebrow: "VARIANT CATEGORIES",
    name: "Plans",
    fields: [
      { label: "Category Label", value: "Choose your plan", required: true },
      { label: "Billing Cadence", value: "Annual" },
      { label: "Highlight Best Value", value: "true", kind: "checkbox" },
    ],
  },
  // Premium_Test__2 → Premium Plan Picker
  "pt-plan-picker": {
    eyebrow: "SECTION CONTENT",
    name: "Premium Plan Picker",
    fields: [
      { label: "Header", value: "Pick your Premium plan", required: true },
      { label: "Plan Count", value: "2" },
      {
        label: "Subheader",
        value: "Compare Premium and Premium Plus.",
        kind: "textarea",
      },
    ],
  },
};
