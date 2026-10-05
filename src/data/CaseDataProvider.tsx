// ---------------------------------------------------------------------
// CaseDataProvider (ue3 demo 10)
// laedt die falldaten EINMAL beim start und stellt sie allen seiten per
// context zur verfuegung (entspricht loadAllData() in js/data.ts).
// ---------------------------------------------------------------------
import { useEffect, useState, type ReactNode } from "react";
import type { CaseFile, Evidence, Location, Person, TimelineEvent } from "../../js/types";
import { CaseDataContext, type CaseData, type CaseDataState } from "./caseDataContext";

async function fetchJson<T>(file: string, signal: AbortSignal): Promise<T> {
  // BASE_URL ("/Advanced_Web_OG/") -> funktioniert in dev, preview und auf pages
  const res = await fetch(import.meta.env.BASE_URL + "data/" + file, { signal });
  // anders als die vanilla-version: ein 404 ist ein fehler, nicht "json parsen
  // und hoffen" (das wuerde einen unverstaendlichen SyntaxError geben)
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  // wie in data.ts: zusicherung der form, keine laufzeitpruefung (ue2 demo 6 F2)
  return (await res.json()) as T;
}

// bewusst NACHEINANDER wie in der vanilla-version (js/data.ts) - das
// parallele laden ist laut angabe thema einer spaeteren uebung.
async function loadCaseData(signal: AbortSignal): Promise<CaseData> {
  const caseFile = await fetchJson<CaseFile>("case.json", signal);
  const people = await fetchJson<Person[]>("people.json", signal);
  const locations = await fetchJson<Location[]>("locations.json", signal);
  const evidence = await fetchJson<Evidence[]>("evidence.json", signal);
  const timeline = await fetchJson<TimelineEvent[]>("timeline.json", signal);
  return { caseFile, people, locations, evidence, timeline };
}

export default function CaseDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaseDataState>({ status: "loading" });

  useEffect(() => {
    // laden ist ein seiteneffekt -> useEffect (nicht im render-koerper).
    // AbortController: im StrictMode (dev) mountet react den provider
    // testweise zweimal; der cleanup bricht den ersten ladevorgang ab, damit
    // nicht zwei ladevorgaenge um denselben state konkurrieren.
    const controller = new AbortController();
    loadCaseData(controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load case data", err);
        setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => controller.abort();
  }, []);

  return <CaseDataContext.Provider value={state}>{children}</CaseDataContext.Provider>;
}
