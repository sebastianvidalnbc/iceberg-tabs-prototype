// The prototype's floating menu now renders through the design-system Menu so
// both share one implementation and the `.ui-menu*` styles. UiMenuItem extends
// the old MenuItem shape (adds optional `icon`), so existing call sites
// (useMenu, TreeCollection, TreeItem) keep compiling unchanged.
export { Menu } from "../ui/Menu";
export type { UiMenuItem as MenuItem } from "../ui/Menu";
