// welches badge passt zu einem evidence-status? gleiche regel wie
// getStatusBadgeClass() in js/utils.ts (gross/klein egal, unbekannt ->
// "unreviewed"), liefert aber den typisierten BadgeTone statt eines
// css-klassen-strings. eigene datei, damit Badge.tsx nur die komponente
// exportiert (fast refresh).
import type { BadgeTone } from "../components/Badge";

export function statusTone(status: string | undefined | null): BadgeTone {
  const s = (status || "").toLowerCase();
  if (s === "reviewed") return "reviewed";
  if (s === "flagged") return "flagged";
  return "unreviewed";
}
