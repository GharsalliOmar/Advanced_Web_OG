// ue4 demo 1: people & locations in react (statt platzhalter).
// ue4 demo 2: tabs. welcher tab aktiv ist, kommt als prop aus der url
// ("#people" / "#people/locations") - kein useState, kein classList.add/remove
// wie in switchPeopleTab() (js/views/people.ts).
import { useCaseData } from "../data/caseDataContext";
import PersonCard from "../components/PersonCard";
import LocationCard from "../components/LocationCard";

interface PeoplePageProps {
  tab: "people" | "locations";
}

export default function PeoplePage({ tab }: PeoplePageProps) {
  const caseData = useCaseData();
  // early return: solange geladen wird, zeigt App das LoadingOverlay -> hier nichts
  if (caseData.status === "loading") return null;
  if (caseData.status === "error") {
    return <div className="warning-banner">Case data could not be loaded: {caseData.message}</div>;
  }
  const { people, locations } = caseData.data;

  return (
    <section className="view active">
      <h2>People &amp; Locations</h2>
      <div className="tab-bar">
        {/* ternary fuer die klasse: beide faelle brauchen einen wert */}
        <a href="#people" className={tab === "people" ? "tab-btn active" : "tab-btn"}>
          People
        </a>
        <a href="#people/locations" className={tab === "locations" ? "tab-btn active" : "tab-btn"}>
          Locations
        </a>
      </div>
      {/* ternary: genau EINES von beiden wird gerendert, das andere existiert
          gar nicht im DOM (vanilla: beide da, eines per .hidden versteckt) */}
      {tab === "people" ? (
        <div className="people-grid">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="locations-grid">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      )}
    </section>
  );
}
