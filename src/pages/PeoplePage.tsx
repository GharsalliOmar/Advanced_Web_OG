// ue4 demo 1: people & locations in react (statt platzhalter).
import { useCaseData } from "../data/caseDataContext";
import PersonCard from "../components/PersonCard";
import LocationCard from "../components/LocationCard";

export default function PeoplePage() {
  const caseData = useCaseData();
  // solange geladen wird, zeigt App das LoadingOverlay -> hier nichts rendern
  if (caseData.status === "loading") return null;
  if (caseData.status === "error") {
    return <div className="warning-banner">Case data could not be loaded: {caseData.message}</div>;
  }
  const { people, locations } = caseData.data;

  return (
    <section className="view active">
      <h2>People &amp; Locations</h2>
      <div className="people-grid">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
      <div className="locations-grid">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
