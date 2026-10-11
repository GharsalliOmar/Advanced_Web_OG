// ---------------------------------------------------------------------
// PAGE ROUTER (ue3 demo 9)
// entspricht der if/else-if-kette am ende von handleHashChange(), nur dass
// hier genau EINE seite gerendert wird. die anderen existieren dann gar
// nicht im DOM (vanilla: alle 5 <section>s immer da, nur per css versteckt).
// kein viewRendered-cache noetig: react rendert, was der zustand sagt.
// ---------------------------------------------------------------------
import type { Route } from "./routes";
import DashboardPage from "../features/dashboard/DashboardPage";
import EvidencePage from "../features/evidence/EvidencePage";
import PeoplePage from "../features/people-locations/PeoplePage";
import TimelinePage from "../features/timeline/TimelinePage";
import WorkspacePage from "../features/workspace/WorkspacePage";
import NotFoundPage from "./NotFoundPage";

interface PageRouterProps {
  route: Route;
}

export default function PageRouter({ route }: PageRouterProps) {
  if (route.kind === "notFound") {
    return <NotFoundPage requested={route.requested} />;
  }

  // switch ueber eine union: fehlt ein case, meldet typescript, dass die
  // funktion nicht in jedem fall etwas zurueckgibt (exhaustiveness).
  switch (route.view) {
    case "dashboard":
      return <DashboardPage />;
    case "evidence":
      return <EvidencePage />;
    case "people":
      // ue4 demo 2: "#people/locations" -> locations-tab, alles andere -> people
      return <PeoplePage tab={route.param === "locations" ? "locations" : "people"} />;
    case "timeline":
      return <TimelinePage />;
    case "workspace":
      return <WorkspacePage />;
  }
}
