# UE4 – Demo 6: Feature-orientierte Ordnerstruktur

> Aufgabe: Den React-Code nach Features ordnen (z. B. `people-locations/`, `timeline/`,
> `dashboard/`, gemeinsames `components/`) statt in einem flachen Ordner, inklusive Dashboard und
> Shell aus Übung 3. Die Struktur kurz dokumentieren (README-Abschnitt reicht) samt der Regel, was
> „shared“ und was „feature-lokal“ ist.
>
> Skript: Kapitel 16, _React Component Design and Routing_.

---

## 1. Was geändert wurde

Nur **verschoben** (`git mv`, Git erkennt alles als Umbenennung) und Import-Pfade angepasst. Kein
Verhalten geändert. Geprüft: `typecheck`, `lint`, `build` grün. Im Browser rendern Dashboard,
People, Locations, Timeline, Evidence-Platzhalter und Not-Found wie vorher.

### Vorher (nach Typ sortiert)

```
src/
├─ App.tsx, PageRouter.tsx, main.tsx
├─ components/   21 Dateien gemischt: Header, NavBar, Badge, StatCard, PersonCard, TimelineList, …
├─ pages/        DashboardPage, PeoplePage, TimelinePage, EvidencePage, WorkspacePage, NotFoundPage
├─ hooks/        useHashRoute
├─ lib/          routes.ts, badges.ts
└─ data/         Provider + Contexts
```

### Nachher (nach Feature sortiert)

```
src/
├─ main.tsx
├─ shell/                  App, PageRouter, routes.ts, useHashRoute,
│                          Header, NavBar, NavButton, Footer, LoadingOverlay, NotFoundPage
├─ data/                   (unverändert) CaseDataProvider, WorkspaceProvider, Contexts
├─ components/             Badge, PagePlaceholder              ← nur was ≥ 2 Features benutzen
└─ features/
   ├─ dashboard/           DashboardPage, IntroCard, CaseSummaryCard, StatCard,
   │                       ReviewProgressBar, RecentEvidenceList, RecentTimelineList,
   │                       MiniListItem, badges.ts
   ├─ people-locations/    PeoplePage, PersonCard, LocationCard, Card
   ├─ timeline/            TimelinePage, TimelineFilters, TimelineList, TimelineItem
   ├─ evidence/            EvidencePage (Platzhalter)
   └─ workspace/           WorkspacePage (Platzhalter)
```

Dokumentiert im **README** (Abschnitt „React source structure“, auf Englisch wie der Rest der
README).

### Die Regel für „shared“ vs. „feature-lokal“

1. Eine Datei liegt **zuerst im Feature-Ordner**, das sie benutzt.
2. Sie wandert erst nach `components/` (UI) bzw. `data/` (Daten), wenn ein **zweites** Feature sie
   importiert.
3. **Features importieren nie voneinander.** Nur von `shell/`, `data/`, `components/` (und den
   gemeinsamen Typen/Helfern aus `js/`).
4. `shell/` ist alles, was **die App als Ganzes** ausmacht und auf jeder Seite da ist (Rahmen,
   Navigation, Routing).

Angewendet (mit `grep` geprüft, wer was importiert):

| Datei                      | Benutzt von                       | Ergebnis                             |
| -------------------------- | --------------------------------- | ------------------------------------ |
| `Badge`                    | Dashboard **und** Timeline        | shared → `components/`               |
| `PagePlaceholder`          | Evidence **und** Workspace        | shared → `components/`               |
| `Card`                     | nur People & Locations            | lokal → `features/people-locations/` |
| `MiniListItem`             | nur Dashboard                     | lokal → `features/dashboard/`        |
| `badges.ts` (`statusTone`) | nur `RecentEvidenceList`          | lokal → `features/dashboard/`        |
| `routes.ts`                | Shell, IntroCard, PagePlaceholder | gehört zum Routing → `shell/`        |

`lib/` und `hooks/` sind dadurch weggefallen. Sie hatten je nur eine bzw. zwei Dateien, die klar zu
einem Bereich gehören.

---

## 2. Fragen

### F1: „Nach Typ“ vs. „nach Feature“ – und warum diese Struktur für diese App?

**Nach Typ** (vorher): `components/`, `pages/`, `hooks/`, `lib/`. Ordner sagen, **was für eine
Art** Datei es ist.

- ➕ Bei sehr kleinen Projekten einfach, man muss nichts entscheiden.
- ➖ Eine Änderung an „der Timeline“ betrifft Dateien in `pages/`, `components/` und vielleicht
  `lib/`. Man springt zwischen Ordnern.
- ➖ `components/` wird zur Schublade mit allem: Hier lagen `Header` (Shell), `StatCard`
  (Dashboard), `PersonCard` (People) und `Badge` (überall) nebeneinander. Am Ordner sieht man
  nicht, was wozu gehört und was wiederverwendbar ist.
- ➖ Löschen ist riskant: Ob `MiniListItem` noch woanders gebraucht wird, muss man suchen.

**Nach Feature** (jetzt): Ordner sagen, **zu welchem Teil der App** eine Datei gehört.

- ➕ Alles für die Timeline liegt in `features/timeline/`. Eine Änderung an der Timeline bleibt in
  einem Ordner.
- ➕ Was in `components/` liegt, ist **per Definition** geteilt. Wer dort etwas ändert, weiß, dass
  mehrere Features betroffen sind.
- ➕ Ein Feature lässt sich als Ganzes löschen oder ersetzen.
- ➖ Man muss bei jeder neuen Datei entscheiden, wohin. Dafür gibt es die Regel oben.

**Warum für diese App:** Die App **ist** schon in Features aufgeteilt: 5 Views, die in der
Navigation stehen und in der Vanilla-Version je eine Datei in `js/views/` haben. Die Migration nach
React läuft **View für View** (UE3: Dashboard, UE4: People + Timeline, UE5: Evidence + Workspace).
Mit Feature-Ordnern ist jeder Migrationsschritt ein eigener Ordner, und die Platzhalter
(`features/evidence/`, `features/workspace/`) zeigen schon, wo der Code aus Übung 5 hinkommt. Die
Struktur passt also zu den Views, die die App ohnehin hat.

### F2: Wo liegt die Grenze zwischen feature-lokal und shared? Je ein echtes Beispiel.

Die Grenze ist **„wird von mehr als einem Feature importiert“**, nicht „könnte man allgemein
benutzen“.

- **Shared: `components/Badge.tsx`.** Benutzt von `features/dashboard/` (`CaseSummaryCard`,
  `RecentEvidenceList`: Review-Status) **und** `features/timeline/` (`TimelineItem`:
  Certainty). Würde `Badge` in einem Feature-Ordner liegen, müsste das andere Feature quer
  hineingreifen, und das verbietet Regel 3.
- **Feature-lokal: `features/people-locations/Card.tsx`.** `Card` ist von der Art her ein
  generischer Rahmen und sähe in `components/` „richtig“ aus. Benutzt wird er aber **nur** von
  `PersonCard` und `LocationCard`, und seine Varianten (`"person" | "location"`) sind genau die
  zwei dieses Features. Also bleibt er lokal. Braucht später ein zweites Feature eine Karte, wird er
  verschoben **und** dabei allgemeiner gemacht.
- Ähnlich: `MiniListItem` (Kommentar sagt „später auch Workspace“). Solange das nicht passiert ist,
  liegt es in `features/dashboard/`.

Warum nicht „auf Vorrat“ shared machen: In `components/` wird jede Änderung für alle Features
riskant, und man neigt dazu, die Komponente für hypothetische Fälle zu verallgemeinern. Lokal kann
man sie frei an das eine Feature anpassen.
