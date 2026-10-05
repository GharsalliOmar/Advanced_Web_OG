// ---------------------------------------------------------------------
// ROOT-KOMPONENTE (ue3 demo 6)
// minimaler platzhalter, der beweist, dass react + tsx + vite laufen.
// header/navigation/routing kommen in demo 9, das dashboard in demo 10.
// ---------------------------------------------------------------------

// default export: dieses modul hat genau eine hauptsache (die App-komponente)
export default function App() {
  return (
    <main className="app-main">
      <div className="intro-card">
        <h2>Project ReMotion &ndash; React version</h2>
        <p>
          React is running. This is the new entry point (<code>react.html</code>) that the app is
          being migrated to step by step.
        </p>
        <p>
          The complete vanilla app is still available at <a href="./">index.html</a>.
        </p>
      </div>
    </main>
  );
}
