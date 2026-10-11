// ue4 demo 5: aus TimelinePage herausgeloest - NUR die filterleiste.
// presentational: bekommt die auswahl-moeglichkeiten als props, liest selbst
// keine daten. die dropdowns sind nur optisch vollstaendig (kein onChange) -
// das filtern ist laut angabe erst thema von uebung 5.
import type { Location, Person } from "../../js/types";

interface TimelineFiltersProps {
  people: Person[];
  locations: Location[];
  types: string[];
}

export default function TimelineFilters({ people, locations, types }: TimelineFiltersProps) {
  return (
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
  );
}
