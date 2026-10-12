import { useStore } from "../context/StoreContext";
import { IconCheck, IconClose, IconCart } from "./Icons";

export default function Toasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.variant}`}>
          <span className="toast__icon">
            {t.variant === "success" ? <IconCheck size={18} /> : t.variant === "info" ? <IconCart size={18} /> : <IconClose size={18} />}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
