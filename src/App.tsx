import { useCallback, useEffect, useRef, useState } from "react";
import { StoreProvider } from "./store";
import { ToastProvider } from "./toast";
import { IcebergSidebar } from "./components/IcebergSidebar";
import { ContentEditor } from "./components/ContentEditor";
import { PreviewPane } from "./components/PreviewPane";

// Fixed sidebar rail; the editor and preview share the remaining width. Dragging
// the divider changes the editor width, so shrinking it gives the preview more room.
const SIDEBAR = 168;
const MIN_EDITOR = 360;
const MIN_PREVIEW = 280;
const DEFAULT_EDITOR = 560;
const STORAGE_KEY = "iceberg.editorWidth";

const loadEditorWidth = (): number => {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_EDITOR;
};

export default function App() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [editorWidth, setEditorWidth] = useState(loadEditorWidth);
  const [dragging, setDragging] = useState(false);

  // Clamp so neither the editor nor the preview collapses below its minimum.
  const clamp = useCallback((width: number) => {
    const total = workspaceRef.current?.clientWidth ?? window.innerWidth;
    const max = total - SIDEBAR - MIN_PREVIEW;
    return Math.max(MIN_EDITOR, Math.min(width, max));
  }, []);

  // Re-clamp a persisted width against the current window on mount so a wide
  // saved value can't over-shrink the preview on a smaller screen.
  useEffect(() => {
    setEditorWidth((w) => clamp(w));
  }, [clamp]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const left = workspaceRef.current?.getBoundingClientRect().left ?? 0;
      setEditorWidth(clamp(e.clientX - left - SIDEBAR));
    };
    const onUp = () => setDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, clamp]);

  // Persist the chosen width once a drag settles so it survives a refresh.
  useEffect(() => {
    if (dragging) return;
    localStorage.setItem(STORAGE_KEY, String(editorWidth));
  }, [dragging, editorWidth]);

  return (
    <StoreProvider>
      <ToastProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="logo">◭</span>
            <span className="brand-name">Iceberg</span>
          </div>
        </header>
        <div
          className="workspace"
          ref={workspaceRef}
          style={{ gridTemplateColumns: `${SIDEBAR}px ${editorWidth}px 6px minmax(0, 1fr)` }}
        >
          <IcebergSidebar />
          <ContentEditor />
          <div
            className={`resizer${dragging ? " dragging" : ""}`}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor panel"
            onMouseDown={() => setDragging(true)}
          />
          <PreviewPane />
        </div>
      </div>
      </ToastProvider>
    </StoreProvider>
  );
}
