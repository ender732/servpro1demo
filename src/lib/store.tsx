import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Chamber } from "./restoration";

export type Persona = "tech" | "client";
export type View = "workspace" | "list";
export type Status = "Inspection Complete" | "Quote Delivered" | "Legally Approved" | "Drying Complete";

export interface Message { id: number; author: "Sean" | "Homeowner"; text: string; at: string }
export interface MoistureRow { date: string; temp: number; rh: number; gpp: number }
export interface Activity { at: string; text: string; kind: "note" | "photo" | "system" }

export interface AppState {
  persona: Persona;
  view: View;
  incident: {
    address: string; propertyType: string; carrier: string; claimNumber: string;
    adjuster: string; adjusterPhone: string; incidentType: string; category: string;
    elapsedHours: number; occupancy: "Operational" | "Displaced"; owner: string;
  };
  chambers: Chamber[];
  status: Status;
  messages: Message[];
  moisture: MoistureRow[];
  activity: Activity[];
  signoff: { ewa: boolean; dop: boolean; signature: string | null; signedAt: string | null; ip: string | null };
  seq: number;
}

export function makeDemoState(): AppState {
  return {
    persona: "tech",
    view: "workspace",
    incident: {
      address: "142 Elmwood Ave, Riverdale, NJ 07457",
      propertyType: "Residential Single-Family",
      carrier: "State Farm",
      claimNumber: "SF-34-K882-19C",
      adjuster: "Dana Whitfield",
      adjusterPhone: "(201) 555-0148",
      incidentType: "Water",
      category: "Cat 1 Clean",
      elapsedHours: 6,
      occupancy: "Operational",
      owner: "Maria Delgado",
    },
    chambers: [],
    status: "Inspection Complete",
    messages: [
      { id: 1, author: "Sean", text: "Hi Maria — I'm on site and scoping the basement now. Quote coming shortly.", at: "Oct 9, 9:12 AM" },
    ],
    moisture: [
      { date: "Oct 9", temp: 72, rh: 78, gpp: 96 },
      { date: "Oct 10", temp: 74, rh: 61, gpp: 78 },
      { date: "Oct 11", temp: 75, rh: 48, gpp: 62 },
    ],
    activity: [
      { at: "Oct 9, 8:41 AM", text: "Arrived on site. Main supply valve shut off by homeowner.", kind: "note" },
      { at: "Oct 9, 8:55 AM", text: "Photo log: burst 1/2\" copper line behind utility closet.", kind: "photo" },
      { at: "Oct 9, 9:05 AM", text: "Category 1 water confirmed. Source: supply line.", kind: "system" },
    ],
    signoff: { ewa: false, dop: false, signature: null, signedAt: null, ip: null },
    seq: 10,
  };
}

const Ctx = createContext<{ s: AppState; set: (fn: (s: AppState) => AppState) => void; reset: () => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(() => makeDemoState());
  const set = useCallback((fn: (s: AppState) => AppState) => setS(fn), []);
  const reset = useCallback(() => setS(makeDemoState()), []);
  return <Ctx.Provider value={{ s, set, reset }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const nowLabel = () =>
  new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
