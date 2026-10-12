import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AppShell } from "../AppShell";
import { navigate, routes } from "../browse";
import { Breadcrumb } from "../ui-lib/Breadcrumb";
import { Icon } from "../ui-lib/Icon";
import { ContentPageOutline } from "../regions/ContentPageOutline";
import { ContentPageProperties } from "../regions/ContentPageProperties";
import { ContentPagePreview } from "../regions/ContentPagePreview";
import {
  CONTENT_PAGE_HISTORY,
  DEFAULT_ATOM_ID,
  atomById,
  getContentPage,
  listContentPages,
  subscribeContentPages,
  type ContentPageConfig,
  type OutlineGroupId,
  type PassConfig,
  type PassType,
} from "../contentPages";

const EXPLORER_MIN = 240;
const EXPLORER_MAX = 420;
const EXPLORER_DEFAULT = 280;

export function ContentPagesWorkspace({ pageId }: { pageId: string }) {
  const pages = useSyncExternalStore(
    subscribeContentPages,
    listContentPages,
    listContentPages,
  );
  const record = pages.find((page) => page.id === pageId);

  const [config, setConfig] = useState<ContentPageConfig | null>(
    () => record?.config ?? null,
  );
  const [group, setGroup] = useState<OutlineGroupId>("overview");
  const [atomId, setAtomId] = useState(DEFAULT_ATOM_ID);
  const [passType, setPassType] = useState<PassType>("select");
  const [explorerWidth, setExplorerWidth] = useState(EXPLORER_DEFAULT);

  useEffect(() => {
    const page = getContentPage(pageId);
    if (!page) {
      navigate(routes.contentPages());
      return;
    }
    setConfig(page.config);
  }, [pageId]);

  const title = atomById(atomId);

  const onPatch = useCallback((patch: Partial<ContentPageConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const onPatchPass = useCallback((type: PassType, patch: Partial<PassConfig>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        passes: prev.passes.map((p) =>
          p.passType === type ? { ...p, ...patch } : p,
        ),
      };
    });
  }, []);

  const onSelectGroup = useCallback((id: OutlineGroupId) => {
    setGroup(id);
    if (id.startsWith("pass-")) setPassType(id.slice(5) as PassType);
  }, []);

  const beginResize = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startW = explorerWidth;
      const onMove = (ev: PointerEvent) => {
        setExplorerWidth(
          Math.min(EXPLORER_MAX, Math.max(EXPLORER_MIN, startW + (ev.clientX - startX))),
        );
      };
      const onUp = () => {
        el.releasePointerCapture?.(e.pointerId);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [explorerWidth],
  );

  if (!record || !config) return null;

  const history = {
    editedBy: record.editedBy,
    editDate: CONTENT_PAGE_HISTORY.editDate,
  };

  return (
    <AppShell activeContext="contentPage">
      <div className="ui-ws-editor">
        <div className="ui-ws-editor__bar">
          <Breadcrumb
            items={[
              { label: "Content Pages", href: routes.contentPages() },
              { label: record.name },
            ]}
          />
          <span
            className="ml-auto inline-flex items-center gap-1 text-[length:var(--type-label-md-size)] leading-[length:var(--type-label-md-lh)] font-medium text-[var(--color-text-muted)]"
          >
            <Icon name="check" size={16} />
            Saved
          </span>
        </div>
        <div
          className="ui-ws"
          style={{ "--ws-explorer-w": `${explorerWidth}px` } as CSSProperties}
        >
          <ContentPageOutline
            selected={group}
            onSelect={onSelectGroup}
            title={record.name}
            history={history}
          />
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize structure panel"
            title="Drag to resize"
            onPointerDown={beginResize}
            onDoubleClick={() => setExplorerWidth(EXPLORER_DEFAULT)}
            className="group relative z-10 -mx-1 w-2 shrink-0 cursor-col-resize touch-none select-none"
          >
            <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--color-border-strong)] transition-colors group-hover:w-[3px] group-hover:bg-[var(--color-action-primary)]" />
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-7 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] shadow-[var(--elevation-1)]"
            >
              <span className="grid grid-cols-2 gap-[3px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="size-[3px] rounded-full bg-[var(--color-text-muted)]" />
                ))}
              </span>
            </span>
          </div>
          <ContentPagePreview
            title={title}
            config={config}
            passType={passType}
            atomId={atomId}
            onAtomChange={setAtomId}
            onPassChange={setPassType}
          />
          <ContentPageProperties
            group={group}
            config={config}
            slug={record.slug}
            territory={`${record.territory} · ${record.locale}`}
            editedBy={record.editedBy}
            onPatch={onPatch}
            onPatchPass={onPatchPass}
          />
        </div>
      </div>
    </AppShell>
  );
}
