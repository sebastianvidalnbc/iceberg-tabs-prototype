// Iceberg UI barrel export. Import components from "@/ui" (or relative "./ui").

// Icon is the single source of truth in the prototype; re-export it here.
export { Icon } from "../components/Icon";
export type { IconName } from "../components/Icon";

// Actions
export * from "./Button";
// Form
export * from "./TextInput";
export * from "./Textarea";
export * from "./Select";
export * from "./Checkbox";
export * from "./Radio";
export * from "./Switch";
export * from "./DateInput";
export * from "./Field";
// Navigation
export * from "./Tabs";
export * from "./SegmentedControl";
export * from "./Breadcrumb";
export * from "./Nav";
// Content structure
export * from "./Section";
export * from "./Collection";
export * from "./TreeRow";
export * from "./Indicators";
// Feedback
export * from "./Callout";
export * from "./Toast";
export * from "./Badge";
export * from "./Loading";
export * from "./EmptyState";
// Overlays
export * from "./Menu";
export * from "./Tooltip";
export * from "./Popover";
export * from "./ConfirmationDialog";
// Router
export * from "./useHashRoute";
