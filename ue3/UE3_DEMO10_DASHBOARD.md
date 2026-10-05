# UE3 – Demo 10: Dashboard in React

> Aufgabe: Das Dashboard als React-Komponenten nachbauen (Ausgangspunkt: Hierarchie aus Demo 7) –
> Fallzusammenfassung, Kennzahl-Karten, Review-Fortschritt, Listen der letzten Evidence- und
> Timeline-Einträge –, gespeist aus denselben Daten wie die bestehende App. Prüfen, dass es mit
> echten Daten korrekt rendert und dass Wegnavigieren und Zurückkehren nichts verliert oder
> verfälscht. Dazu drei Fragen zu Datenherkunft/-fluss, zum alten Render-Cache-Bug und dazu, _wann_
> abgeleitete Werte neu berechnet werden.
>
> Skript: Kapitel 15, _React Foundations_ (PDF S. 102–109).

**Öffnen:** `npm run dev` → <http://localhost:5173/Advanced_Web_OG/react.html> · live (nach Push):
<https://gharsalliomar.github.io/Advanced_Web_OG/react.html>

---

## 1. Was gebaut wurde

### Komponenten (vgl. Hierarchie aus Demo 7)

```
<StrictMode>                                   src/main.tsx
└─ <CaseDataProvider>                          src/data/CaseDataProvider.tsx   lädt die 5 JSON-Dateien einmal
   └─ <WorkspaceProvider>                      src/data/WorkspaceProvider.tsx  Bookmarks aus localStorage
      └─ <App>                                 src/App.tsx                     + <LoadingOverlay> solange geladen wird
         ├─ <Header> / <NavBar> / <NavButton>  (Demo 9)
         ├─ <PageRouter>
         │  └─ <DashboardPage>                 src/pages/DashboardPage.tsx     liest Context, prüft Ladezustand
         │     ├─ <IntroCard>                  src/components/IntroCard.tsx
         │     │  └─ <HowToItem> ×4            (nur dort benutzt, nicht exportiert)
         │     └─ <DashboardContent>           (in DashboardPage.tsx)          berechnet abgeleitete Werte
         │        ├─ <CaseSummaryCard>         → <Badge>
         │        ├─ <StatCard> ×5             (in <div className="stat-grid">)
         │        ├─ <ReviewProgressBar>
         │        ├─ <RecentEvidenceList>      → <MiniListItem> + <Badge>
         │        └─ <RecentTimelineList>      → <MiniListItem>
         └─ <Footer>
```

Neue Dateien: `src/data/{caseDataContext.ts, CaseDataProvider.tsx, workspaceContext.ts, WorkspaceProvider.tsx}`,
`src/components/{Badge, StatCard, ReviewProgressBar, CaseSummaryCard, MiniListItem, RecentEvidenceList, RecentTimelineList, IntroCard, LoadingOverlay}.tsx`,
`src/lib/badges.ts`. Geändert: `src/main.tsx`, `src/App.tsx`, `src/pages/DashboardPage.tsx`,
`styles.css` (`a.btn` wie `a.nav-btn`).

**Abweichung von Demo 7:** `StatGrid` ist keine eigene Komponente geworden, sondern ein
`<div className="stat-grid">` in `DashboardContent` – einmal verwendet, keine Logik (Kriterium aus
Demo 7 F1: „inline bleibt, was einmalig, ohne Logik und kurz ist“).

### Was von der Vanilla-App wiederverwendet wird

| Wiederverwendet                 | Woher                | Warum                                                                   |
| ------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| JSON-Daten                      | `public/data/*.json` | „Reading from the same data your app already loads“ (Angabe)            |
| Typen `CaseFile`, `Evidence`, … | `js/types.ts`        | Eine Definition des Datenmodells für beide Versionen                    |
| `formatDate()`                  | `js/utils.ts`        | Reine Funktion ohne DOM/State; identische Datumsanzeige garantiert      |
| `STORAGE_KEYS.bookmarks`        | `js/state.ts`        | Gleicher `localStorage`-Key → beide Versionen teilen sich die Bookmarks |
| CSS-Klassen                     | `styles.css`         | Gleiches Aussehen ohne doppeltes CSS                                    |

### Unterschiede im Verhalten (bewusst)

- **Fehler beim Laden** werden angezeigt (`HTTP 404` → Warnbanner im Dashboard). Vanilla prüft
  `res.ok` nicht und scheitert mit einem unverständlichen JSON-`SyntaxError`.
- **Kein Teil-Rendering:** Vanilla rendert das Dashboard dreimal mit Teil-Daten (nach Core, nach
  Evidence, nach Timeline) – „0 Evidence“ ist dabei kurz sichtbar. React zeigt das Overlay, bis
  alles geladen ist, und rendert dann einmal mit vollständigen Daten.
- **Bookmarks aus anderen Tabs** werden live übernommen (`storage`-Event).
- „Go to …“-Buttons der Intro-Karte sind echte Links (`<a href="#evidence">`), wie die Navigation.

---

## 2. Geprüft

**Vergleich Vanilla ↔ React** (beide im Dev-Server, DOM-Inhalte per Skript ausgelesen und
verglichen): **identisch** in allen Feldern.

| Feld                   | Wert (beide)                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Kennzahlen             | 18 Evidence items · 6 People · 6 Locations · 0 Bookmarked · 1 Reviewed                  |
| Fortschritt            | Balken `width: 6%`, Text „6% of evidence reviewed“                                      |
| Fall                   | „Project ReMotion – Investigation Portal“, Badge „OPEN“                                 |
| Recent evidence        | E18, E17, E16, E15, E14 – jeweils Badge `badge-unreviewed`                              |
| Recent timeline events | 09:25 demonstration cancelled … 08:47 morning startup (gleiche 5, gleiche Formatierung) |

**Wegnavigieren und zurück** (Dashboard → Evidence → People → Timeline → Workspace → Dashboard →
Timeline → Dashboard): Kennzahlen danach unverändert; **keine einzige neue Datenanfrage** beim
Navigieren; auf Nicht-Dashboard-Seiten existieren keine Stat-Karten im DOM, beim Zurückkehren
wieder genau 5.

**Datenanfragen:**

- Produktions-Build (`vite preview`): jede Datei **genau einmal** – `case.json`, `people.json`,
  `locations.json`, `evidence.json`, `timeline.json`.
- Dev-Server: `case.json` erscheint zweimal. Ursache: `<StrictMode>` führt Effects in der
  Entwicklung absichtlich zweimal aus; der `AbortController` im Cleanup bricht den ersten
  Ladevorgang ab. Nur in der Entwicklung.

**Bookmarks über Tabs hinweg:** Vanilla-App in Tab 2, E01 + E02 bookmarken → React-Dashboard in
Tab 1 zeigt ohne Reload „2 Bookmarked“; wieder entfernen → „0 Bookmarked“.

**Werkzeuge:** `npm run typecheck`, `lint` (inkl. Hook-Regeln), `format:check`, `build` ✔. Keine
Konsolenfehler.

**Bundle (gzip):** React-Version 71,7 kB (vorher Grundgerüst 68,6 kB → das komplette Dashboard
kostet ~3 kB). Vite hat `js/utils.ts` jetzt in einen gemeinsamen Chunk ausgelagert, den beide
Versionen laden (0,8 kB).

---

## 3. Frage 1 – Woher kommen die Daten, wie kommen sie zu den Komponenten? Final oder Platzhalter?

### Datenfluss

```
public/data/*.json ──fetch (useEffect, einmal)──► CaseDataProvider ──Context──┐
localStorage["remotion_bookmarks"] ──► WorkspaceProvider ──Context────────────┤
                                                                               ▼
                               DashboardPage: useCaseData(), useWorkspace()
                               prüft status: loading / error / ready
                                                                               ▼
                               DashboardContent: berechnet reviewedCount,
                               recentEvidence, recentTimeline
                                                                               ▼ Props
             CaseSummaryCard · StatCard ×5 · ReviewProgressBar · RecentEvidenceList · RecentTimelineList
             (rein darstellend: kennen weder Context noch fetch, nur ihre Props)
```

1. **`CaseDataProvider`** lädt in einem `useEffect` die fünf JSON-Dateien (nacheinander, wie
   Vanilla) und speichert das Ergebnis als `{ status: "ready", data }` in seinem State.
2. Den State stellt er per **Context** bereit. Jede Komponente darunter kann ihn mit
   **`useCaseData()`** lesen – ohne Props durch alle Ebenen zu reichen.
3. **`DashboardPage`** ist die einzige Dashboard-Komponente, die Context liest. Sie prüft den
   Ladezustand; erst bei `ready` rendert sie `DashboardContent`.
4. **`DashboardContent`** leitet die Werte ab und reicht sie als **Props** an die darstellenden
   Komponenten (`StatCard` bekommt nur `value` + `label`).

Vorteil der Trennung: `StatCard`, `Badge`, `MiniListItem` wissen nichts über die Datenquelle und
sind in Evidence/Timeline/Workspace (Übung 4/5) ohne Änderung wiederverwendbar.

### Final oder Platzhalter?

| Teil                                                                                            | Einschätzung                                                                                                                             |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Struktur** Provider oberhalb des Routers + Context + Hook, darstellende Komponenten mit Props | **Bleibt** – entspricht der Hierarchie aus Demo 7; Evidence/Timeline/Workspace hängen sich in Übung 4/5 an dieselben Provider.           |
| **Selbstgeschriebenes Laden** in `useEffect` mit `fetch`                                        | **Platzhalter.** Kein Caching, kein Neuladen, kein Retry. Später: Datenlade-Bibliothek (z. B. TanStack Query) oder Loader eines Routers. |
| **Sequenzielles Laden**                                                                         | **Platzhalter, bewusst.** Wie Vanilla; Parallelisieren (`Promise.all`) ist laut Angabe Thema einer späteren Übung.                       |
| **`WorkspaceProvider` nur lesend**                                                              | **Wird erweitert** in Übung 4/5: `toggleBookmark`, Notizen, Hypothese.                                                                   |
| **Typen aus `js/types.ts`**, `formatDate` aus `js/utils.ts`                                     | **Übergang.** Wandern nach `src/`, wenn die Vanilla-App entfernt wird.                                                                   |
| **Keine Laufzeitprüfung** der JSON-Form (`as CaseFile`)                                         | Offen wie in Übung 2 (Demo 6 F2) – bei echter Datenquelle Schema-Validierung (z. B. zod).                                                |

---

## 4. Frage 2 – Gibt es ein Gegenstück zum „veraltete Zahlen“-Bug?

**Der alte Bug (Übung 1, Demo 5):** `handleHashChange()` hat `renderDashboard()` nur beim ersten
Besuch aufgerufen (`if (!state.viewRendered.dashboard)`). Danach stand das fertige HTML im DOM und
wurde nie aktualisiert → Bookmark setzen, zurück aufs Dashboard: „Bookmarked“ blieb auf 0.

**React-Version: diese Fehlerklasse gibt es so nicht mehr**, aus zwei Gründen:

1. **Kein Render-Cache.** Es gibt kein „schon gerendert“-Flag. `DashboardPage` wird beim Verlassen
   des Dashboards entfernt (unmount) und beim Zurückkehren **neu** gerendert – mit den Daten, die
   _jetzt_ im Context stehen.
2. **Abhängigkeiten sind automatisch.** Solange das Dashboard sichtbar ist, rendert React es neu,
   sobald sich ein gelesener Context-Wert ändert (Daten fertig geladen, Bookmarks geändert). Niemand
   muss daran denken, „render“ aufzurufen – genau das war die Fehlerquelle.

Live geprüft: Bookmarks in der Vanilla-App in einem anderen Tab ändern → React-Dashboard
aktualisiert die Zahl sofort (2 → 0), ohne Reload, ohne Navigation.

**Restrisiken (ehrlich):**

- **Zustand außerhalb von React, den niemand abonniert.** Wird `remotion_bookmarks` im **selben**
  Tab per DevTools geändert, feuert kein `storage`-Event → die Zahl bleibt bis zum Reload alt
  (`WorkspaceProvider` liegt oberhalb des Routers und liest `localStorage` nur beim Start). React
  sieht nur Änderungen, die über seinen State/Context laufen.
- **In-place-Mutation.** Würde jemand `data.evidence.sort(...)` direkt im Context-Array aufrufen,
  bemerkt React die Änderung nicht (gleiche Referenz) **und** die Daten wären für alle Seiten
  verändert – der Mutationsbug aus Übung 1 in neuer Form. Deshalb `slice().reverse()` statt
  `reverse()`.
- **Falsch gesetztes `useMemo`/`useEffect`-Abhängigkeitsarray** könnte wieder einen Cache
  einführen, der veraltet. Die ESLint-Regel `react-hooks/exhaustive-deps` (seit dem ESLint-Umbau vor Demo 7 aktiv)
  meldet das.

---

## 5. Frage 3 – Wann werden abgeleitete Werte (z. B. Review-Prozent) neu berechnet?

|                | Vanilla (`renderDashboard()`)                                                                                                                                              | React (`DashboardContent` / `ReviewProgressBar`)                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wo**         | In der Render-Funktion, die einen HTML-String baut                                                                                                                         | Direkt im Komponenten-Körper (`evidence.filter(...)`, `Math.round(...)`)                                                                                          |
| **Wann**       | **Nur, wenn jemand `renderDashboard()` aufruft:** nach jedem der 3 Ladeschritte (core, evidence, timeline) und bei jedem Wechsel aufs Dashboard (seit dem Fix aus Übung 1) | **Bei jedem Render:** beim Mounten (Wechsel aufs Dashboard), wenn sich Daten-Context oder Bookmarks ändern; im Dev zusätzlich doppelt (StrictMode)                |
| **Dazwischen** | Der Wert ist als Text im DOM „eingefroren“                                                                                                                                 | Es gibt keinen gespeicherten Wert – beim nächsten Render wird neu gerechnet                                                                                       |
| **Teil-Daten** | Ja: nach dem Core-Schritt wird mit `allEvidence = []` gerechnet → kurz „0 %“ und „0 Evidence“                                                                              | Nein: gerechnet wird erst bei `status === "ready"`, also mit vollständigen Daten                                                                                  |
| **Steuerung**  | „Push“: der Code muss aktiv neu rendern                                                                                                                                    | „Pull“: React ruft die Komponente auf, wenn ihre Eingaben sich ändern                                                                                             |
| **Caching**    | Implizit (DOM-Inhalt) und explizit (früher `viewRendered`)                                                                                                                 | Keins; bewusst **ohne** `useMemo` – bei 18 Einträgen ist Neuberechnen billiger als Cache-Logik. `useMemo` erst, wenn Messungen (React Profiler) es rechtfertigen. |

Der Prozentwert selbst wird in `ReviewProgressBar` aus `reviewed` und `total` berechnet – die
Komponente bekommt Rohzahlen, nicht den fertigen Prozentwert, damit die Rechenregel an genau einer
Stelle steht.

---

## 6. Live-Demo in der Übung

1. Zwei Tabs nebeneinander: Vanilla `/#dashboard`, React `/react.html` – gleiche Zahlen, gleiche
   Listen.
2. In der Vanilla-App (Tab 1) einen Stern auf Evidence setzen → React-Dashboard (Tab 2) zählt sofort
   hoch.
3. In React zwischen Views wechseln und zurück → Network-Tab: keine neuen JSON-Anfragen.
4. React DevTools → `CaseDataProvider` anklicken → State `{status: "ready", data: {...}}` ansehen;
   `DashboardContent` → Props.
5. DevTools → Network → `evidence.json` blockieren („Block request URL“) → Reload → Warnbanner
   „Case data could not be loaded: Failed to fetch“ statt kaputtem Dashboard (bei einem echten 404
   lautet die Meldung „evidence.json: HTTP 404“).
6. Code: `DashboardPage.tsx` neben `js/views/dashboard.ts` – JSX statt String-Verkettung.
