// gleiches markup/css wie #loadingOverlay in index.html. wird nur
// gerendert, solange geladen wird - kein "hidden"-klassen-umschalten.
export default function LoadingOverlay() {
  return (
    <div className="loading-overlay" role="status">
      <div className="loading-box">
        <div className="spinner" />
        <p>Loading case file&hellip;</p>
      </div>
    </div>
  );
}
