// ue4 demo 1: ein eintrag der timeline - react-gegenstueck zum html-string in
// renderTimeline() (js/views/timeline.ts).
// heisst TimelineItem statt TimelineEvent, weil TimelineEvent schon der
// daten-typ aus js/types.ts ist.
import type { Certainty, TimelineEvent } from "../../../js/types";
import { formatDate } from "../../../js/utils";
import Badge, { type BadgeTone } from "../../components/Badge";

// ue4 demo 2: lookup-tabelle statt if-kette (vanilla: certaintyBadgeClass()).
// Record<Certainty, ...> zwingt, fuer JEDEN certainty-wert eine farbe anzugeben -
// kommt ein neuer wert in den typ, meldet typescript hier die luecke.
const CERTAINTY_TONE: Record<Certainty, BadgeTone> = {
  confirmed: "reviewed",
  reported: "flagged",
  contradictory: "critical",
};

interface TimelineItemProps {
  event: TimelineEvent;
  // schon aufgeloeste namen (L01 -> "Lab ..."): die karte zeigt nur an,
  // das nachschlagen macht der aufrufer
  locationNames: string[];
}

export default function TimelineItem({ event, locationNames }: TimelineItemProps) {
  return (
    <div className={"timeline-event certainty-" + event.certainty}>
      <div className="timeline-time">
        {formatDate(event.time)} &middot;{" "}
        <Badge tone={CERTAINTY_TONE[event.certainty]}>{event.certainty}</Badge>
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {/* && statt ternary: im "sonst"-fall soll einfach nichts erscheinen.
          bewusst "length > 0" (boolean) und NICHT nur "length" - bei 0 wuerde
          react sonst eine sichtbare "0" rendern (demo 2 F1) */}
      {locationNames.length > 0 && (
        <p className="evidence-meta">Location: {locationNames.join(", ")}</p>
      )}
    </div>
  );
}
