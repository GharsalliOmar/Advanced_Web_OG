// ---------------------------------------------------------------------
// useHashRoute (ue3 demo 9)
// das react-gegenstueck zu handleHashChange() aus js/navigation.ts.
//
// der hash ist ein zustand, der AUSSERHALB von react lebt (im browser,
// window.location). useSyncExternalStore ist reacts vorgesehener weg, so
// einen externen zustand zu abonnieren:
//   - subscribe:   hashchange-listener an-/abmelden
//   - getSnapshot: aktuellen hash lesen
// aendert sich der hash (link-klick, zurueck-button, adresszeile), ruft
// react getSnapshot neu auf und rendert die komponente mit dem neuen wert.
// kein eigener useState-spiegel noetig, der auseinanderlaufen koennte.
// ---------------------------------------------------------------------
import { useSyncExternalStore } from "react";
import { parseHash, type Route } from "../lib/routes";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHash(): string {
  return window.location.hash;
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash);
  return parseHash(hash);
}
