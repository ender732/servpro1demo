import { buildLineItems, summarize, usd } from "@/lib/restoration";
import { useStore } from "@/lib/store";

export function PrintEstimate() {
  const { s } = useStore();
  const items = buildLineItems(s.chambers);
  const sum = summarize(items);
  const i = s.incident;
  return (
    <div className="print-only p-8 text-sm">
      <h1 className="text-2xl font-bold">Official Estimate — RestorFlow / Servpro</h1>
      <p>{i.address} · {i.propertyType}</p>
      <p>Owner: {i.owner} · Carrier: {i.carrier} · Claim #{i.claimNumber} · Adjuster: {i.adjuster} {i.adjusterPhone}</p>
      <p>Loss: {i.incidentType} · {i.category} · IICRC S500 compliant scope</p>
      <table className="mt-4 w-full border-collapse">
        <thead><tr className="border-b-2"><th className="text-left">Room / Item</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Total</th></tr></thead>
        <tbody>{items.map((l) => (
          <tr key={l.id} className="border-b"><td>{l.room} — {l.description}</td><td className="text-right">{l.qty} {l.unit}</td><td className="text-right">{usd(l.rate)}</td><td className="text-right">{usd(l.total)}</td></tr>
        ))}</tbody>
      </table>
      <p className="mt-4 text-right">Subtotal {usd(sum.subtotal)} · Tax {usd(sum.tax)} · <b>Total {usd(sum.total)}</b></p>
      {s.signoff.signedAt && (
        <div className="mt-6">
          <p>EWA & DOP signed {s.signoff.signedAt} · IP ref {s.signoff.ip}. Carrier {i.carrier} directed to pay Servpro under claim {i.claimNumber}.</p>
          {s.signoff.signature && <img src={s.signoff.signature} alt="Signature" className="mt-2 h-20" />}
        </div>
      )}
    </div>
  );
}
