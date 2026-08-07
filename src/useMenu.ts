import { useState } from "react";
import type { MenuItem } from "./components/Menu";

export interface MenuState {
  x: number;
  y: number;
  items: MenuItem[];
}

// Small helper for managing a single open floating menu (overflow or context).
export function useMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);

  const openAt = (e: { clientX: number; clientY: number }, items: MenuItem[]) =>
    setMenu({ x: e.clientX, y: e.clientY, items });

  const close = () => setMenu(null);

  return { menu, openAt, close };
}
