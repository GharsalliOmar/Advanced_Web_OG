// eine zeile in den kurzen listen (dashboard: recent evidence/timeline;
// spaeter workspace: bookmarks/notizen). nur rahmen + slots, kein inhalt.
import type { ReactNode } from "react";

interface MiniListItemProps {
  heading: ReactNode;
  children: ReactNode;
}

export default function MiniListItem({ heading, children }: MiniListItemProps) {
  return (
    <div className="mini-list-item">
      <strong>{heading}</strong>
      {children}
    </div>
  );
}
