"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  success: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
  error:   <XCircle    className="h-4 w-4 text-[var(--danger)]" />,
  warning: <AlertTriangle className="h-4 w-4 text-[var(--amber)]" />,
  info:    <Info       className="h-4 w-4 text-[var(--cream-muted)]" />,
};

const bg = {
  success: "border-[var(--success-border)] bg-[var(--success-subtle)]",
  error:   "border-[var(--danger-border)]  bg-[var(--danger-subtle)]",
  warning: "border-[var(--amber-border)]   bg-[var(--amber-subtle)]",
  info:    "border-[var(--border-strong)]  bg-[var(--surface)]",
};

function ToastItem({
  toast: t,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => onRemove(t.id), 4000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [t.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: .96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 12, scale: .96 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur-sm ${bg[t.kind]}`}
    >
      <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
      <p className="flex-1 text-sm leading-snug text-[var(--cream)]">{t.message}</p>
      <button
        onClick={() => onRemove(t.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 text-[var(--cream-muted)] hover:text-[var(--cream)] transition-colors"
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
    setToasts((prev) => [...prev.slice(-3), { id, message, kind }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-label="Notificaciones"
        className="fixed bottom-safe-bottom right-4 z-[1000] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 pb-4 pt-0"
        style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
