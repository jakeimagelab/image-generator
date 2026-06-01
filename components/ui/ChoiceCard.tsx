import { cn } from "@/lib/utils";

export function ChoiceCard({
  label,
  selected,
  onClick,
  multiple = false
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multiple?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "focus-ring min-h-16 rounded-2xl border bg-white px-4 py-4 text-left text-sm font-semibold transition",
        selected
          ? "border-clinic-orange bg-clinic-orange/5 text-clinic-green shadow-soft"
          : "border-clinic-green/12 text-clinic-ink hover:border-clinic-orange/45"
      )}
    >
      <span className="flex items-center justify-between gap-3">
        {label}
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border text-[11px]",
            selected ? "border-clinic-orange bg-clinic-orange text-white" : "border-clinic-green/20 text-transparent"
          )}
        >
          {multiple ? "✓" : ""}
        </span>
      </span>
    </button>
  );
}
