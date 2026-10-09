// Pure restoration domain math (IICRC S500-style). Keep UI-free so it stays testable.

export type WaterClass = 1 | 2 | 3 | 4;

export const CLASS_FACTOR: Record<WaterClass, number> = { 1: 100, 2: 40, 3: 30, 4: 30 };
export const SF_PER_AIR_MOVER = 60; // within the 50–70 SF rule
export const LGR_UNIT_PINTS = 120;
export const DRYING_DAYS = 3;
export const TAX_RATE = 0.06625; // NJ sales tax

export interface Chamber {
  id: string;
  name: string;
  length: number;
  width: number;
  ceiling: number;
  waterClass: WaterClass;
  affectedWalls: number;
  floodCutLf: number;
  tideMarkIn: number;
  materials: string[];
  dehuOverride: number | null;
  airMoverOverride: number | null;
}

export const floorSf = (c: Pick<Chamber, "length" | "width">) => c.length * c.width;
export const volumeCf = (c: Pick<Chamber, "length" | "width" | "ceiling">) =>
  c.length * c.width * c.ceiling;
export const dehuPints = (c: Chamber) => volumeCf(c) / CLASS_FACTOR[c.waterClass];
export const recommendedDehus = (c: Chamber) =>
  volumeCf(c) > 0 ? Math.ceil(dehuPints(c) / LGR_UNIT_PINTS) : 0;
export const recommendedAirMovers = (c: Chamber) =>
  c.affectedWalls + Math.ceil(floorSf(c) / SF_PER_AIR_MOVER);
export const dehuCount = (c: Chamber) => c.dehuOverride ?? recommendedDehus(c);
export const airMoverCount = (c: Chamber) => c.airMoverOverride ?? recommendedAirMovers(c);

export type LineCategory = "mitigation" | "demolition" | "equipment" | "labor";
export interface LineItem {
  id: string;
  room: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  total: number;
  category: LineCategory;
  why: string;
}

const line = (
  room: string, id: string, description: string, qty: number, unit: string,
  rate: number, category: LineCategory, why: string,
): LineItem => ({ id, room, description, qty, unit, rate, total: round2(qty * rate), category, why });

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function buildLineItems(chambers: Chamber[], days = DRYING_DAYS): LineItem[] {
  const items: LineItem[] = [];
  for (const c of chambers) {
    const sf = floorSf(c);
    const lf = c.floodCutLf;
    const d = dehuCount(c);
    const a = airMoverCount(c);
    items.push(
      line(c.name, `${c.id}-ext`, "Hard Surface Water Extraction", sf, "SF", 0.75, "mitigation",
        "Removes standing water fast — every hour of standing water raises the risk of structural damage and mold."),
      line(c.name, `${c.id}-cut`, "2-Foot Drywall & Insulation Flood Cut", lf, "LF", 11.5, "demolition",
        "Prevents hidden toxic mold growth behind wet drywall. Wet insulation can't dry in place."),
      line(c.name, `${c.id}-base`, "Baseboard Removal & Bagging", lf, "LF", 2.2, "demolition",
        "Baseboards trap moisture against the wall. Removing them lets air reach the wall cavity."),
      line(c.name, `${c.id}-anti`, "Antimicrobial Surface Treatment", sf, "SF", 0.55, "mitigation",
        "Kills bacteria and mold spores carried in by the water, protecting your family's health."),
      line(c.name, `${c.id}-dehu`, `LGR Dehumidifier Daily Rental (${d} × ${days} days)`, d * days, "DAY", 145, "equipment",
        "Pulls moisture out of the air so materials can dry to a safe, measured standard."),
      line(c.name, `${c.id}-am`, `Axial Air Mover Daily Rental (${a} × ${days} days)`, a * days, "DAY", 35, "equipment",
        "Moves air across wet surfaces to speed evaporation — sized by wall count and floor area."),
    );
  }
  if (chambers.length > 0) {
    items.push(line("All Areas", "labor", "Equipment Setup & Decon Labor", 4, "HR", 95, "labor",
      "Certified technicians place, monitor, and decontaminate drying equipment."));
  }
  return items;
}

export function summarize(items: LineItem[]) {
  const by = (cat: LineCategory) => round2(items.filter((i) => i.category === cat).reduce((s, i) => s + i.total, 0));
  const subtotal = round2(items.reduce((s, i) => s + i.total, 0));
  const tax = round2(subtotal * TAX_RATE);
  return {
    mitigation: by("mitigation"),
    equipment: by("equipment"),
    demolition: round2(by("demolition") + by("labor")),
    subtotal,
    tax,
    total: round2(subtotal + tax),
  };
}

// Legal sign-off validity
export interface SignoffInput {
  ewaAgreed: boolean;
  dopAgreed: boolean;
  signature: string | null;
  signedAt?: string | null;
  ip?: string | null;
  carrier: string;
  claimNumber: string;
}
export function signoffBlockers(s: SignoffInput): string[] {
  const b: string[] = [];
  const signature = typeof s.signature === "string" ? s.signature.trim() : "";
  const signedAt = typeof s.signedAt === "string" ? s.signedAt.trim() : "";
  const ip = typeof s.ip === "string" ? s.ip.trim() : "";

  if (!s.ewaAgreed) b.push("Review and accept the Emergency Work Authorization (EWA)");
  if (!s.dopAgreed) b.push("Assign Direction to Pay (DOP) to the carrier");
  if (!signature) b.push("Draw your signature");
  if (!signedAt) b.push("Add the EWA timestamp");
  if (!ip) b.push("Add the client IP reference");
  if (!s.carrier.trim()) b.push("Enter the insurance carrier name");
  if (!s.claimNumber.trim()) b.push("Enter the claim number");
  return b;
}

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
