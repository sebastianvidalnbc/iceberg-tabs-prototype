import type { StructureNode } from "@/v4-eos/data";

/** V4 Structure tree presentation — maps domain types to layers-panel cues. */
export type StructureLabelWeight = "regular" | "medium";

export interface StructureNodeVisual {
  labelWeight: StructureLabelWeight;
  /** Material Symbol name; omitted when the label alone is enough. */
  icon?: string;
  /** Extra space above top-level page sections (major group break). */
  sectionBreak?: boolean;
}

const COLLECTION_TYPES = new Set([
  "section-content",
  "content-area",
  "products",
  "plan-picker-data",
  "categories",
  "variant-categories",
  "product-features-list",
  "price-cadence",
  "pricing",
  "offers",
  "segmentation",
  "survey-responses",
  "schema-collection",
  "segment-names",
]);

export function getStructureNodeVisual(
  node: StructureNode,
  ctx: { depth: number; index: number; parentId: string | null },
): StructureNodeVisual {
  const t = node.objectType;
  const hasKids = Boolean(node.children?.length);

  if (t === "page-section") {
    return {
      labelWeight: "medium",
      icon: "view_agenda",
      sectionBreak: ctx.parentId === null && ctx.index > 0,
    };
  }
  if (t === "variation") {
    return { labelWeight: "medium", icon: "call_split" };
  }
  if (t === "section-options") {
    return { labelWeight: "regular", icon: "tune" };
  }
  if (t === "behaviours") {
    return { labelWeight: "regular", icon: "rule" };
  }
  if (t === "content-block") {
    return { labelWeight: "regular", icon: "text_fields" };
  }
  if (t === "widget-config" || t === "journey-flows") {
    return { labelWeight: "medium", icon: "settings" };
  }
  if (t === "offer-group" || t === "segmentation-group") {
    return { labelWeight: "medium" };
  }
  if (t === "segmentation-category") {
    return { labelWeight: "medium", icon: "folder" };
  }
  if (COLLECTION_TYPES.has(t ?? "")) {
    return { labelWeight: "medium", icon: "folder" };
  }
  if (t === "product" || t === "plan") {
    return { labelWeight: "regular", icon: "crop_square" };
  }
  if (t === "feature" || t === "cadence" || t === "pricing-option" || t === "offer") {
    return { labelWeight: "regular" };
  }
  if (t === "survey-response" || t === "segment-name") {
    return { labelWeight: "regular" };
  }
  if (hasKids) {
    return { labelWeight: "medium" };
  }
  return { labelWeight: "regular" };
}
