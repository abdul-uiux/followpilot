"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastTone = "success" | "error";
type ToastContextValue = { showToast: (message: string, tone?: ToastTone) => void };
type Toast = { id: number; message: string; tone: ToastTone };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const toastRef = useRef<Toast | null>(null);
  const dismissTimer = useRef<number | null>(null);
  const replaceTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    if (replaceTimer.current) window.clearTimeout(replaceTimer.current);
  };

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    clearTimers();

    const displayToast = () => {
      const nextToast = { id: Date.now(), message, tone };
      toastRef.current = nextToast;
      setToast(nextToast);
      window.requestAnimationFrame(() => setVisible(true));
      dismissTimer.current = window.setTimeout(() => setVisible(false), 3000);
    };

    if (toastRef.current) {
      setVisible(false);
      replaceTimer.current = window.setTimeout(displayToast, 180);
      return;
    }

    displayToast();
  }, []);

  useEffect(() => () => clearTimers(), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2.5rem)]"><div className={`flex items-center gap-2 rounded-lg border px-3.5 py-3 text-[13px] font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"} ${toast.tone === "error" ? "border-[#f1c8c3] bg-[#fffafa] text-[#a8342a]" : "border-[#deddda] bg-[#191919] text-white"}`}><span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${toast.tone === "error" ? "bg-[#fde5e2]" : "bg-white/15"}`}>{toast.tone === "error" ? "!" : "✓"}</span>{toast.message}</div></div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
