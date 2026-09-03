import { cn } from "@/v4-eos/ui/lib/utils";

// Material Symbols glyph for the V4 shadcn layer. Eos's icon set IS Material
// Symbols, so the editor primitives (tree rows, panel search, property
// disclosure, row-action menus, form-control indicators) render their glyphs
// through this helper instead of lucide-react. `size` drives the font-size
// (glyph size); `className` positions/colours it like the lucide icons did.
export function MSym({
  name,
  size = 18,
  className,
  filled = false,
}: {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn("eos-icon material-symbols-outlined", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'opsz' ${size}, 'wght' 400, 'FILL' ${filled ? 1 : 0}, 'GRAD' 0`,
      }}
    >
      {name}
    </span>
  );
}
