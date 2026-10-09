import { ArrowRight } from "lucide-react";
import { buildLineItems, summarize, usd } from "@/lib/restoration";
import { useStore } from "@/lib/store";

const OTHERS = [
  { addr: "88 Harbor Rd, Wayne, NJ", type: "Fire", carrier: "Chubb", claim: "CH-7781-02", status: "Drying Complete", total: 18420 },
  { addr: "Unit 4B, 210 Main St, Paterson, NJ", type: "Mold", carrier: "Allstate", claim: "AL-55120", status: "Mitigation Active", total: 6210.5 },
  { addr: "Riverdale Plaza — Suite 12", type: "Water", carrier: "Travelers", claim: "TR-90-3341", status: "Quote Delivered", total: 11980 },
];

export function IncidentList() {
  const { s, set } = useStore();
  const total = summarize(buildLineItems(s.chambers)).total;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Incident List</h1>
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="eyebrow text-left"><tr className="border-b"><th className="px-4 py-2">Property</th><th>Type</th><th>Carrier · Claim</th><th>Status</th><th className="px-4 text-right">Estimate</th></tr></thead>
          <tbody>
            <tr className="cursor-pointer border-b bg-primary/5 hover:bg-accent" onClick={() => set((x) => ({ ...x, view: "workspace" }))}>
              <td className="px-4 py-3 font-medium">{s.incident.address} <span className="chip-amber ml-2">Active</span></td>
              <td>{s.incident.incidentType}</td><td className="num">{s.incident.carrier} · {s.incident.claimNumber}</td>
              <td>{s.status}</td><td className="num px-4 text-right">{total ? usd(total) : "—"} <ArrowRight className="ml-1 inline size-3" /></td>
            </tr>
            {OTHERS.map((o) => (
              <tr key={o.claim} className="border-b last:border-0 text-muted-foreground">
                <td className="px-4 py-3">{o.addr}</td><td>{o.type}</td><td className="num">{o.carrier} · {o.claim}</td><td>{o.status}</td><td className="num px-4 text-right">{usd(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
