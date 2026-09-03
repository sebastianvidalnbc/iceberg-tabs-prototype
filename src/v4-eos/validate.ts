// Validation — the V4 analog of real Iceberg's form validation + save gating
// (formValidator.service + artifact.invalidSections + checkValidationErrors).
// Each element's schema declares `required` fields; an instance is invalid when
// a required field resolves empty (schema default overridden to blank in the
// instance's `content`). The editor aggregates these into a save gate, exactly
// like the real editor blocks save while invalidSections is non-empty.
import { classifyNode, type StructureNode, type VariantWorkspace } from "./data";

export interface ValidationIssue {
  nodeId: string;
  nodeLabel: string;
  field: string;
}

// The effective value for a field on an instance: schema default with the
// instance's authored `content` layered on top (same resolution the panel uses).
function effectiveValue(node: StructureNode, label: string, fallback: string): string {
  return node.content?.[label] ?? fallback;
}

// Walk an experience's Structure and collect every required-but-empty field.
// Disabled nodes are excluded (they are not part of the published experience),
// mirroring how hidden/disabled sections drop out of the real validity check.
export function collectInvalidFields(
  variant: VariantWorkspace | null,
): ValidationIssue[] {
  if (!variant) return [];
  const out: ValidationIssue[] = [];
  const walk = (nodes: StructureNode[], parent: StructureNode | null) => {
    for (const node of nodes) {
      if (!node.disabled) {
        const resolved = classifyNode(node, parent);
        if (resolved.kind === "fields") {
          const groups = resolved.data.groups ?? [
            { fields: resolved.data.fields ?? [] },
          ];
          for (const g of groups) {
            for (const f of g.fields) {
              if (!f.required) continue;
              const v = effectiveValue(node, f.label, f.value);
              if (!v || v.trim() === "") {
                out.push({ nodeId: node.id, nodeLabel: node.label, field: f.label });
              }
            }
          }
        }
      }
      if (node.children) walk(node.children, node);
    }
  };
  walk(variant.structure, null);
  return out;
}
