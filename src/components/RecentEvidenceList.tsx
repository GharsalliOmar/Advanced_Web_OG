import type { Evidence } from "../../js/types";
import { statusTone } from "../lib/badges";
import Badge from "./Badge";
import MiniListItem from "./MiniListItem";

interface RecentEvidenceListProps {
  items: Evidence[];
}

export default function RecentEvidenceList({ items }: RecentEvidenceListProps) {
  return (
    <div className="dashboard-panel">
      <h3>Recent evidence</h3>
      {items.length === 0 && <p>No evidence loaded yet.</p>}
      {items.map((ev) => (
        // key = stabile id (nicht der index) -> react ordnet zeilen richtig zu (demo 3)
        <MiniListItem key={ev.id} heading={ev.id}>
          {" "}
          &mdash; {ev.title} <Badge tone={statusTone(ev.status)}>{ev.status}</Badge>
        </MiniListItem>
      ))}
    </div>
  );
}
