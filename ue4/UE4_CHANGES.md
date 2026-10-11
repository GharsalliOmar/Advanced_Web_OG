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
