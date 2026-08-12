// Toast is intentionally not re-implemented. The prototype already ships a
// working ToastProvider/useToast (src/toast.tsx). The design system only
// supplies the .ui-toast-host / .ui-toast styling (ui.css), which supersedes
// the legacy .toast rules once migrated. Re-export the existing API so design
// system consumers import it from one place.
export { ToastProvider, useToast } from "../toast";
export type { Toast } from "../toast";
