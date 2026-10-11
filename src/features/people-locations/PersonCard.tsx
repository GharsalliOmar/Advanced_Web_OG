// ue4 demo 1: react-gegenstueck zum html-string in renderPeople()
// (js/views/people.ts). eine person rein, markup raus - kein innerHTML.
import type { Person } from "../../../js/types";
import Card from "./Card";
import BulletList from "./BulletList";

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <Card variant="person">
      <div className="person-card-header">
        <img
          className="person-avatar"
          src={import.meta.env.BASE_URL + person.avatar}
          alt={"Portrait of " + person.name}
        />
        <div>
          <h3>{person.name}</h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>
      <BulletList items={person.responsibilities} />
      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
    </Card>
  );
}
