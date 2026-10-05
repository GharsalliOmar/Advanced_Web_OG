// ---------------------------------------------------------------------
// PAGE ROUTER (ue3 demo 9)
// entspricht der if/else-if-kette am ende von handleHashChange(), nur dass
// hier genau EINE seite gerendert wird. die anderen existieren dann gar
// nicht im DOM (vanilla: alle 5 <section>s immer da, nur per css versteckt).
// kein viewRendered-cache noetig: react rendert, was der zustand sagt.
// ---------------------------------------------------------------------
import type { Route } from "./lib/routes";
import DashboardPage from "./pages/DashboardPage";
import EvidencePage from "./pages/EvidencePage";
import PeoplePage from "./pages/PeoplePage";
import TimelinePage from "./pages/TimelinePage";
import WorkspacePage from "./pages/WorkspacePage";
import NotFoundPage from "./pages/NotFoundPage";

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
      return <PeoplePage />;
    case "timeline":
      return <TimelinePage />;
    case "workspace":
      return <WorkspacePage />;
  }
}
