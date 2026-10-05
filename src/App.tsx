// ---------------------------------------------------------------------
// ROOT-KOMPONENTE / APP-SHELL (ue3 demo 9)
// header + navigation + aktuelle seite + footer.
// "welche view ist aktiv" ist KEIN eigener state hier, sondern wird bei
// jedem render aus dem url-hash abgeleitet (useHashRoute). die url ist die
// einzige quelle der wahrheit - wie state.currentPage in der vanilla-app,
// nur ohne die moeglichkeit, dass beide auseinanderlaufen.
// ---------------------------------------------------------------------
// demo 10: daten kommen aus den providern in main.tsx (oberhalb von App);
// solange sie laden, liegt das overlay ueber allem - wie in der vanilla-app.
import { useEffect } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import { useCaseData } from "./data/caseDataContext";
import { VIEWS } from "./lib/routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingOverlay from "./components/LoadingOverlay";
import PageRouter from "./PageRouter";

// default export: dieses modul hat genau eine hauptsache (die App-komponente)
export default function App() {
  const route = useHashRoute();
  const activeView = route.kind === "view" ? route.view : null;
  const { status } = useCaseData();

  // seitentitel pro view - in der vanilla-app bleibt der titel immer gleich.
  // document.title liegt ausserhalb von react -> seiteneffekt -> useEffect,
  // nicht direkt im render-koerper (demo 5 frage 3).
  const label = VIEWS.find((v) => v.name === activeView)?.label ?? "Not found";
  useEffect(() => {
    document.title = label + " – Project ReMotion (React)";
  }, [label]);

  return (
    <>
      {status === "loading" && <LoadingOverlay />}
      <Header activeView={activeView} />
      <main className="app-main">
        <PageRouter route={route} />
      </main>
      <Footer />
    </>
  );
}
