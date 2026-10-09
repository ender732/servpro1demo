import { describe, expect, it } from "vitest";
import {
  buildLineItems, dehuPints, floorSf, recommendedAirMovers, recommendedDehus,
  signoffBlockers, summarize, volumeCf, type Chamber,
} from "@/lib/restoration";

const room = (o: Partial<Chamber> = {}): Chamber => ({
  id: "r", name: "Basement", length: 22, width: 18, ceiling: 8, waterClass: 2,
  affectedWalls: 4, floodCutLf: 72, tideMarkIn: 14, materials: [],
  dehuOverride: null, airMoverOverride: null, ...o,
});

describe("volumetric sizing", () => {
  it("volume = L × W × H", () => {
    expect(floorSf(room())).toBe(396);
    expect(volumeCf(room())).toBe(3168);
  });
  it("LGR pints use class factors 100/40/30/30", () => {
    expect(dehuPints(room({ waterClass: 1 }))).toBeCloseTo(31.68);
    expect(dehuPints(room({ waterClass: 2 }))).toBeCloseTo(79.2);
    expect(dehuPints(room({ waterClass: 3 }))).toBeCloseTo(105.6);
    expect(dehuPints(room({ waterClass: 4 }))).toBeCloseTo(105.6);
  });
  it("one 120-pint LGR covers the demo basement", () => {
    expect(recommendedDehus(room())).toBe(1);
  });
  it("air movers = 1 per affected wall + 1 per 60 SF wet floor", () => {
    expect(recommendedAirMovers(room())).toBe(4 + 7);
  });
});

describe("estimate", () => {
  it("flood cut line uses $11.50/LF", () => {
    const cut = buildLineItems([room()]).find((i) => i.id === "r-cut")!;
    expect(cut.total).toBe(828);
  });
  it("tax is NJ 6.625% of subtotal", () => {
    const s = summarize(buildLineItems([room({ airMoverOverride: 5 })]));
    expect(s.subtotal).toBe(297 + 828 + 158.4 + 217.8 + 435 + 525 + 380);
    expect(s.tax).toBe(Math.round(s.subtotal * 0.06625 * 100) / 100);
  });
});

describe("legal sign-off", () => {
  const ok = { ewaAgreed: true, dopAgreed: true, signature: "data:x", signedAt: "Oct 9, 2024, 10:00 AM", ip: "73.214.18.92", carrier: "State Farm", claimNumber: "1" };
  it("valid when EWA, DOP, signature, timestamp, IP, carrier and claim present", () => {
    expect(signoffBlockers(ok)).toEqual([]);
  });
  it("DOP blocked without claim number", () => {
    expect(signoffBlockers({ ...ok, claimNumber: "" })).toContain("Enter the claim number");
  });
  it("EWA blocked without signature", () => {
    expect(signoffBlockers({ ...ok, signature: null })).toContain("Draw your signature");
  });
  it("EWA records require both timestamp and IP reference when present", () => {
    const blockers = signoffBlockers({ ...ok, signedAt: "Oct 9, 2024, 10:00 AM", ip: null });
    expect(blockers).toContain("Add the client IP reference");
    expect(signoffBlockers({ ...ok, signedAt: null, ip: "73.214.18.92" })).toContain("Add the EWA timestamp");
  });
});
