// ue4 demo 1: rahmen fuer eine karte - bekommt seinen INHALT als children
// (composition), nicht als daten-prop. Card weiss nichts ueber personen oder
// orte, sie liefert nur das kasten-markup. was drin steht, entscheidet der
// aufrufer (PersonCard, LocationCard).
import type { ReactNode } from "react";

interface CardProps {
  // nur die zwei varianten, fuer die es css gibt (.person-card / .location-card)
  variant: "person" | "location";
  children: ReactNode;
}

export default function Card({ variant, children }: CardProps) {
  return <div className={variant + "-card"}>{children}</div>;
}
