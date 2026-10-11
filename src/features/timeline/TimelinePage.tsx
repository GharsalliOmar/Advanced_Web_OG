// ue4 demo 1: timeline in react (statt platzhalter).
// ue4 demo 5: aufgeteilt. diese seite ist jetzt nur noch die FEATURE-
// komponente: daten holen, ladezustand pruefen, ableiten was angezeigt wird.
// das markup steckt in TimelineFilters und TimelineList (presentational).
import { useCaseData } from "../../data/caseDataContext";
import TimelineFilters from "./TimelineFilters";
import TimelineList from "./TimelineList";

export default function TimelinePage() {
  const caseData = useCaseData();
  if (caseData.status === "loading") return null;
  if (caseData.status === "error") {
    return <div className="warning-banner">Case data could not be loaded: {caseData.message}</div>;
  }
  const { timeline, people, locations } = caseData.data;

  // jeder typ nur einmal (vanilla: indexOf-schleife in populateTimelineDropdowns)
  const types = [...new Set(timeline.map((evt) => evt.type))];

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <TimelineFilters people={people} locations={locations} types={types} />
      <TimelineList events={timeline} locations={locations} />
    </section>
  );
}
