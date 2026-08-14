import { createContext, useContext, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { seedWidget } from "./data";
import { collectionKey, getList, keyField, newItem, pathKind, regenIds } from "./model";
import type { WidgetPath } from "./model";
import type { Widget, WidgetClipboard } from "./types";

// Self-contained store for the Widget scenario. It mirrors the Page scenario's
// proven reducer (same generic action set + expanded/clipboard shape) but owns a
// Widget root, so the Page store is never touched.
export interface WidgetState {
  widget: Widget;
  // Per-collection-instance expansion: key -> ids of open items.
  expanded: Record<string, string[]>;
  clipboard?: WidgetClipboard;
}

export type WidgetAction =
  | { type: "toggleExpand"; path: WidgetPath; id: string }
  | { type: "expandAll"; path: WidgetPath; ids: string[] }
  | { type: "collapseAll"; path: WidgetPath }
  | { type: "rename"; path: WidgetPath; id: string; name: string }
  | { type: "updateField"; path: WidgetPath; id: string; patch: Record<string, unknown> }
  | { type: "updateWidget"; patch: Record<string, unknown> }
  | { type: "toggleDisabled"; path: WidgetPath; id: string }
  | { type: "add"; path: WidgetPath }
  | { type: "duplicate"; path: WidgetPath; id: string }
  | { type: "copy"; path: WidgetPath; id: string }
  | { type: "paste"; path: WidgetPath }
  | { type: "delete"; path: WidgetPath; id: string }
  | { type: "reorder"; path: WidgetPath; from: number; to: number };

const initialState = (): WidgetState => {
  const widget = seedWidget();
  // Open one representative Offer by default (§21) so reviewers immediately see
  // meaningful fields + a nested Segmentation example without any setup.
  return {
    widget,
    expanded: { [collectionKey({ kind: "offer" })]: [widget.offers[0].id] },
    clipboard: undefined,
  };
};

function reducer(prev: WidgetState, action: WidgetAction): WidgetState {
  const state: WidgetState = structuredClone(prev);
  switch (action.type) {
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
      const list = getList(state.widget, action.path);
      const item = list?.find((i) => i.id === action.id);
      // Rename writes the kind's label field. For Offers/Survey Responses this is
      // customLabel, so the underlying segmentName/responseId is never mutated.
      if (item) (item as unknown as Record<string, unknown>)[keyField[pathKind(action.path)]] = action.name;
      return state;
    }
    case "updateField": {
      const list = getList(state.widget, action.path);
      const item = list?.find((i) => i.id === action.id);
      if (item) assignDeep(item as unknown as Record<string, unknown>, action.patch);
      return state;
    }
    case "updateWidget": {
      Object.assign(state.widget, action.patch);
      return state;
    }
    case "toggleDisabled": {
      const list = getList(state.widget, action.path);
      const item = list?.find((i) => i.id === action.id) as { disabled?: boolean } | undefined;
      if (item) item.disabled = !item.disabled;
      return state;
    }
    case "add": {
      const list = getList(state.widget, action.path);
      if (list) list.push(newItem(action.path) as never);
      return state;
    }
    case "duplicate": {
      const list = getList(state.widget, action.path);
      const idx = list?.findIndex((i) => i.id === action.id) ?? -1;
      if (list && idx >= 0) {
        const copy = regenIds(list[idx]) as unknown as Record<string, unknown>;
        // Prefix a "Copy of" custom label so the duplicate is recognisable while
        // leaving the underlying identifiers intact (§16).
        const src = list[idx] as unknown as Record<string, unknown>;
        const base = (src.customLabel as string) || (src.segmentName as string) ||
          (src.responseId as string) || "item";
        copy.customLabel = `Copy of ${base}`;
        list.splice(idx + 1, 0, copy as never);
      }
      return state;
    }
    case "copy": {
      const list = getList(state.widget, action.path);
      const item = list?.find((i) => i.id === action.id);
      if (item) state.clipboard = { kind: pathKind(action.path), item: structuredClone(item) };
      return state;
    }
    case "paste": {
      const list = getList(state.widget, action.path);
      if (list && state.clipboard && state.clipboard.kind === pathKind(action.path)) {
        list.push(regenIds(state.clipboard.item) as never);
      }
      return state;
    }
    case "delete": {
      const list = getList(state.widget, action.path);
      const idx = list?.findIndex((i) => i.id === action.id) ?? -1;
      if (list && idx >= 0) list.splice(idx, 1);
      return state;
    }
    case "reorder": {
      const list = getList(state.widget, action.path);
      if (list && action.from !== action.to) {
        const [moved] = list.splice(action.from, 1);
        list.splice(action.to, 0, moved);
      }
      return state;
    }
  }
}

// Shallow assign that also supports dotted "segmentation.categoryTitle" keys so
// nested scalar fields can be patched from a single Field control.
function assignDeep(target: Record<string, unknown>, patch: Record<string, unknown>) {
  for (const [k, v] of Object.entries(patch)) {
    if (k.includes(".")) {
      const [head, tail] = k.split(".");
      const child = (target[head] ??= {}) as Record<string, unknown>;
      child[tail] = v;
    } else {
      target[k] = v;
    }
  }
}

const WidgetStoreContext =
  createContext<{ state: WidgetState; dispatch: Dispatch<WidgetAction> } | null>(null);

export function WidgetStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WidgetStoreContext.Provider value={value}>{children}</WidgetStoreContext.Provider>;
}

export function useWidgetStore() {
  const ctx = useContext(WidgetStoreContext);
  if (!ctx) throw new Error("useWidgetStore must be used within WidgetStoreProvider");
  return ctx;
}
