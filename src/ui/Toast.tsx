import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

// A lightweight, non-blocking toast system. Toasts auto-dismiss and are used to
// confirm tab actions (duplicate / copy / paste / delete / add) so the manual
// authoring work feels acknowledged. This is a shared design-system primitive:
// it only supplies behavior; the .ui-toast-host / .ui-toast styling lives in
// ui.css.
export interface Toast {
  id: number;
  message: string;
}

interface ToastApi {
  notify: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="ui-toast-host" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} className="ui-toast" onClick={() => dismiss(t.id)}>
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
