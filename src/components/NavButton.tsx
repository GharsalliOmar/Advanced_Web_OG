// ein eintrag der hauptnavigation. bewusst ein echter <a href="#..."> statt
// <button onclick>: der klick aendert nur den hash, den rest (hashchange ->
// useHashRoute -> neu rendern) erledigt der browser bzw. react. dadurch gehen
// auch "in neuem tab oeffnen", mittelklick und "link kopieren" (demo 4).
import { hrefFor, type ViewName } from "../lib/routes";

interface NavButtonProps {
  view: ViewName;
  label: string;
  active: boolean;
}

export default function NavButton({ view, label, active }: NavButtonProps) {
  return (
    <a
      href={hrefFor(view)}
      className={active ? "nav-btn active" : "nav-btn"}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </a>
  );
}
