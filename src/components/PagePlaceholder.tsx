// platzhalter fuer views, die noch nicht nach react migriert sind (ue3:
// alles ausser dem dashboard). verlinkt auf dieselbe view in der vanilla-app,
// damit man waehrend der migration trotzdem ueberall hinkommt.
import type { ViewName } from "../lib/routes";

interface PagePlaceholderProps {
  title: string;
  vanillaView: ViewName;
  plannedFor: string;
}

export default function PagePlaceholder({ title, vanillaView, plannedFor }: PagePlaceholderProps) {
  return (
    <section className="view active">
      <h2>{title}</h2>
      <div className="intro-card">
        <p>This view has not been migrated to React yet (planned for {plannedFor}).</p>
        <p>
          Use the <a href={"./#" + vanillaView}>vanilla version of this view</a> in the meantime.
        </p>
      </div>
    </section>
  );
}
