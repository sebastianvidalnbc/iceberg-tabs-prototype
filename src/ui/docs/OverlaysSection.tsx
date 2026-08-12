import { useState } from "react";
import { Menu, DropdownMenu } from "../Menu";
import type { UiMenuItem } from "../Menu";
import { Tooltip } from "../Tooltip";
import { Popover } from "../Popover";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Button, IconButton } from "../Button";

export function OverlaysSection() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const noop = () => {};

  // The canonical 7-item context menu. Move Up/Down are no-ops until the store
  // gains moveUp/moveDown actions (deferred).
  const items: UiMenuItem[] = [
    { label: "Rename", icon: "star", onClick: noop },
    { label: "Duplicate", icon: "sparkles", onClick: noop },
    { label: "Copy", icon: "download", onClick: noop },
    { label: "Paste", icon: "plus", onClick: noop },
    { label: "Move Up", icon: "chevron-right", onClick: noop },
    { label: "Move Down", icon: "chevron-down", onClick: noop },
    { label: "Delete", icon: "trash", danger: true, separatorBefore: true, onClick: noop },
  ];

  return (
    <section id="overlays">
      <h2>Overlays</h2>
      <p className="ui-ds__lead">
        The context menu works from both a right-click and an overflow (•••) button. Arrow keys move
        focus, Esc closes, and it clamps to the viewport.
      </p>

      <h3>Context menu</h3>
      <div
        className="ui-ds__card"
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <div className="ui-ds__row" style={{ margin: 0 }}>
          <span>Right-click anywhere in this card, or use the overflow button →</span>
          <IconButton
            icon="dots"
            aria-label="Row actions"
            onClick={(e) => setMenu({ x: e.clientX, y: e.clientY })}
          />
        </div>
      </div>
      {menu && <Menu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} />}

      <h3>Dropdown menu</h3>
      <DropdownMenu label="Actions" items={items} />

      <h3>Tooltip</h3>
      <div className="ui-ds__row">
        <Tooltip content="Duplicates this tab">
          <Button variant="secondary" size="sm">
            Hover or focus me
          </Button>
        </Tooltip>
      </div>

      <h3>Popover</h3>
      <Popover trigger="Open popover">
        <p className="ui-ds__lead" style={{ margin: 0 }}>Non-modal content. Click outside or press Esc to dismiss.</p>
      </Popover>

      <h3>Confirmation dialog</h3>
      <Button variant="destructive" onClick={() => setConfirm(true)}>
        Delete tab
      </Button>
      {confirm && (
        <ConfirmationDialog
          title="Delete this tab?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => setConfirm(false)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </section>
  );
}
