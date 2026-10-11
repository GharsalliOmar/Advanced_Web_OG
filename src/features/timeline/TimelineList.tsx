// ue4 demo 5: aus TimelinePage herausgeloest - NUR die liste (+ leerzustand).
// presentational: zeigt genau die events, die sie bekommt. WELCHE das sind
// (alle, gefiltert, sortiert), entscheidet der aufrufer.
import type { Location, TimelineEvent } from "../../../js/types";
import TimelineItem from "./TimelineItem";

interface TimelineListProps {
  events: TimelineEvent[];
  // zum aufloesen L01 -> "Human-Robot Interaction Laboratory"
  locations: Location[];
}

export default function TimelineList({ events, locations }: TimelineListProps) {
  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? id;

  return (
    <div className="timeline-container">
      {/* ue4 demo 2: leerzustand per ternary - entweder hinweis ODER liste */}
      {events.length === 0 ? (
        <p>No timeline events match the current filters.</p>
      ) : (
        events.map((evt) => (
          <TimelineItem
            key={evt.id}
            event={evt}
            locationNames={evt.locationIds.map(locationName)}
          />
        ))
      )}
    </div>
  );
}
