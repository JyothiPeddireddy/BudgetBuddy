import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Phone:  slides up from the bottom (bottom sheet), scrolls if the form is tall
 * Laptop: centered popup
 */
export default function Modal({ title, onClose, children, maxWidth = "max-w-md" }) {
  // Stop the page behind the popup from scrolling
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className={`bg-white shadow-xl w-full ${maxWidth} max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 sm:p-6`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 -m-1 text-slate hover:text-ink shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}