import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Download, Eraser, HelpCircle, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { buildLineItems, signoffBlockers, summarize, usd } from "@/lib/restoration";
import { useStore, type Status } from "@/lib/store";
import { Thread } from "./TechWorkspace";

const STAGES = ["Inspection Complete", "Quote Review & Authorization", "Mitigation Active", "Drying Complete"];
const stageIdx = (s: Status) => (s === "Inspection Complete" ? 0 : s === "Quote Delivered" ? 1 : s === "Legally Approved" ? 2 : 3);

export function ClientPortal() {
  const { s } = useStore();
  const items = buildLineItems(s.chambers);
  const sum = summarize(items);
  const idx = stageIdx(s.status);
  const rooms = [...new Set(items.map((i) => i.room))];
  const street = s.incident.address.split(",")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <div>
        <div className="eyebrow">Hi {s.incident.owner.split(" ")[0]} — we're on it</div>
        <h1 className="text-2xl font-semibold">Incident Recovery Hub: {street}</h1>
        {s.status === "Legally Approved" && <span className="chip-green mt-2">Crew Dispatched for Active Mitigation</span>}
      </div>
      <ol className="grid grid-cols-4 gap-2">
        {STAGES.map((st, i) => (
          <li key={st} className="text-center">
            <div className={`h-1.5 rounded ${i < idx ? "bg-success" : i === idx ? "bg-primary" : "bg-muted"}`} />
            <div className={`mt-2 text-[11px] leading-tight sm:text-xs ${i === idx ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{st}</div>
          </li>
        ))}
      </ol>

      {items.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-muted-foreground">Sean is still scoping your property. Your estimate will appear here.</div>
      ) : (
        <section className="panel">
          <div className="panel-head">
            <h2 className="font-semibold">Your estimate</h2>
            <span className="num text-lg font-semibold text-primary">{usd(sum.total)}</span>
          </div>
          <div className="divide-y">
            {rooms.map((r) => <RoomGroup key={r} room={r} items={items.filter((i) => i.room === r)} />)}
          </div>
          <div className="space-y-1 border-t p-4 text-sm">
            <Row k="Subtotal" v={usd(sum.subtotal)} /><Row k="Tax" v={usd(sum.tax)} />
            <div className="flex justify-between font-semibold"><span>Total</span><span className="num">{usd(sum.total)}</span></div>
            <p className="pt-2 text-xs text-muted-foreground">Billed to {s.incident.carrier}, claim <span className="num">{s.incident.claimNumber}</span>, once you assign Direction to Pay.</p>
          </div>
        </section>
      )}

      <Thread title="Questions for Sean" as="Homeowner" />
      {items.length > 0 && <Signoff />}
      {items.length > 0 && (
        <button className="btn-ghost w-full" onClick={() => window.print()}><Download className="size-4" />Download Official PDF Estimate</button>
      )}
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between text-muted-foreground"><span>{k}</span><span className="num">{v}</span></div>
);

function RoomGroup({ room, items }: { room: string; items: ReturnType<typeof buildLineItems> }) {
  const [open, setOpen] = useState(false);
  const total = items.reduce((a, i) => a + i.total, 0);
  return (
    <div>
      <button className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(!open)}>
        <span className="font-medium">{room}</span>
        <span className="flex items-center gap-2"><span className="num text-sm">{usd(total)}</span><ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} /></span>
      </button>
      {open && (
        <ul className="space-y-3 px-4 pb-4">
          {items.map((i) => (
            <li key={i.id} className="rounded-md bg-surface p-3 text-sm">
              <div className="flex justify-between gap-3"><span>{i.description}</span><span className="num">{usd(i.total)}</span></div>
              <div className="mt-1 flex gap-1.5 text-xs text-muted-foreground"><HelpCircle className="mt-0.5 size-3 shrink-0 text-primary" /><span><b>Why?</b> {i.why}</span></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Signoff() {
  const { s, set } = useStore();
  const so = s.signoff;
  const locked = !!so.signedAt;
  const blockers = signoffBlockers({ ewaAgreed: so.ewa, dopAgreed: so.dop, signature: so.signature, carrier: s.incident.carrier, claimNumber: s.incident.claimNumber });
  const upd = (p: Partial<typeof so>) => set((x) => ({ ...x, signoff: { ...x.signoff, ...p } }));

  const submit = () => {
    const at = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "medium" });
    const ip = "73.214.18.92 (demo)";
    const finalBlockers = signoffBlockers({ ewaAgreed: so.ewa, dopAgreed: so.dop, signature: so.signature, signedAt: at, ip, carrier: s.incident.carrier, claimNumber: s.incident.claimNumber });
    if (finalBlockers.length) return;
    set((x) => ({ ...x, status: "Legally Approved",
      signoff: { ...x.signoff, signedAt: at, ip },
      activity: [{ at, text: `${x.incident.owner} signed EWA + DOP. Crew dispatched.`, kind: "system" }, ...x.activity] }));
    toast.success("Authorized — crew dispatched for active mitigation");
  };

  return (
    <section className="panel">
      <div className="panel-head"><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-success" />Approve & sign</h2>
        {locked && <span className="chip-green"><Lock className="size-3" />Legally Approved</span>}</div>
      <div className="space-y-3 p-4 text-sm">
        <Check2 checked={so.ewa} disabled={locked} onChange={(v) => upd({ ewa: v })}>
          I agree to the <b>Emergency Work Authorization (EWA)</b> and authorize mitigation work at {s.incident.address}.
        </Check2>
        <Check2 checked={so.dop} disabled={locked} onChange={(v) => upd({ dop: v })}>
          I assign <b>Direction to Pay (DOP)</b>: I direct <b>{s.incident.carrier}</b> to pay Servpro directly under claim <span className="num">{s.incident.claimNumber}</span>.
        </Check2>
        <SignaturePad value={so.signature} locked={locked} onChange={(v) => upd({ signature: v })} />
        {locked ? (
          <div className="rounded-md border border-success/40 bg-success/10 p-3 text-xs">
            Signed {so.signedAt} · IP ref <span className="num">{so.ip}</span>
          </div>
        ) : (
          <>
            {blockers.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                <div className="mb-2 font-medium">Required before approval:</div>
                <ul className="list-disc space-y-1 pl-4">
                  {blockers.map((msg) => <li key={msg}>{msg}</li>)}
                </ul>
              </div>
            )}
            <button className="btn-success w-full py-3" disabled={blockers.length > 0} onClick={submit}><Check className="size-4" />Authorize & Submit</button>
          </>
        )}
      </div>
    </section>
  );
}

function Check2({ checked, disabled, onChange, children }: { checked: boolean; disabled: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className={`flex gap-3 rounded-md border p-3 ${checked ? "border-success/50 bg-success/5" : ""}`}>
      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--success)]" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function SignaturePad({ value, locked, onChange }: { value: string | null; locked: boolean; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    const ctx = c.getContext("2d")!;
    ctx.scale(2, 2); ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(c).color;
    if (value) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height); img.src = value; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const down = (e: React.PointerEvent) => { if (locked) return; drawing.current = true; ref.current!.setPointerCapture(e.pointerId);
    const ctx = ref.current!.getContext("2d")!; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e: React.PointerEvent) => { if (!drawing.current) return; const ctx = ref.current!.getContext("2d")!; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); };
  const up = () => { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL()); };
  const clear = () => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); onChange(null); };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between"><span className="label">Signature</span>
        {!locked && <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={clear}><Eraser className="size-3" />Clear</button>}</div>
      <canvas ref={ref} aria-label="Signature pad" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        className={`h-36 w-full touch-none rounded-md border-2 border-dashed bg-background text-foreground ${locked ? "opacity-80" : "cursor-crosshair"}`} />
    </div>
  );
}
