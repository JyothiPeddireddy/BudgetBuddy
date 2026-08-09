import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border ${
              t.type === "success"
                ? "bg-white border-emerald/20 text-ink"
                : "bg-white border-coral/20 text-ink"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald shrink-0" />
            ) : (
              <XCircle size={18} className="text-coral shrink-0" />
            )}
            <span className="text-sm">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate/50 hover:text-slate ml-1">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}