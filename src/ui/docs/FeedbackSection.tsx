import { Callout } from "../Callout";
import { Badge, StatusDot } from "../Badge";
import { LoadingIndicator } from "../Loading";
import { EmptyState } from "../EmptyState";
import { Button } from "../Button";
import { useToast } from "../Toast";

export function FeedbackSection() {
  const { notify } = useToast();

  return (
    <section id="feedback">
      <h2>Feedback</h2>
      <p className="ui-ds__lead">
        Status is never color-only — callouts, badges and dots always include text; validation uses
        an icon plus text.
      </p>

      <h3>Callouts</h3>
      <div className="ui-ds__stack" style={{ maxWidth: 560 }}>
        <Callout variant="info">Heads up — this section has unsaved changes.</Callout>
        <Callout variant="success">Your changes were saved.</Callout>
        <Callout variant="warning">Two tabs are missing a description.</Callout>
        <Callout variant="danger">Publishing failed. Try again.</Callout>
      </div>

      <h3>Badges & status dots</h3>
      <div className="ui-ds__row">
        <Badge>Default</Badge>
        <Badge variant="success">Published</Badge>
        <Badge variant="warning">In review</Badge>
        <Badge variant="danger">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <div className="ui-ds__row">
        <StatusDot status="success">Published</StatusDot>
        <StatusDot status="warning">In review</StatusDot>
        <StatusDot>Draft</StatusDot>
      </div>

      <h3>Loading</h3>
      <div className="ui-ds__row">
        <LoadingIndicator showLabel />
      </div>

      <h3>Toast</h3>
      <div className="ui-ds__row">
        <Button variant="secondary" onClick={() => notify("Tab duplicated")}>
          Show toast
        </Button>
      </div>

      <h3>Empty state</h3>
      <div className="ui-ds__card">
        <EmptyState
          icon="search"
          title="No sections yet"
          description="Add your first section to start building this page."
          action={
            <Button variant="primary" size="sm" leadingIcon="plus">
              Add section
            </Button>
          }
        />
      </div>
    </section>
  );
}
