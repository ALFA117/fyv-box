"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-success" aria-hidden />,
  error:   <XCircle className="h-5 w-5 text-danger" aria-hidden />,
  warning: <AlertTriangle className="h-5 w-5 text-amber" aria-hidden />,
  info:    <Info className="h-5 w-5 text-cream-muted" aria-hidden />,
};

const tone = {
  success: "border-success-border",
  error:   "border-danger-border",
  warning: "border-amber-border",
  info:    "border-line-strong",
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    timer.current = setTimeout(() => onRemove(t.id), t.kind === "error" ? 6000 : 4000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [t.id, t.kind, onRemove]);

  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      role={t.kind === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface px-4 py-3 shadow-[var(--shadow-lg)] ${tone[t.kind]}`}
    >
      <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
      <p className="flex-1 py-0.5 text-sm leading-snug text-cream">{t.message}</p>
      <button
        type="button"
        onClick={() => onRemove(t.id)}
        aria-label="Cerrar notificación"
        className="-my-2 -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cream-muted transition-colors hover:text-cream"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, message, kind }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notificaciones"
        className="px-gutter pointer-events-none fixed inset-x-0 z-[1000] flex flex-col items-center gap-2 sm:items-end"
        style={{ bottom: "calc(var(--safe-bottom) + 16px)" }}
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onRemove={remove} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
