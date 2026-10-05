// ---------------------------------------------------------------------
// WorkspaceProvider (ue3 demo 10)
// liest die bookmarks aus DEMSELBEN localStorage-key wie die vanilla-app
// (STORAGE_KEYS aus js/state.ts) - beide versionen teilen sich also die
// bookmarks (gleicher origin). bookmark in der vanilla-app setzen ->
// react-dashboard zeigt die neue anzahl.
// ---------------------------------------------------------------------
import { useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "../../js/state";
import { WorkspaceContext } from "./workspaceContext";

// gleiche robustheit wie loadBookmarksFromStorage() in js/storage.ts:
// fehlender oder kaputter eintrag -> leere liste statt absturz
function readBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.bookmarks);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    return [];
  }
}

export default function WorkspaceProvider({ children }: { children: ReactNode }) {
  // lazy initializer: localStorage nur beim ersten render lesen
  const [bookmarks, setBookmarks] = useState<string[]>(readBookmarks);

  useEffect(() => {
    // das "storage"-event feuert, wenn ein ANDERER tab desselben origins
    // localStorage aendert (z.b. die vanilla-app in tab 2). so bleibt die
    // anzahl auch ohne reload aktuell.
    function onStorage(e: StorageEvent) {
      if (e.key === null || e.key === STORAGE_KEYS.bookmarks) setBookmarks(readBookmarks());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <WorkspaceContext.Provider value={{ bookmarks }}>{children}</WorkspaceContext.Provider>;
}
