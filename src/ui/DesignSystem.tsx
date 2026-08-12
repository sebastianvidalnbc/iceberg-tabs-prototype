import { FoundationsSection } from "./docs/FoundationsSection";
import { ActionsSection } from "./docs/ActionsSection";
import { FormSection } from "./docs/FormSection";
import { NavigationSection } from "./docs/NavigationSection";
import { ContentSection } from "./docs/ContentSection";
import { FeedbackSection } from "./docs/FeedbackSection";
import { OverlaysSection } from "./docs/OverlaysSection";
import { PatternsSection } from "./docs/PatternsSection";

const SECTIONS = [
  { id: "foundations", label: "Foundations" },
  { id: "actions", label: "Actions" },
  { id: "form-controls", label: "Form Controls" },
  { id: "navigation", label: "Navigation" },
  { id: "content-structure", label: "Content Structure" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "patterns", label: "Patterns" },
] as const;

// Keyboard-navigable, semantic docs page reached via #/design-system. Layout
// classes (.ui-ds*) live in ui.css and use tokens only.
export function DesignSystem() {
  return (
    <div className="ui-ds">
      <a className="ui-ds__back" href="#">
        ← Back to editor
      </a>
      <nav className="ui-ds__nav" aria-label="Design system sections">
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#/design-system#${s.id}`}>{s.label}</a>
            </li>
          ))}
        </ol>
      </nav>
      <main className="ui-ds__content">
        <h1>Iceberg UI</h1>
        <p className="ui-ds__lead">
          A reusable design system built from the prototype's own tokens. Eight categories, one
          shared stylesheet, zero visual drift.
        </p>
        <FoundationsSection />
        <ActionsSection />
        <FormSection />
        <NavigationSection />
        <ContentSection />
        <FeedbackSection />
        <OverlaysSection />
        <PatternsSection />
      </main>
    </div>
  );
}
