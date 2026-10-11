# UE4 – Änderungsprotokoll

Laufende Liste aller Code-Änderungen in Übung 4, Demo für Demo. Die Erklärungen und Antworten auf die
Fragen stehen in den einzelnen `UE4_DEMO*.md`-Dateien.

Grundsatz dieser Übung: **nur so viel Code wie die Aufgabe verlangt.** Kein `useState`, kein
`innerHTML`, keine manuelle DOM-Erzeugung. Evidence und Workspace bleiben Platzhalter (Übung 5).

---

## Demo 1 – JSX, typisierte Props, `children`

**Neu**

- `src/components/Card.tsx`: Rahmen mit `children` (Composition), `variant: "person" | "location"`
- `src/components/PersonCard.tsx`: Props `person: Person`
- `src/components/LocationCard.tsx`: Props `location: Location`
- `src/components/TimelineItem.tsx`: Props `event: TimelineEvent`, `locationNames: string[]`

**Geändert**

- `src/pages/PeoplePage.tsx`: Platzhalter → echte Seite, rendert alle Personen und Orte
- `src/pages/TimelinePage.tsx`: Platzhalter → echte Seite mit Filterleiste (nur Optik, kein
  `onChange`) und allen Einträgen

---

## Demo 2 – Bedingtes Rendern

**Geändert**

- `src/pages/PeoplePage.tsx`: Prop `tab: "people" | "locations"`. Tab-Leiste als `<a href>`-Links
  (Klasse `active` per Ternary). Es wird nur eine der beiden Listen gerendert (Ternary).
- `src/PageRouter.tsx`: gibt `tab` aus dem Hash-Param weiter (`#people/locations` → Locations)
- `src/components/TimelineItem.tsx`: Certainty als `<Badge>`, Farbe per Lookup-Tabelle
  `CERTAINTY_TONE` (ersetzt `certaintyBadgeClass()`). „Location:“-Zeile nur per `&&`, wenn Orte
  da sind.
- `src/pages/TimelinePage.tsx`: Leerzustand „No timeline events match …“ per Ternary
- `styles.css`: `a.tab-btn` wie `a.btn` (keine Unterstreichung) + `color: inherit`

---

## Demo 3 – Listen rendern

Kein neuer Code. Die drei gemappten Listen (`people`, `locations`, `timeline`, jeweils mit
`key={….id}`) gibt es schon seit Demo 1. Nur Doku.

---

## Demo 4 – Stabile Keys

**Neu**

- `ue4/demo4-keys/index.html`: Wegwerf-Sandbox (React per CDN, nicht Teil der App). Dieselbe
  Liste zweimal mit `key={index}` vs. `key={evt.id}`, Buttons zum Umdrehen/Entfernen. Zeigt, dass
  Eingaben bei `key={index}` beim falschen Event landen.

Im App-Code keine Änderung. Dort stehen seit Demo 1 überall die echten ids als Key. Bewusst
`key={index}` nur bei den reinen Text-Listen in `PersonCard`/`LocationCard` (siehe Demo 4 F3).

---

## Demo 5 – Presentational vs. Feature, Split

**Neu**

- `src/components/TimelineFilters.tsx`: die Filterleiste (presentational, Props `people`,
  `locations`, `types`)
- `src/components/TimelineList.tsx`: Liste + Leerzustand (presentational, Props `events`,
  `locations`)

**Geändert**

- `src/pages/TimelinePage.tsx`: nur noch Feature-Komponente (Daten holen, Ladezustand, Typen
  ableiten). Das Markup steckt jetzt in den zwei neuen Komponenten. Verhalten unverändert.

---

## Demo 6 – Feature-Ordner

**Verschoben** (`git mv`, nur Import-Pfade angepasst, kein Verhalten geändert)

- `src/App.tsx`, `src/PageRouter.tsx`, `src/hooks/useHashRoute.ts`, `src/lib/routes.ts`, `Header`,
  `NavBar`, `NavButton`, `Footer`, `LoadingOverlay`, `NotFoundPage` → `src/shell/`
- Dashboard-Seite + alle ihre Bausteine (inkl. `MiniListItem`, `lib/badges.ts`) →
  `src/features/dashboard/`
- `PeoplePage`, `PersonCard`, `LocationCard`, `Card` → `src/features/people-locations/`
- `TimelinePage`, `TimelineFilters`, `TimelineList`, `TimelineItem` → `src/features/timeline/`
- `EvidencePage` → `src/features/evidence/`, `WorkspacePage` → `src/features/workspace/`
- In `src/components/` bleiben nur `Badge` und `PagePlaceholder` (von ≥ 2 Features benutzt)
- `src/pages/`, `src/hooks/`, `src/lib/` sind dadurch leer und entfernt

**Geändert**

- `src/main.tsx`: Import `./shell/App`
- `README.md`: neuer Abschnitt „React source structure“ mit Baum und Shared-vs-lokal-Regel

---

## Demo 7 – Wiederverwendbare UI

**Neu**

- `src/features/people-locations/BulletList.tsx`: `<ul>` aus einem `string[]` (Props
  `items: string[]`)

**Geändert**

- `PersonCard.tsx`: eigene `<ul>`-Schleife → `<BulletList items={person.responsibilities} />`
- `LocationCard.tsx`: eigene `<ul>`-Schleife → `<BulletList items={location.contains} />`
- `ue4/UE4_DEMO4_STABLE_KEYS.md`: Code-Beispiel in F3 auf `BulletList` aktualisiert
