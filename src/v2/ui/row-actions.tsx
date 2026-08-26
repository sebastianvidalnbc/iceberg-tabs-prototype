import { MoreHorizontal, Pencil, Copy, ClipboardPaste, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/v2/ui/dropdown-menu";

// Shared object-action model for Structure rows (§26). The same list backs the
// overflow (⋯) button and — via <RowActionsList> — the right-click ContextMenu,
// so both surfaces expose one action model. Static prototype: handlers no-op.
interface RowAction {
  id: string;
  label: string;
  icon: typeof Pencil;
  destructive?: boolean;
}

export const ROW_ACTIONS: RowAction[] = [
  { id: "rename", label: "Rename", icon: Pencil },
  { id: "duplicate", label: "Duplicate", icon: Copy },
  { id: "paste", label: "Paste", icon: ClipboardPaste },
  { id: "moveUp", label: "Move up", icon: ArrowUp },
  { id: "moveDown", label: "Move down", icon: ArrowDown },
  { id: "delete", label: "Delete", icon: Trash2, destructive: true },
];

// Overflow (⋯) trigger + menu. Appears on row hover/focus; stops propagation so
// opening the menu does not also select the row.
export function RowActionsMenu({ label }: { label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        aria-label={`Actions for ${label}`}
        className="flex size-5 items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 group-hover:opacity-100 data-[state=open]:opacity-100"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        className="w-44"
      >
        {ROW_ACTIONS.map((a) => (
          <div key={a.id}>
            {(a.id === "moveUp" || a.id === "delete") && <DropdownMenuSeparator />}
            <DropdownMenuItem variant={a.destructive ? "destructive" : "default"}>
              <a.icon className="size-4" />
              {a.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
