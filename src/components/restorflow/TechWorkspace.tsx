import { useRef, useState } from "react";
import {
  Activity, Calculator, Camera, ClipboardList, Droplets, Fan, FileText, Loader2, MessageSquare,
  Plus, ScanLine, Send, ShieldCheck, Trash2, Upload, Wind,
} from "lucide-react";
import { toast } from "sonner";
import basement from "@/assets/sample-basement.jpg";
import ceiling from "@/assets/sample-ceiling.jpg";
import kitchen from "@/assets/sample-kitchen.jpg";
import {
  airMoverCount, buildLineItems, dehuCount, dehuPints, floorSf, recommendedAirMovers,
  recommendedDehus, summarize, usd, volumeCf, type Chamber, type WaterClass,
} from "@/lib/restoration";
import { nowLabel, useStore } from "@/lib/store";
import { Field, Stat, Stepper } from "./shared";

const STEPS = [
  { id: "A", label: "Intake", icon: ClipboardList },
  { id: "B", label: "AI Room Scoper", icon: ScanLine },
  { id: "C", label: "Quote", icon: Calculator },
  { id: "D", label: "Moisture Log", icon: Activity },
] as const;

export function TechWorkspace() {
  const [step, setStep] = useState<(typeof STEPS)[number]["id"]>("A");
  const { s } = useStore();
  const unread = s.messages.filter((m) => m.author === "Homeowner").length;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <IncidentBanner />
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border bg-card p-1 md:grid-cols-4">
        {STEPS.map((t) => (
          <button key={t.id} onClick={() => setStep(t.id)}
            className={`btn justify-start ${step === t.id ? "bg-surface text-foreground ring-1 ring-primary/50" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="num text-xs text-primary">{t.id}</span><t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          {step === "A" && <Intake />}
          {step === "B" && <Scoper />}
          {step === "C" && <Quote />}
          {step === "D" && <MoistureLog />}
        </div>
        <aside className="space-y-5">
          <Thread title={`Client Messages${unread ? ` (${unread})` : ""}`} as="Sean" />
        </aside>
      </div>
    </div>
  );
}

function IncidentBanner() {
  const { s } = useStore();
  const i = s.incident;
  const statusTone = s.status === "Legally Approved" ? "chip-green" : s.status === "Quote Delivered" ? "chip-amber" : "chip-slate";
  return (
    <div className="panel flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="eyebrow">Active Incident · Burst Pipe</div>
        <h1 className="truncate text-xl font-semibold">{i.address}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="chip-slate">{i.carrier} · {i.claimNumber}</span>
        <span className="chip-amber"><Droplets className="size-3" />{i.category}</span>
        <span className={i.occupancy === "Operational" ? "chip-green" : "chip-red"}>{i.occupancy}</span>
        <span className="chip-green"><ShieldCheck className="size-3" />IICRC S500</span>
        <span className={statusTone}>{s.status === "Legally Approved" ? "Crew Dispatched" : s.status}</span>
      </div>
    </div>
  );
}

function Intake() {
  const { s, set } = useStore();
  const i = s.incident;
  const up = (k: keyof typeof i, v: string | number) => set((x) => ({ ...x, incident: { ...x.incident, [k]: v } }));
  const sel = (k: keyof typeof i, opts: string[]) => (
    <select className="field" value={String(i[k])} onChange={(e) => up(k, e.target.value)}>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="panel-head"><h2 className="font-semibold">Property</h2><span className="eyebrow">Step A</span></div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <Field label="Property address"><input className="field" value={i.address} onChange={(e) => up("address", e.target.value)} /></Field>
          <Field label="Property type">{sel("propertyType", ["Residential Single-Family", "Multi-Family", "Commercial Retail", "Warehouse"])}</Field>
          <Field label="Property owner"><input className="field" value={i.owner} onChange={(e) => up("owner", e.target.value)} /></Field>
          <Field label="Occupancy status">
            <div className="flex gap-2">
              {(["Operational", "Displaced"] as const).map((o) => (
                <button key={o} type="button" onClick={() => up("occupancy", o)}
                  className={`btn flex-1 border ${i.occupancy === o ? (o === "Operational" ? "border-success bg-success/15 text-success" : "border-destructive bg-destructive/15 text-destructive") : "text-muted-foreground"}`}>{o}</button>
              ))}
            </div>
          </Field>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head"><h2 className="font-semibold">Insurance</h2></div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <Field label="Carrier">{sel("carrier", ["State Farm", "Chubb", "Allstate", "Liberty Mutual", "Travelers"])}</Field>
          <Field label="Claim #"><input className="field num" value={i.claimNumber} onChange={(e) => up("claimNumber", e.target.value)} /></Field>
          <Field label="Adjuster name"><input className="field" value={i.adjuster} onChange={(e) => up("adjuster", e.target.value)} /></Field>
          <Field label="Adjuster phone"><input className="field num" value={i.adjusterPhone} onChange={(e) => up("adjusterPhone", e.target.value)} /></Field>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head"><h2 className="font-semibold">Loss details</h2></div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <Field label="Incident type">{sel("incidentType", ["Water", "Fire", "Mold", "Biohazard"])}</Field>
          <Field label="Water category">{sel("category", ["Cat 1 Clean", "Cat 2 Gray", "Cat 3 Black"])}</Field>
          <Field label="Hours since discovery"><Stepper value={i.elapsedHours} onChange={(n) => up("elapsedHours", n)} suffix="hr" /></Field>
        </div>
      </section>
    </div>
  );
}

const SAMPLES = [
  { key: "basement", label: "Basement Flooding", src: basement,
    result: { name: "Finished Basement / Family Room", length: 22, width: 18, ceiling: 8, waterClass: 2 as WaterClass, affectedWalls: 4, floodCutLf: 72, tideMarkIn: 14, materials: ['1/2" Drywall', "Luxury Vinyl Plank (LVP)", "Wood Baseboard"] } },
  { key: "ceiling", label: "Living Room Ceiling Leak", src: ceiling,
    result: { name: "Living Room", length: 16, width: 14, ceiling: 9, waterClass: 2 as WaterClass, affectedWalls: 2, floodCutLf: 30, tideMarkIn: 0, materials: ['1/2" Ceiling Drywall', "Oak Hardwood", "Painted Baseboard"] } },
  { key: "kitchen", label: "Commercial Kitchen", src: kitchen,
    result: { name: "Commercial Kitchen / Prep Line", length: 30, width: 20, ceiling: 10, waterClass: 3 as WaterClass, affectedWalls: 3, floodCutLf: 60, tideMarkIn: 6, materials: ["Quarry Tile", "FRP Wall Panel", "Cove Base"] } },
];

const BOXES = [
  { l: "8%", t: "55%", w: "40%", h: "35%", tag: "LVP FLOOR · WET" },
  { l: "62%", t: "30%", w: "30%", h: "28%", tag: "DRYWALL · TIDE 14\"" },
  { l: "40%", t: "12%", w: "22%", h: "14%", tag: "CEILING 8'0\"" },
];

function Scoper() {
  const { s, set } = useStore();
  const [img, setImg] = useState<{ src: string; key: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setImg({ src: URL.createObjectURL(f), key: "basement" });
  };

  const analyze = () => {
    if (!img) return;
    setScanning(true);
    setTimeout(() => {
      const sample = SAMPLES.find((x) => x.key === img.key) ?? SAMPLES[0];
      set((x) => {
        const id = `ch${x.seq}`;
        const ch: Chamber = { id, ...sample.result, materials: [...sample.result.materials], dehuOverride: null, airMoverOverride: null };
        return { ...x, seq: x.seq + 1, chambers: [...x.chambers, ch],
          activity: [{ at: nowLabel(), text: `Vision Agent scoped "${ch.name}" — ${floorSf(ch)} SF / ${volumeCf(ch).toLocaleString()} CF.`, kind: "system" as const }, ...x.activity] };
      });
      setScanning(false);
      toast.success("Chamber populated by Vision Agent");
    }, 1500);
  };

  const addBlank = () => set((x) => ({ ...x, seq: x.seq + 1, chambers: [...x.chambers, {
    id: `ch${x.seq}`, name: `Chamber ${x.chambers.length + 1}`, length: 12, width: 10, ceiling: 8, waterClass: 2,
    affectedWalls: 2, floodCutLf: 20, tideMarkIn: 0, materials: [], dehuOverride: null, airMoverOverride: null }] }));

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="panel-head">
          <h2 className="flex items-center gap-2 font-semibold"><Camera className="size-4 text-primary" />Room Chamber Builder · Vision HUD</h2>
          <span className="eyebrow">Step B</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr]">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
            className={`relative aspect-[4/3] overflow-hidden rounded-md border-2 border-dashed ${drag ? "border-primary" : "border-input"} bg-surface`}>
            {img ? (
              <>
                <img src={img.src} alt="Room to scan" className="h-full w-full object-cover" width={1024} height={768} />
                {scanning && (
                  <div className="absolute inset-0 bg-background/30">
                    <div className="scan-line" />
                    {BOXES.map((b) => (
                      <div key={b.tag} className="scan-box" style={{ left: b.l, top: b.t, width: b.w, height: b.h }}>
                        <span className="absolute -top-5 left-0 bg-scan px-1 font-mono text-[10px] text-background">{b.tag}</span>
                      </div>
                    ))}
                    <div className="absolute bottom-2 left-2 font-mono text-[10px] text-scan">VISION-AGENT v2 · DEPTH EST · MATERIAL CLS · MOISTURE IR…</div>
                  </div>
                )}
              </>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Upload className="size-8" /><span className="text-sm">Drop a room photo or click to upload</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="eyebrow">Sample photos</div>
            {SAMPLES.map((p) => (
              <button key={p.key} onClick={() => setImg({ src: p.src, key: p.key })}
                className={`flex items-center gap-3 rounded-md border p-2 text-left text-sm hover:bg-accent ${img?.key === p.key && img.src === p.src ? "border-primary" : ""}`}>
                <img src={p.src} alt="" loading="lazy" width={1024} height={768} className="h-10 w-14 rounded object-cover" />{p.label}
              </button>
            ))}
            <button className="btn-primary mt-auto" disabled={!img || scanning} onClick={analyze}>
              {scanning ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
              {scanning ? "Scanning…" : "Analyze Photo with Vision Agent"}
            </button>
          </div>
        </div>
      </section>

      {s.chambers.map((c) => <ChamberCard key={c.id} c={c} />)}
      <button className="btn-ghost w-full border-dashed" onClick={addBlank}><Plus className="size-4" />Add Chamber</button>
    </div>
  );
}

function ChamberCard({ c }: { c: Chamber }) {
  const { set } = useStore();
  const up = (patch: Partial<Chamber>) => set((x) => ({ ...x, chambers: x.chambers.map((y) => (y.id === c.id ? { ...y, ...patch } : y)) }));
  return (
    <section className="panel">
      <div className="panel-head">
        <input className="min-w-0 flex-1 bg-transparent font-semibold outline-none" value={c.name} onChange={(e) => up({ name: e.target.value })} />
        <button aria-label="Remove chamber" className="text-muted-foreground hover:text-destructive"
          onClick={() => set((x) => ({ ...x, chambers: x.chambers.filter((y) => y.id !== c.id) }))}><Trash2 className="size-4" /></button>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Length (ft)"><Stepper value={c.length} onChange={(n) => up({ length: n })} /></Field>
          <Field label="Width (ft)"><Stepper value={c.width} onChange={(n) => up({ width: n })} /></Field>
          <Field label="Ceiling (ft)"><Stepper value={c.ceiling} onChange={(n) => up({ ceiling: n })} /></Field>
          <Field label="Water class">
            <select className="field" value={c.waterClass} onChange={(e) => up({ waterClass: Number(e.target.value) as WaterClass })}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Class {n}</option>)}
            </select>
          </Field>
          <Field label="Affected walls"><Stepper value={c.affectedWalls} onChange={(n) => up({ affectedWalls: n })} /></Field>
          <Field label="Flood cut (LF)"><Stepper value={c.floodCutLf} onChange={(n) => up({ floodCutLf: n })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Floor" value={`${floorSf(c).toLocaleString()} SF`} />
          <Stat label="Volume" value={`${volumeCf(c).toLocaleString()} CF`} />
          <Stat label="LGR load" value={`${dehuPints(c).toFixed(1)} PPD`} />
          <Stat label="Tide mark" value={c.tideMarkIn ? `${c.tideMarkIn}"` : "—"} tone="amber" />
        </div>
        {c.materials.length > 0 && (
          <div className="flex flex-wrap gap-2">{c.materials.map((m) => <span key={m} className="chip-slate">{m}</span>)}</div>
        )}
        {c.tideMarkIn > 0 && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
            Tide mark detected at <b className="num">{c.tideMarkIn}"</b> → recommend <b>2-Foot Flood Cut</b> along <b className="num">{c.floodCutLf} LF</b>.
          </div>
        )}
        <div className="rounded-md border bg-surface p-3">
          <div className="eyebrow mb-3">Psychrometric engine · IICRC S500</div>
          <div className="grid gap-3 md:grid-cols-2">
            <EquipRow icon={Wind} label="LGR 120-Pint Dehumidifier" rec={recommendedDehus(c)} value={dehuCount(c)}
              formula={`${volumeCf(c).toLocaleString()} CF ÷ factor = ${dehuPints(c).toFixed(1)} PPD`}
              onChange={(n) => up({ dehuOverride: n })} />
            <EquipRow icon={Fan} label="Axial Air Mover" rec={recommendedAirMovers(c)} value={airMoverCount(c)}
              formula={`${c.affectedWalls} walls + ⌈${floorSf(c)} SF ÷ 60⌉`}
              onChange={(n) => up({ airMoverOverride: n })} />
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipRow({ icon: I, label, rec, value, formula, onChange }: {
  icon: typeof Fan; label: string; rec: number; value: number; formula: string; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <I className="size-5 shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="num truncate text-[11px] text-muted-foreground">{formula} · rec {rec}</div>
      </div>
      <div className="w-28"><Stepper value={value} onChange={onChange} /></div>
    </div>
  );
}

function Quote() {
  const { s, set } = useStore();
  const items = buildLineItems(s.chambers);
  const sum = summarize(items);
  const send = () => {
    set((x) => ({ ...x, status: x.status === "Legally Approved" ? x.status : "Quote Delivered",
      activity: [{ at: nowLabel(), text: `Quote ${usd(sum.total)} sent to ${x.incident.owner}.`, kind: "system" as const }, ...x.activity] }));
    toast.success("Quote delivered to client", { description: "restorflow.app/portal?token=demo-8821" });
  };
  if (!items.length) return <Empty text="Scope at least one chamber in Step B to build the estimate." />;
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
      <section className="panel overflow-x-auto">
        <div className="panel-head"><h2 className="font-semibold">Line-item estimate</h2><span className="eyebrow">Step C</span></div>
        <table className="w-full text-sm">
          <thead className="eyebrow text-left"><tr className="border-b">
            <th className="px-4 py-2">Item</th><th className="px-2 py-2 text-right">Qty</th><th className="px-2 py-2 text-right">Rate</th><th className="px-4 py-2 text-right">Total</th>
          </tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="px-4 py-2"><div>{i.description}</div><div className="text-xs text-muted-foreground">{i.room}</div></td>
                <td className="num px-2 py-2 text-right">{i.qty.toLocaleString()} {i.unit}</td>
                <td className="num px-2 py-2 text-right">{usd(i.rate)}</td>
                <td className="num px-4 py-2 text-right">{usd(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel h-fit p-4">
        <div className="eyebrow mb-3">Financial summary</div>
        <dl className="space-y-2 text-sm">
          {([["Mitigation", sum.mitigation], ["Equipment Charges", sum.equipment], ["Demolition & Labor", sum.demolition], ["Subtotal", sum.subtotal], ["Tax (NJ 6.625%)", sum.tax]] as const).map(([k, v]) => (
            <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="num">{usd(v)}</dd></div>
          ))}
          <div className="flex justify-between border-t pt-2 text-lg font-semibold"><dt>Grand Total</dt><dd className="num text-primary">{usd(sum.total)}</dd></div>
        </dl>
        <button className="btn-primary mt-4 w-full" onClick={send}><Send className="size-4" />Send Quote to Client</button>
        <button className="btn-ghost mt-2 w-full" onClick={() => window.print()}><FileText className="size-4" />Print Estimate</button>
      </section>
    </div>
  );
}

function MoistureLog() {
  const { s, set } = useStore();
  const [row, setRow] = useState({ temp: 75, rh: 42, gpp: 55 });
  const [note, setNote] = useState("");
  const TARGET = 55;
  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="panel-head"><h2 className="font-semibold">Psychrometric log</h2><span className="chip-green">Dry standard ≤ {TARGET} GPP</span></div>
        <table className="w-full text-sm">
          <thead className="eyebrow text-left"><tr className="border-b"><th className="px-4 py-2">Date</th><th className="px-2 py-2">Temp °F</th><th className="px-2 py-2">RH %</th><th className="px-2 py-2">GPP</th><th className="px-4 py-2">Progress</th></tr></thead>
          <tbody>
            {s.moisture.map((m, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">{m.date}</td><td className="num px-2">{m.temp}</td><td className="num px-2">{m.rh}</td><td className="num px-2">{m.gpp}</td>
                <td className="px-4"><div className="h-1.5 rounded bg-muted"><div className={`h-1.5 rounded ${m.gpp <= TARGET ? "bg-success" : "bg-primary"}`} style={{ width: `${Math.min(100, (TARGET / m.gpp) * 100)}%` }} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-end gap-3 p-4">
          <Field label="Temp °F"><div className="w-28"><Stepper value={row.temp} onChange={(n) => setRow({ ...row, temp: n })} /></div></Field>
          <Field label="RH %"><div className="w-28"><Stepper value={row.rh} onChange={(n) => setRow({ ...row, rh: n })} /></div></Field>
          <Field label="GPP"><div className="w-28"><Stepper value={row.gpp} onChange={(n) => setRow({ ...row, gpp: n })} /></div></Field>
          <button className="btn-primary" onClick={() => set((x) => ({ ...x, moisture: [...x.moisture, { date: `Day ${x.moisture.length + 1}`, ...row }],
            status: row.gpp <= TARGET && x.status === "Legally Approved" ? "Drying Complete" : x.status }))}><Plus className="size-4" />Log reading</button>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head"><h2 className="font-semibold">Activity feed</h2></div>
        <form className="flex gap-2 p-4" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return;
          set((x) => ({ ...x, activity: [{ at: nowLabel(), text: note.trim(), kind: "note" }, ...x.activity] })); setNote(""); }}>
          <input className="field" placeholder="Add a field note…" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-ghost">Add</button>
        </form>
        <ol className="space-y-3 px-4 pb-4">
          {s.activity.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.kind === "photo" ? "bg-primary" : a.kind === "system" ? "bg-success" : "bg-muted-foreground"}`} />
              <div><div>{a.text}</div><div className="num text-xs text-muted-foreground">{a.at}</div></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Thread({ title, as }: { title: string; as: "Sean" | "Homeowner" }) {
  const { s, set } = useStore();
  const [t, setT] = useState("");
  return (
    <section className="panel">
      <div className="panel-head"><h2 className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="size-4 text-primary" />{title}</h2></div>
      <div className="max-h-80 space-y-2 overflow-y-auto p-3">
        {s.messages.map((m) => (
          <div key={m.id} className={`rounded-md p-2 text-sm ${m.author === as ? "ml-6 bg-primary/15" : "mr-6 bg-surface"}`}>
            <div className="eyebrow mb-0.5">{m.author === "Sean" ? "Sean · Estimator" : s.incident.owner} · {m.at}</div>{m.text}
          </div>
        ))}
      </div>
      <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return;
        set((x) => ({ ...x, seq: x.seq + 1, messages: [...x.messages, { id: x.seq, author: as, text: t.trim(), at: nowLabel() }] })); setT(""); }}>
        <input className="field" placeholder={as === "Homeowner" ? "Ask about any line item…" : "Reply to client…"} value={t} onChange={(e) => setT(e.target.value)} />
        <button className="btn-primary" aria-label="Send"><Send className="size-4" /></button>
      </form>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="panel p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
