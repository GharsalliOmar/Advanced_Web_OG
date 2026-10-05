import type { TimelineEvent } from "../../js/types";
import { formatDate } from "../../js/utils";
import MiniListItem from "./MiniListItem";

interface RecentTimelineListProps {
  items: TimelineEvent[];
}

export default function RecentTimelineList({ items }: RecentTimelineListProps) {
  return (
    <div className="dashboard-panel">
      <h3>Recent timeline events</h3>
      {items.length === 0 && <p>No timeline events loaded yet.</p>}
      {items.map((evt) => (
        <MiniListItem key={evt.id} heading={formatDate(evt.time)}>
          <br />
          {evt.title}
        </MiniListItem>
      ))}
    </div>
  );
}
