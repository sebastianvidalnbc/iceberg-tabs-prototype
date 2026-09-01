import { useState } from "react";
import type { MenuItem } from "./components/Menu";

export interface MenuState {
  x: number;
  y: number;
  items: MenuItem[];
  align: "left" | "right";
}

// Small helper for managing a single open floating menu (overflow or context).
export function useMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);

  // Right-click / context menus open at the pointer.
  const openAt = (e: { clientX: number; clientY: number }, items: MenuItem[]) =>
    setMenu({ x: e.clientX, y: e.clientY, items, align: "left" });

  // Overflow (•••) buttons anchor to the trigger instead of the pointer, so the
  // menu lands in the same place however the button was activated (mouse or
  // keyboard) and hangs leftwards from the trigger like production Iceberg.
  const openAtTrigger = (el: HTMLElement | null, items: MenuItem[]) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenu({ x: r.right, y: r.bottom + 2, items, align: "right" });
  };

  const close = () => setMenu(null);

  return { menu, openAt, openAtTrigger, close };
}
