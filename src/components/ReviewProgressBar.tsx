// fortschrittsbalken "x % reviewed". der prozentwert wird HIER aus den
// rohzahlen abgeleitet - bei jedem render neu, nie zwischengespeichert.
interface ReviewProgressBarProps {
  reviewed: number;
  total: number;
}

export default function ReviewProgressBar({ reviewed, total }: ReviewProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((reviewed / total) * 100);
  return (
    <div className="dashboard-panel">
      <h3>Review progress</h3>
      <div
        className="progress-bar-outer"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Evidence reviewed"
      >
        <div className="progress-bar-inner" style={{ width: percent + "%" }} />
      </div>
      <p>{percent}% of evidence reviewed</p>
    </div>
  );
}
