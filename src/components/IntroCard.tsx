// "how to use this portal" - in der vanilla-app statisches markup in
// index.html. die 4 eintraege sind hier daten + ein wiederholter baustein
// statt 4x kopiertem html. "go to"-links sind echte <a href="#..."> wie in
// der navigation (demo 9).
import { hrefFor, type ViewName } from "../lib/routes";

const HOWTO_ITEMS: { view: ViewName; title: string; text: string; linkLabel: string }[] = [
  {
    view: "evidence",
    title: "1. Evidence Catalogue",
    text: "Search, filter, and sort every evidence item. Open one for full details, related people and locations, and to add a private note.",
    linkLabel: "Go to Evidence",
  },
  {
    view: "people",
    title: "2. People & Locations",
    text: "Read profiles and statements from the six team members involved, and look up the six key locations in the investigation.",
    linkLabel: "Go to People & Locations",
  },
  {
    view: "timeline",
    title: "3. Timeline",
    text: "Walk through events in chronological order, filter by person, location, or type, and jump straight to the evidence behind any event.",
    linkLabel: "Go to Timeline",
  },
  {
    view: "workspace",
    title: "4. Investigator Workspace",
    text: "Your bookmarked evidence and notes collect here. Draft a hypothesis — who you suspect, why, and how confident you are — it's saved automatically in your browser.",
    linkLabel: "Go to Workspace",
  },
];

interface HowToItemProps {
  view: ViewName;
  title: string;
  text: string;
  linkLabel: string;
}

// nur hier benutzt -> nicht exportiert
function HowToItem({ view, title, text, linkLabel }: HowToItemProps) {
  return (
    <div className="howto-item">
      <h4>{title}</h4>
      <p>{text}</p>
      <a className="btn btn-secondary btn-small" href={hrefFor(view)}>
        {linkLabel}
      </a>
    </div>
  );
}

export default function IntroCard() {
  return (
    <div className="intro-card">
      <h3>How to use this portal</h3>
      <p>
        Everything gathered on the case so far is organised into four working views. Use the
        navigation bar at the top to move between them at any time.
      </p>
      <div className="howto-grid">
        {HOWTO_ITEMS.map((item) => (
          <HowToItem key={item.view} {...item} />
        ))}
      </div>
    </div>
  );
}
