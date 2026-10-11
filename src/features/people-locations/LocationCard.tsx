// ue4 demo 1: react-gegenstueck zu renderLocations() (js/views/people.ts).
import type { Location } from "../../../js/types";
import Card from "./Card";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Card variant="location">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {/* statische text-liste ohne id -> index als key ok (ue4 demo 4 F3) */}
        {location.contains.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
