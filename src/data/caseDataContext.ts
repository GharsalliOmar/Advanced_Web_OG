// ---------------------------------------------------------------------
// CASE-DATEN: CONTEXT + HOOK (ue3 demo 10)
// die react-version liest DIESELBEN json-dateien wie die vanilla-app
// (public/data/*.json) und benutzt DIESELBEN typen (js/types.ts).
// statt eines globalen, veraenderlichen state-objekts (js/state.ts) liegen
// die daten in einem react-context: jede komponente darunter kann sie per
// useCaseData() lesen, und aendert sich der context-wert, rendern genau
// die lesenden komponenten neu.
// (context und provider-komponente in getrennten dateien, damit vite's
// fast refresh funktioniert - siehe eslint-regel react-refresh)
// ---------------------------------------------------------------------
import { createContext, useContext } from "react";
import type { CaseFile, Evidence, Location, Person, TimelineEvent } from "../../js/types";

export interface CaseData {
  caseFile: CaseFile;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
}

// drei zustaende statt "leere arrays + {} as CaseFile" wie in js/state.ts:
// solange status nicht "ready" ist, GIBT es keine daten - typescript
// erzwingt, dass jede komponente das prueft, bevor sie data benutzt.
export type CaseDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CaseData };

export const CaseDataContext = createContext<CaseDataState | null>(null);

export function useCaseData(): CaseDataState {
  const value = useContext(CaseDataContext);
  if (value === null) {
    throw new Error("useCaseData() must be used inside <CaseDataProvider>");
  }
  return value;
}
