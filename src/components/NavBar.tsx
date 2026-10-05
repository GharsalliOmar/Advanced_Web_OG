// die 5 nav-eintraege kommen aus der VIEWS-liste (src/lib/routes.ts) statt
// 5x von hand im markup zu stehen wie in index.html. welcher aktiv ist,
// entscheidet der aufrufer - NavBar selbst kennt den hash nicht.
import { VIEWS, type ViewName } from "../lib/routes";
import NavButton from "./NavButton";

interface NavBarProps {
  // null = gerade keine gueltige view (not-found-seite) -> nichts hervorheben
  activeView: ViewName | null;
}

export default function NavBar({ activeView }: NavBarProps) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {VIEWS.map((v) => (
        <NavButton key={v.name} view={v.name} label={v.label} active={v.name === activeView} />
      ))}
    </nav>
  );
}
