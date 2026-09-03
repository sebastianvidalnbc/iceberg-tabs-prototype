import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn class combiner: merges conditional classes and de-dupes
// conflicting Tailwind utilities. Used by every component in src/v2/ui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
