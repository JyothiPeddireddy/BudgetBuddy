import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Shared month picker panel.
 *
 * Mobile:
 * - Centered popup
 * - Dark backdrop
 * - Cannot go outside the screen
 *
 * Desktop:
 * - Normal dropdown
 * - Aligned to the right edge of the button
 */
export function PickerPanel({ onClose, children }) {
  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30 cursor-default sm:hidden"
      />

      {/* Picker panel */}
      <div
        className="
          fixed left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          z-50
          w-[min(18rem,calc(100vw-2rem))]
          max-h-[85dvh]
          overflow-y-auto
          bg-white
          border border-slate-200
          rounded-2xl
          shadow-xl
          p-4

          sm:absolute
          sm:left-auto
          sm:right-0
          sm:top-auto
          sm:mt-2
          sm:translate-x-0
          sm:translate-y-0
          sm:w-64
          sm:rounded-xl
          sm:shadow-lg
          sm:p-3
        "
      >
        {children}
      </div>
    </>
  );
}

/**
 * Props:
 *
 * selected:
 *   { year, month } or null
 *
 * onSelect:
 *   called with { year, month } or null
 *
 * allowAllTime:
 *   show "All time" option
 *
 * format:
 *   "short" => Sep 2026
 *   "long"  => September 2026
 */
export default function MonthPicker({
  selected,
  onSelect,
  allowAllTime = true,
  format = "short",
}) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(
    selected?.year ?? new Date().getFullYear()
  );

  const ref = useRef(null);

  /* Close when clicking/tapping outside */
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  /* Keep year in sync with selected month */
  useEffect(() => {
    if (selected?.year) {
      setViewYear(selected.year);
    }
  }, [selected?.year]);

  const label = selected
    ? new Date(
        selected.year,
        selected.month - 1
      ).toLocaleDateString("en-US", {
        month: format === "long" ? "long" : "short",
        year: "numeric",
      })
    : "All time";

  const now = new Date();

  const isFutureMonth = (month) =>
    viewYear === now.getFullYear() &&
    month > now.getMonth() + 1;

  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div
      className="relative self-start sm:self-auto"
      ref={ref}
    >
      {/* =====================================================
          PICKER BUTTON
          Matches the original Dashboard picker
      ===================================================== */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="
          flex items-center gap-2
          px-3 py-2.5 sm:py-2
          border border-slate-200
          rounded-lg
          text-xs
          font-semibold
          text-ink
          bg-white
          hover:border-emerald
          transition-colors
        "
      >
        {label}

        <ChevronDown
          size={14}
          className="text-slate"
        />
      </button>

      {/* =====================================================
          PICKER PANEL
      ===================================================== */}
      {open && (
        <PickerPanel onClose={() => setOpen(false)}>
          {/* ALL TIME */}
          {allowAllTime && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={`
                w-full
                text-left
                px-3 py-2.5
                rounded-lg
                text-xs
                font-semibold
                mb-2
                ${
                  !selected
                    ? "bg-emerald text-white"
                    : "text-ink hover:bg-slate-50"
                }
              `}
            >
              All time
            </button>
          )}

          {/* YEAR NAVIGATION */}
          <div className="flex items-center justify-between px-1 mb-2">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() =>
                setViewYear((y) => y - 1)
              }
              className="p-2 hover:bg-slate-50 rounded"
            >
              <ChevronLeft
                size={15}
                className="text-slate"
              />
            </button>

            <span className="text-xs font-semibold text-ink">
              {viewYear}
            </span>

            <button
              type="button"
              aria-label="Next year"
              onClick={() =>
                setViewYear((y) => y + 1)
              }
              disabled={isFutureYear}
              className="p-2 hover:bg-slate-50 rounded disabled:opacity-30"
            >
              <ChevronRight
                size={15}
                className="text-slate"
              />
            </button>
          </div>

          {/* MONTHS */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => {
              const monthNum = index + 1;

              const isSelected =
                selected?.year === viewYear &&
                selected?.month === monthNum;

              const disabled =
                isFutureMonth(monthNum);

              return (
                <button
                  key={month}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect({
                      year: viewYear,
                      month: monthNum,
                    });

                    setOpen(false);
                  }}
                  className={`
                    px-2 py-2.5
                    rounded-lg
                    text-xs
                    font-semibold
                    transition-colors
                    ${
                      isSelected
                        ? "bg-emerald text-white"
                        : disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-ink hover:bg-slate-50"
                    }
                  `}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </PickerPanel>
      )}
    </div>
  );
}