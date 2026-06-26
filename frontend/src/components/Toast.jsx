import { useCallback, useEffect, useRef, useState } from "react";

let _addToast = null;

/**
 * Global toast hook. Call useToast() anywhere in the tree to get the `toast` function.
 */
export function useToast() {
  return {
    toast: (message, type = "success") => {
      if (_addToast) _addToast({ message, type });
    },
    success: (message) => _addToast?.({ message, type: "success" }),
    error: (message) => _addToast?.({ message, type: "error" }),
    info: (message) => _addToast?.({ message, type: "info" }),
  };
}

/**
 * Toast container — mount this once at the app root.
 */
export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback(({ message, type }) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => {
      _addToast = null;
    };
  }, [addToast]);

  const icons = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  const colors = {
    success: { bg: "#1a2e1a", border: "#2d5a2d", icon: "#4ade80", text: "#86efac" },
    error: { bg: "#2e1a1a", border: "#5a2d2d", icon: "#f87171", text: "#fca5a5" },
    info: { bg: "#1a1a2e", border: "#2d2d5a", icon: "#818cf8", text: "#a5b4fc" },
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
        width: "calc(100vw - 48px)",
      }}
    >
      {toasts.map((toast) => {
        const c = colors[toast.type] ?? colors.info;
        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.text,
              fontSize: "14px",
              lineHeight: "1.5",
              animation: "snapToastIn 0.25s ease",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          >
            <span style={{ color: c.icon, flexShrink: 0, paddingTop: "1px" }}>
              {icons[toast.type]}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: c.icon,
                cursor: "pointer",
                flexShrink: 0,
                paddingTop: "1px",
                opacity: 0.7,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes snapToastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
