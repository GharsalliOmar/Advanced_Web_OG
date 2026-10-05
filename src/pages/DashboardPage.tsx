// ---------------------------------------------------------------------
// DASHBOARD (ue3 demo 10) - react-gegenstueck zu renderDashboard() in
// js/views/dashboard.ts.
// alle abgeleiteten werte (reviewed-anzahl, prozent, "letzte 5") werden bei
// JEDEM render frisch aus den aktuellen daten berechnet. es gibt keinen
// zwischengespeicherten html-string und kein "schon gerendert"-flag, das
// veralten koennte. bei 18 eintraegen ist das neu-berechnen billiger als
// jede cache-logik (useMemo waere hier unnoetige komplexitaet).
// ---------------------------------------------------------------------
import { useCaseData, type CaseData } from "../data/caseDataContext";
import { useWorkspace } from "../data/workspaceContext";
import IntroCard from "../components/IntroCard";
import CaseSummaryCard from "../components/CaseSummaryCard";
import StatCard from "../components/StatCard";
import ReviewProgressBar from "../components/ReviewProgressBar";
import RecentEvidenceList from "../components/RecentEvidenceList";
import RecentTimelineList from "../components/RecentTimelineList";

export default function DashboardPage() {
  const caseData = useCaseData();
  const { bookmarks } = useWorkspace();

  return (
    <section className="view active">
      <h2>Case Dashboard</h2>
      <IntroCard />
      {caseData.status === "loading" && <p>Loading case data&hellip;</p>}
      {caseData.status === "error" && (
        <div className="warning-banner">Case data could not be loaded: {caseData.message}</div>
      )}
      {caseData.status === "ready" && (
        <DashboardContent data={caseData.data} bookmarkCount={bookmarks.length} />
      )}
    </section>
  );
}

// eigene komponente, damit hier "data" garantiert vorhanden ist (typ CaseData,
// nicht CaseDataState) - die status-pruefung passiert genau einmal oben.
function DashboardContent({ data, bookmarkCount }: { data: CaseData; bookmarkCount: number }) {
  const { caseFile, evidence, people, locations, timeline } = data;

  // gleiche regel wie vanilla: status case-insensitiv vergleichen
  // (E12 hat "Reviewed" grossgeschrieben, siehe ue2 demo 6)
  const reviewedCount = evidence.filter(
    (ev) => (ev.status || "").toLowerCase() === "reviewed"
  ).length;

  // slice() erzeugt eine kopie -> reverse() veraendert NICHT die daten im
  // context (vgl. mutationsbug aus ue1 demo 2)
  const recentEvidence = evidence.slice(-5).reverse();
  const recentTimeline = timeline.slice(-5).reverse();

  return (
    <div id="dashboardContent">
      <CaseSummaryCard caseFile={caseFile} />

      <div className="stat-grid">
        <StatCard value={evidence.length} label="Evidence items" />
        <StatCard value={people.length} label="People" />
        <StatCard value={locations.length} label="Locations" />
        <StatCard value={bookmarkCount} label="Bookmarked" />
        <StatCard value={reviewedCount} label="Reviewed" />
      </div>

      <ReviewProgressBar reviewed={reviewedCount} total={evidence.length} />

      <div className="dashboard-columns">
        <RecentEvidenceList items={recentEvidence} />
        <RecentTimelineList items={recentTimeline} />
      </div>
    </div>
  );
}
