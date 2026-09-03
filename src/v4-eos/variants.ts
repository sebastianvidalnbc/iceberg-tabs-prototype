// Representative V2 Variant workspaces. SAMPLE DATA — deliberately simplified
// and NOT a byte-for-byte reproduction of production Iceberg content. Each
// Variant owns its own Structure tree, preview state, and default selection so
// the prototype demonstrates that different Variants have different structures.
import type {
  SectionDesign,
  SectionRole,
  StructureNode,
  StructureObjectType,
  VariantWorkspace,
} from "./data";

// Small helper to cut down on repetition when authoring sample trees.
const n = (
  id: string,
  label: string,
  children?: StructureNode[],
  expanded = true
): StructureNode => ({
  id,
  label,
  ...(children ? { children, defaultExpanded: expanded } : {}),
});

// Metadata-carrying node helper for the canonical 0609 Variant, where each
// object is tagged with its objectType (and, for Page Sections, sectionId +
// design) so Properties resolution is type-aware rather than label-guessed.
const nt = (
  id: string,
  label: string,
  objectType: StructureObjectType,
  opts: {
    children?: StructureNode[];
    expanded?: boolean;
    sectionId?: string;
    design?: SectionDesign;
    role?: SectionRole;
  } = {}
): StructureNode => ({
  id,
  label,
  objectType,
  ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
  ...(opts.design ? { design: opts.design } : {}),
  ...(opts.role ? { role: opts.role } : {}),
  ...(opts.children
    ? { children: opts.children, defaultExpanded: opts.expanded ?? true }
    : {}),
});

// --- Spanish voucher error message ------------------------------------------
const spanishStructure: StructureNode[] = [
  n("sv-title", "Title"),
  n("sv-voucher-error", "Voucher Error"),
  n("sv-legal", "Legal"),
];

// --- Testing disclaimer 2 ---------------------------------------------------
const disclaimerStructure: StructureNode[] = [
  n("td-title", "Title"),
  n("td-card", "Premium card first test", [
    n("td-section-content", "Section Content", [
      n("td-control", "Control", [
        n("td-variant-categories", "Variant Categories", [
          n("td-plans", "Plans", []),
        ]),
      ]),
    ]),
    n("td-section-options", "Section Options", []),
    n("td-disclaimer", "Disclaimer"),
  ]),
  n("td-legal", "Legal"),
];

// --- Annual Select Update ---------------------------------------------------
const annualStructure: StructureNode[] = [
  n("as-title", "Title"),
  n("as-plan-picker", "Plan Picker", [
    n("as-section-content", "Section Content", [
      n("as-control", "Control", [
        n("as-variant-categories", "Variant Categories", [
          n("as-plans", "Plans", [
            n("as-plan-picker-data", "Plan Picker Data", [
              n("as-premium", "Premium", []),
              n("as-premium-plus", "Premium Plus", []),
            ]),
          ]),
        ]),
      ]),
    ]),
    n("as-section-options", "Section Options", []),
  ]),
  n("as-legal", "Legal"),
];

// --- 0609 premium card test 2 (the canonical, architect-aligned sample) -----
// Three top-level Sections carrying explicit ROLES (Page Title / Plan Picker /
// Footer) distinct from their authored labels. Real Iceberg authoring wrappers
// are preserved: the Plan Picker section's Section Content holds the
// Predecision & Control variations; Control owns the content hierarchy
// Categories → Category → Products → Product → (Product Features / Price
// Cadence). Page Title & Footer are Custom sections with Content Areas +
// Section Options + Behaviours.
const premiumCardStructure: StructureNode[] = [
  nt("pc-title", "Title", "page-section", {
    sectionId: "section-1",
    role: "Page Title",
    design: "Custom",
    children: [
      nt("pc-title-desktop", "Desktop Content", "content-area"),
      nt("pc-title-mobile", "Mobile Content", "content-area"),
      nt("pc-title-section-options", "Section Options", "section-options", {
        design: "Custom",
      }),
      nt("pc-title-behaviours", "Behaviours", "behaviours"),
    ],
  }),
  nt("pc-card", "Premium card first test", "page-section", {
    sectionId: "section-2",
    role: "Plan Picker",
    design: "Intelligent authoring",
    children: [
      nt("pc-section-content", "Section Content", "section-content", {
        children: [
          nt("pc-predecision", "Predecision", "variation"),
          nt("pc-control", "Control", "variation", {
            children: [
              nt("pc-categories", "Categories", "categories", {
                children: [
                  nt("pc-plans", "Plans", "category", {
                    children: [
                      nt("pc-products", "Products", "products", {
                        children: [
                          nt("pc-select", "Select", "product", {
                            expanded: false,
                            children: [
                              nt(
                                "pc-select-features",
                                "Product Features",
                                "product-features-list",
                              ),
                            ],
                          }),
                          nt("pc-premium", "Premium", "product", {
                            children: [
                              nt("pc-product-features", "Product Features", "product-features-list", {
                                children: [
                                  nt("pc-feat-tv", "TV Favorites from NBC, Bravo & More", "feature"),
                                  nt("pc-feat-sports", "Live Sports", "feature"),
                                  nt("pc-feat-downloads", "Downloads", "feature"),
                                ],
                              }),
                              nt("pc-price-cadence", "Price Cadence", "price-cadence", {
                                children: [
                                  nt("pc-cad-annual", "Annual", "cadence"),
                                  nt("pc-cad-monthly", "Monthly", "cadence"),
                                ],
                              }),
                            ],
                          }),
                          nt("pc-premium-plus", "Premium Plus", "product", {
                            expanded: false,
                            children: [
                              nt(
                                "pc-pplus-features",
                                "Product Features",
                                "product-features-list",
                              ),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  nt("pc-bundles", "Bundles", "category", {
                    expanded: false,
                    children: [
                      nt("pc-bundles-products", "Products", "products"),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      nt("pc-section-options", "Section Options", "section-options", {
        design: "Intelligent authoring",
      }),
    ],
  }),
  nt("pc-footer", "Footer", "page-section", {
    sectionId: "section-3",
    role: "Footer",
    design: "Custom",
    children: [
      nt("pc-footer-desktop", "Desktop Content", "content-area"),
      nt("pc-footer-mobile", "Mobile Content", "content-area"),
      nt("pc-footer-section-options", "Section Options", "section-options", {
        design: "Custom",
      }),
      nt("pc-footer-behaviours", "Behaviours", "behaviours"),
    ],
  }),
];

// --- Premium_Test__2 --------------------------------------------------------
const premiumTest2Structure: StructureNode[] = [
  n("pt-title", "Title"),
  n("pt-plan-picker", "Premium Plan Picker", [
    n("pt-section-content", "Section Content", [
      n("pt-control", "Control", [
        n("pt-variant-categories", "Variant Categories", [
          n("pt-plans", "Plans", [
            n("pt-plan-picker-data", "Plan Picker Data", [
              n("pt-premium", "Premium", []),
              n("pt-premium-plus", "Premium Plus", []),
            ]),
          ]),
        ]),
      ]),
    ]),
    n("pt-section-options", "Section Options", []),
  ]),
  n("pt-faq", "FAQ"),
];

export const VARIANT_STRUCTURES: Record<string, StructureNode[]> = {
  "pg-spanish": spanishStructure,
  "pg-disclaimer2": disclaimerStructure,
  "pg-annual": annualStructure,
  "pg-0609": premiumCardStructure,
  "pg-premium-test-2": premiumTest2Structure,
};

// Re-exported so data.ts can assemble the full VariantWorkspace records.
export type { VariantWorkspace };
