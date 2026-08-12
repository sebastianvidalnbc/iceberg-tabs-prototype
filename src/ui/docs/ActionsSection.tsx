import { Button, IconButton } from "../Button";

export function ActionsSection() {
  return (
    <section id="actions">
      <h2>Actions</h2>
      <p className="ui-ds__lead">
        One button primitive with four variants and two sizes. Icon-only actions require a label.
      </p>

      <h3>Variants</h3>
      <div className="ui-ds__row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <h3>Sizes</h3>
      <div className="ui-ds__row">
        <Button variant="primary" size="md">
          Medium (40px)
        </Button>
        <Button variant="primary" size="sm">
          Small (32px)
        </Button>
      </div>

      <h3>With icons</h3>
      <div className="ui-ds__row">
        <Button variant="secondary" leadingIcon="plus">
          Add item
        </Button>
        <Button variant="secondary" trailingIcon="download">
          Export
        </Button>
        <IconButton icon="dots" aria-label="More actions" />
      </div>

      <h3>States</h3>
      <div className="ui-ds__row">
        <Button variant="primary" loading>
          Loading
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="secondary" block style={{ maxWidth: 240 }}>
          Block
        </Button>
      </div>
    </section>
  );
}
