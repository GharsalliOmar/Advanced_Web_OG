// ---------------------------------------------------------------------
// ROUTEN-DEFINITION (ue3 demo 9)
// eine stelle fuer "welche views gibt es" - entspricht dem validViews-array
// in js/navigation.ts, aber als typ: ViewName ist eine union aus genau den
// 5 strings, ein tippfehler wie "evidense" ist damit ein compile-fehler.
// ---------------------------------------------------------------------

export const VIEWS = [
  { name: "dashboard", label: "Dashboard" },
  { name: "evidence", label: "Evidence" },
  { name: "people", label: "People & Locations" },
  { name: "timeline", label: "Timeline" },
  { name: "workspace", label: "Workspace" },
] as const;

export type ViewName = (typeof VIEWS)[number]["name"];

export const DEFAULT_VIEW: ViewName = "dashboard";

// ergebnis des hash-parsens. "notFound" ist ein eigener fall (statt still
// aufs dashboard umzubiegen wie die vanilla-version) - siehe demo 9 F2.
export type Route =
  { kind: "view"; view: ViewName; param: string | null } | { kind: "notFound"; requested: string };

function isViewName(value: string): value is ViewName {
  return VIEWS.some((v) => v.name === value);
}

// "#evidence/E04" -> { view: "evidence", param: "E04" }
// param ist fuer spaeter vorgesehen (detail-ansicht als eigene route, demo 7),
// wird in ue3 noch von keiner seite benutzt.
export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "");
  if (raw === "") return { kind: "view", view: DEFAULT_VIEW, param: null };

  const [first = "", ...rest] = raw.split("/");
  if (!isViewName(first)) return { kind: "notFound", requested: raw };

  return { kind: "view", view: first, param: rest.length > 0 ? rest.join("/") : null };
}

export function hrefFor(view: ViewName): string {
  return "#" + view;
}
