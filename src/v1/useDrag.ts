import { useState } from "react";

export interface DragState {
  from: number;
  over: number | null;
}

// Reusable HTML5 drag-reorder state machine for a single vertical list.
// `onDrop(from, to)` is called with the source and destination indices.
export function useDrag(onDrop: (from: number, to: number) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const handlers = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      setDrag({ from: index, over: index });
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDrag((d) => (d && d.over !== index ? { ...d, over: index } : d));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (drag) onDrop(drag.from, index);
      setDrag(null);
    },
    onDragEnd: () => setDrag(null),
  });

  const isDragging = (index: number) => drag?.from === index;
  const isOver = (index: number) => drag?.over === index && drag.from !== index;

  return { handlers, isDragging, isOver };
}
