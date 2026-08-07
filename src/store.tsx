import { createContext, useContext, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { seedJourney } from "./data";
import { categoryIdOf, collectionKey, getList, keyField, newItem, pathKind, regenIds } from "./model";
import type { ListPath } from "./model";
import type { Clipboard, Journey, PublishStatus } from "./types";

export interface AppState {
  journey: Journey;
  // Per-collection-instance expansion: key -> id of the open item (or undefined).
  expanded: Record<string, string | undefined>;
  clipboard?: Clipboard;
}

export type Action =
  | { type: "toggleExpand"; path: ListPath; id: string }
  | { type: "rename"; path: ListPath; id: string; name: string }
  | { type: "updateField"; path: ListPath; id: string; patch: Record<string, unknown> }
  | { type: "toggleDisabled"; path: ListPath; id: string }
  | { type: "setPublishStatus"; categoryId: string; status: PublishStatus }
  | { type: "add"; path: ListPath }
  | { type: "duplicate"; path: ListPath; id: string }
  | { type: "copy"; path: ListPath; id: string }
  | { type: "paste"; path: ListPath }
  | { type: "delete"; path: ListPath; id: string }
  | { type: "reorder"; path: ListPath; from: number; to: number };

const stamp = (): string => new Date().toISOString().slice(0, 16).replace("T", " ");

const initialState = (): AppState => {
  const journey = seedJourney();
  const firstCategory = journey.categories[0];
  return {
    journey,
    expanded: { [collectionKey({ kind: "category" })]: firstCategory?.id },
    clipboard: undefined,
  };
};

// Bump lastModified on the category that owns the mutated item. For the
// top-level list the affected category is the item itself (id === categoryId).
const touch = (state: AppState, path: ListPath, id: string) => {
  const categoryId = path.kind === "category" ? id : categoryIdOf(path);
  const cat = state.journey.categories.find((c) => c.id === categoryId);
  if (cat) cat.lastModified = stamp();
};

function reducer(prev: AppState, action: Action): AppState {
  const state: AppState = structuredClone(prev);
  switch (action.type) {
    case "toggleExpand": {
      const key = collectionKey(action.path);
      state.expanded[key] = state.expanded[key] === action.id ? undefined : action.id;
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
      const cat = state.journey.categories.find((c) => c.id === action.categoryId);
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
