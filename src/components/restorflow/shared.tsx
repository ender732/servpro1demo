import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

export function Stepper({ value, onChange, min = 0, step = 1, suffix }: {
  value: number; onChange: (n: number) => void; min?: number; step?: number; suffix?: string;
}) {
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-md border border-input bg-background">
      <button type="button" aria-label="Decrease" className="px-2 text-muted-foreground hover:bg-accent h-full"
        onClick={() => onChange(Math.max(min, value - step))}><Minus className="size-3.5" /></button>
      <input className="num w-full min-w-0 bg-transparent text-center text-sm outline-none" value={value}
        onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) onChange(Math.max(min, n)); }} />
      {suffix && <span className="pr-1 text-xs text-muted-foreground">{suffix}</span>}
      <button type="button" aria-label="Increase" className="px-2 text-muted-foreground hover:bg-accent h-full"
        onClick={() => onChange(value + step)}><Plus className="size-3.5" /></button>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "amber" | "green" }) {
  return (
    <div className="rounded-md border bg-surface p-3">
      <div className="eyebrow">{label}</div>
      <div className={`num mt-1 text-xl font-semibold ${tone === "amber" ? "text-primary" : tone === "green" ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}
