import { useState } from "react";
import { Section, CollapsibleSection } from "../Section";
import { CollectionHeader } from "../Collection";
import { TreeRow } from "../TreeRow";
import { ItemCountBadge, StatusIndicator } from "../Indicators";
import { Button } from "../Button";

// The nested-tab replacement: a token-indented tree that scales to any depth
// without per-data-type hard-coded classes.
export function ContentSection() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ tabs: true, plan: true });
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const noop = () => {};

  return (
    <section id="content-structure">
      <h2>Content Structure</h2>
      <p className="ui-ds__lead">
        Indentation is token-driven via a <code>level</code> prop, so hierarchy scales to arbitrary
        depth. Use a tree — not nested tabs — for nestable, reorderable content.
      </p>

      <h3>Section</h3>
      <Section title="Metadata" actions={<ItemCountBadge count={4} label="fields" />}>
        <p className="ui-ds__lead" style={{ margin: 0 }}>Static titled container body.</p>
      </Section>

      <h3>Collapsible section</h3>
      <CollapsibleSection title="Advanced options" expanded={open} onToggle={() => setOpen((v) => !v)}>
        <p className="ui-ds__lead" style={{ margin: 0 }}>Expands and collapses in place.</p>
      </CollapsibleSection>

      <h3>Collection + Tree (nested depths)</h3>
      <div className="ui-ds__card">
        <CollectionHeader title="Tabs" count={3} onAdd={noop} />
        <div role="tree" aria-label="Tabs">
          <TreeRow level={0} label="Tabs" hasChildren expanded={expanded.tabs} onToggle={() => toggle("tabs")} dragHandleProps={{}} onOverflow={noop} />
          {expanded.tabs && (
            <>
              <TreeRow level={1} label="Plan" hasChildren expanded={expanded.plan} onToggle={() => toggle("plan")} status={{ status: "success", label: "Published" }} dragHandleProps={{}} onOverflow={noop} />
              {expanded.plan && (
                <>
                  <TreeRow level={2} label="Feature: Storage" selected dragHandleProps={{}} onOverflow={noop} />
                  <TreeRow level={2} label="Feature: Support" validation="Missing description" dragHandleProps={{}} onOverflow={noop} />
                </>
              )}
              <TreeRow level={1} label="Promo" status={{ status: "warning", label: "In review" }} dragHandleProps={{}} onOverflow={noop} />
            </>
          )}
        </div>
      </div>

      <h3>Indicators</h3>
      <div className="ui-ds__row">
        <StatusIndicator status="success" label="Published" />
        <StatusIndicator status="warning" label="In review" />
        <StatusIndicator label="Draft" />
        <ItemCountBadge count={12} />
        <Button variant="tertiary" size="sm" leadingIcon="chevron-down">
          Expand all
        </Button>
      </div>
    </section>
  );
}
