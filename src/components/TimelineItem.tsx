// ue4 demo 1: ein eintrag der timeline - react-gegenstueck zum html-string in
// renderTimeline() (js/views/timeline.ts).
// heisst TimelineItem statt TimelineEvent, weil TimelineEvent schon der
// daten-typ aus js/types.ts ist.
import type { TimelineEvent } from "../../js/types";
import { formatDate } from "../../js/utils";

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
        {formatDate(event.time)} &middot; {event.certainty}
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p className="evidence-meta">Location: {locationNames.join(", ")}</p>
    </div>
  );
}
