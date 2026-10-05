// ---------------------------------------------------------------------
// WORKSPACE: CONTEXT + HOOK (ue3 demo 10)
// bookmarks liegen oberhalb des routers, weil dashboard (anzahl), evidence
// (stern) und workspace (liste) sie brauchen (demo 7). in ue3 liest nur das
// dashboard die anzahl; umschalten/notizen/hypothese kommen in ue4/5.
// ---------------------------------------------------------------------
import { createContext, useContext } from "react";

export interface WorkspaceState {
  bookmarks: string[];
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function useWorkspace(): WorkspaceState {
  const value = useContext(WorkspaceContext);
  if (value === null) {
    throw new Error("useWorkspace() must be used inside <WorkspaceProvider>");
  }
  return value;
}
