import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-clinic-green">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-clinic-orange">{error}</span> : null}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring w-full rounded-2xl border border-clinic-green/15 bg-white px-4 py-3 text-base text-clinic-ink placeholder:text-clinic-green/35",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring min-h-36 w-full rounded-2xl border border-clinic-green/15 bg-white px-4 py-3 text-base text-clinic-ink placeholder:text-clinic-green/35",
        className
      )}
      {...props}
    />
  );
}
