import { createContext, useContext, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { seedJourney, seedPage, seedSectionOptions } from "./data";
import {
  categoryIdOf,
  collectionKey,
  findVariation,
  getList,
  keyField,
  newItem,
  pathKind,
  regenIds,
  variationIdOf,
} from "./model";
import type { ListPath } from "./model";
import type { Clipboard, Journey, PageMeta, PublishStatus, SectionOptions } from "./types";

export interface AppState {
  journey: Journey;
  // The page that owns the sections (URL/page context + sibling section rows).
  page: PageMeta;
  // Whether the target section (the one being redesigned) is expanded on the page.
  sectionExpanded: boolean;
  // Which primary top-level area is showing: Section Content or Section Options.
  activeSection: "content" | "options";
  sectionOptions: SectionOptions;
  // Per-collection-instance expansion: key -> ids of the open items. Multiple
  // siblings can be open at once, which is what makes "expand all" meaningful.
  expanded: Record<string, string[]>;
  clipboard?: Clipboard;
}

export type Action =
  | { type: "toggleTargetSection" }
  | { type: "setActiveSection"; section: "content" | "options" }
  | { type: "updateSectionOptions"; patch: Record<string, unknown> }
  | { type: "toggleExpand"; path: ListPath; id: string }
  | { type: "expandAll"; path: ListPath; ids: string[] }
  | { type: "collapseAll"; path: ListPath }
  | { type: "rename"; path: ListPath; id: string; name: string }
  | { type: "updateField"; path: ListPath; id: string; patch: Record<string, unknown> }
  | { type: "toggleDisabled"; path: ListPath; id: string }
  | { type: "setPublishStatus"; variationId: string; categoryId: string; status: PublishStatus }
  | { type: "add"; path: ListPath }
  | { type: "duplicate"; path: ListPath; id: string }
  | { type: "copy"; path: ListPath; id: string }
  | { type: "paste"; path: ListPath }
  | { type: "delete"; path: ListPath; id: string }
  | { type: "reorder"; path: ListPath; from: number; to: number };

const stamp = (): string => new Date().toISOString().slice(0, 16).replace("T", " ");

const initialState = (): AppState => {
  const journey = seedJourney();
  // Open the first variation that has content ("Control") so the demo opens on
  // a populated variation.
  const firstWithContent =
    journey.variations.find((v) => v.categories.length > 0) ?? journey.variations[0];
  return {
    journey,
    page: seedPage(),
    // Open the target section by default so the demo lands inside the redesign.
    sectionExpanded: true,
    activeSection: "content",
    sectionOptions: seedSectionOptions(),
    expanded: firstWithContent
      ? { [collectionKey({ kind: "variation" })]: [firstWithContent.id] }
      : {},
    clipboard: undefined,
  };
};

// Bump lastModified on the category that owns the mutated item. Variations have
// no timestamp, so top-level variation mutations are a no-op here.
const touch = (state: AppState, path: ListPath, id: string) => {
  if (path.kind === "variation") return;
  const variation = findVariation(state.journey, variationIdOf(path));
  if (!variation) return;
  const categoryId = path.kind === "category" ? id : categoryIdOf(path);
  const cat = variation.categories.find((c) => c.id === categoryId);
  if (cat) cat.lastModified = stamp();
};

function reducer(prev: AppState, action: Action): AppState {
  const state: AppState = structuredClone(prev);
  switch (action.type) {
    case "toggleTargetSection": {
      state.sectionExpanded = !state.sectionExpanded;
      return state;
    }
    case "setActiveSection": {
      // Only flips the active area; the `expanded` map is preserved by the
      // structuredClone above, so switching tabs keeps prior open state.
      state.activeSection = action.section;
      return state;
    }
    case "updateSectionOptions": {
      Object.assign(state.sectionOptions, action.patch);
      return state;
    }
    case "toggleExpand": {
      const key = collectionKey(action.path);
      const open = state.expanded[key] ?? [];
      state.expanded[key] = open.includes(action.id)
        ? open.filter((id) => id !== action.id)
        : [...open, action.id];
      return state;
    }
    case "expandAll": {
      state.expanded[collectionKey(action.path)] = [...action.ids];
      return state;
    }
    case "collapseAll": {
      state.expanded[collectionKey(action.path)] = [];
      return state;
    }
    case "rename": {
      const list = getList(state.journey, action.path);
      const item = list?.find((i) => i.id === action.id);
      if (item) (item as unknown as Record<string, unknown>)[keyField[pathKind(action.path)]] = action.name;
      touch(state, action.path, action.id);
      return state;
    }
    case "updateField": {
      const list = getList(state.journey, action.path);
      const item = list?.find((i) => i.id === action.id);
      if (item) Object.assign(item, action.patch);
      touch(state, action.path, action.id);
      return state;
    }
    case "toggleDisabled": {
      const list = getList(state.journey, action.path);
      const item = list?.find((i) => i.id === action.id) as { disabled?: boolean } | undefined;
      if (item) item.disabled = !item.disabled;
      touch(state, action.path, action.id);
      return state;
    }
    case "setPublishStatus": {
      const variation = findVariation(state.journey, action.variationId);
      const cat = variation?.categories.find((c) => c.id === action.categoryId);
      if (cat) {
        cat.publishStatus = action.status;
        cat.lastModified = stamp();
      }
      return state;
    }
    case "add": {
      const list = getList(state.journey, action.path);
      if (list) list.push(newItem(action.path) as never);
      touch(state, action.path, "");
      return state;
    }
    case "duplicate": {
      const list = getList(state.journey, action.path);
      const idx = list?.findIndex((i) => i.id === action.id) ?? -1;
      if (list && idx >= 0) {
        const key = keyField[pathKind(action.path)];
        const copy = regenIds(list[idx]) as unknown as Record<string, unknown>;
        const original = list[idx] as unknown as Record<string, unknown>;
        copy[key] = `${(original[key] as string) ?? ""} copy`;
        list.splice(idx + 1, 0, copy as never);
      }
      touch(state, action.path, action.id);
      return state;
    }
    case "copy": {
      const list = getList(state.journey, action.path);
      const item = list?.find((i) => i.id === action.id);
      if (item) state.clipboard = { kind: pathKind(action.path), item: structuredClone(item) };
      return state;
    }
    case "paste": {
      const list = getList(state.journey, action.path);
      if (list && state.clipboard && state.clipboard.kind === pathKind(action.path)) {
        list.push(regenIds(state.clipboard.item) as never);
      }
      touch(state, action.path, "");
      return state;
    }
    case "delete": {
      const list = getList(state.journey, action.path);
      const idx = list?.findIndex((i) => i.id === action.id) ?? -1;
      if (list && idx >= 0) list.splice(idx, 1);
      touch(state, action.path, action.id);
      return state;
    }
    case "reorder": {
      const list = getList(state.journey, action.path);
      if (list && action.from !== action.to) {
        const [moved] = list.splice(action.from, 1);
        list.splice(action.to, 0, moved);
      }
      touch(state, action.path, "");
      return state;
    }
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
