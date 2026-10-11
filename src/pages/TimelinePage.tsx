// ue4 demo 1: timeline in react (statt platzhalter).
// die filter-dropdowns sind nur optisch vollstaendig (kein onChange) - das
// filtern selbst ist laut angabe erst thema von uebung 5.
import { useCaseData } from "../data/caseDataContext";
import TimelineItem from "../components/TimelineItem";

export default function TimelinePage() {
  const caseData = useCaseData();
  if (caseData.status === "loading") return null;
  if (caseData.status === "error") {
    return <div className="warning-banner">Case data could not be loaded: {caseData.message}</div>;
  }
  const { timeline, people, locations } = caseData.data;

  // jeder typ nur einmal (vanilla: indexOf-schleife in populateTimelineDropdowns)
  const types = [...new Set(timeline.map((evt) => evt.type))];
  // id -> name, fuer die "Location:"-zeile
  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? id;

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <div className="toolbar">
        <div className="toolbar-row">
          <select aria-label="Order" defaultValue="asc">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>
          <select aria-label="Filter by person" defaultValue="">
            <option value="">All people</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select aria-label="Filter by location" defaultValue="">
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}
              </option>
            ))}
          </select>
          <select aria-label="Filter by event type" defaultValue="">
            <option value="">All event types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="timeline-container">
        {timeline.map((evt) => (
          <TimelineItem
            key={evt.id}
            event={evt}
            locationNames={evt.locationIds.map(locationName)}
          />
        ))}
      </div>
    </section>
  );
}
