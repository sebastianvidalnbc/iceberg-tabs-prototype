import { useState } from "react";

export interface DragState {
  from: number;
  over: number | null;
}

// Reusable HTML5 drag-reorder state machine for a single vertical list.
// `onDrop(from, to)` is called with the source and destination indices.
//
// The props are split so a list can expose an EXPLICIT drag handle: `gripProps`
// makes only the handle draggable, while `dropProps` makes the whole row a drop
// target. That keeps the row's disclosure control, overflow menu and form fields
// free of drag behaviour. `handlers` (handle + target on one element) remains for
// call sites that still drag by the whole row.
export function useDrag(onDrop: (from: number, to: number) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const gripProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      // Drag the whole row, not just the handle glyph, so the ghost matches what
      // is actually being moved.
      const row = (e.currentTarget as HTMLElement).closest("[data-drag-row]");
      if (row) e.dataTransfer.setDragImage(row, 12, 12);
      setDrag({ from: index, over: index });
    },
    onDragEnd: () => setDrag(null),
  });

  const dropProps = (index: number) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDrag((d) => (d && d.over !== index ? { ...d, over: index } : d));
    },
    onDrop: (e: React.DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      onDrop(drag.from, index);
      setDrag(null);
    },
  });

  const handlers = (index: number) => ({ ...gripProps(index), ...dropProps(index) });

  const isDragging = (index: number) => drag?.from === index;
  const isOver = (index: number) => drag?.over === index && drag.from !== index;

  return { gripProps, dropProps, handlers, isDragging, isOver };
}
