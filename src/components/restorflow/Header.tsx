import { HardHat, Home, LayoutList, RotateCcw, Waves, Workflow } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Persona, type View } from "@/lib/store";

export function Header() {
  const { s, set, reset } = useStore();
  const seg = (on: boolean) =>
    `btn px-3 py-1.5 text-xs ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`;
  return (
    <header className="no-print sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded bg-primary text-primary-foreground"><Waves className="size-4" /></div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">RestorFlow <span className="text-muted-foreground">//</span></div>
            <div className="eyebrow">Field Scoping & Client Portal</div>
          </div>
        </div>
        {s.persona === "tech" && (
          <nav className="ml-2 flex gap-1">
            {([["workspace", "Active Incident Workspace", Workflow], ["list", "Incident List", LayoutList]] as const).map(([v, l, I]) => (
              <button key={v} onClick={() => set((x) => ({ ...x, view: v as View }))}
                className={`btn px-2.5 py-1.5 text-xs ${s.view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <I className="size-3.5" />{l}
              </button>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-md border bg-card p-0.5" role="group" aria-label="Persona">
            {([["tech", "Technician Mode (Sean)", HardHat], ["client", "Client Mode (Homeowner)", Home]] as const).map(([p, l, I]) => (
              <button key={p} className={seg(s.persona === p)} onClick={() => set((x) => ({ ...x, persona: p as Persona }))}>
                <I className="size-3.5" /><span className="hidden sm:inline">{l}</span>
              </button>
            ))}
          </div>
          <button className="btn-ghost text-xs" onClick={() => { reset(); toast.success("Demo reset: 142 Elmwood Ave — Burst Pipe"); }}>
            <RotateCcw className="size-3.5" /> Reset Demo
          </button>
        </div>
      </div>
    </header>
  );
}
