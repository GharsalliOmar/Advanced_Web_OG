# UE4 – Demo 5: Presentational vs. Feature-Komponenten, Komponentengrenzen

> Aufgabe: Jede bisher gebaute Komponente als „presentational“ oder „feature/container“
> einordnen und begründen. Mindestens eine Komponente finden, die mehr als eine Aufgabe hat, und sie
> mit klarer Grenze in zwei aufteilen.
>
> Skript: Kapitel 16, _React Component Design and Routing_ (PDF S. 110–114).

---

## 1. Die Regel

> **Feature-Komponente:** holt sich selbst etwas von **außerhalb** ihrer Props, also Context
> (`useCaseData`, `useWorkspace`), die URL (`useHashRoute`, später `useParams`/`useSearchParams`)
> oder Browser-APIs (`document.title`). Sie entscheidet, **was** angezeigt wird.
>
> **Presentational-Komponente:** bekommt **alles** über Props und rendert daraus Markup. Kein
> Context, keine URL, kein Laden. Sie entscheidet nur, **wie** etwas aussieht. Gleiche Props →
> gleiches Ergebnis.

Kurz: **„Benutzt die Komponente einen Hook, der etwas von außen liest?“** Ja → Feature.
Nein → presentational. Rechnen, Formatieren oder Nachschlagen aus den eigenen Props (z. B.
`formatDate`, `locations.find`) ist in presentational erlaubt, weil es nichts von außen braucht.

---

## 2. Einordnung aller Komponenten

### Feature / Container

| Komponente          | Liest von außen                                       | Aufgabe                                                   |
| ------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `App`               | URL (`useHashRoute`), `useCaseData`, `document.title` | Shell zusammensetzen, Ladeoverlay, Seitentitel            |
| `PageRouter`        | – (bekommt Route als Prop), wählt aber die Seite      | Route → Seite. Grenzfall, eher Feature: entscheidet _was_ |
| `CaseDataProvider`  | `fetch` (JSON-Dateien)                                | Daten laden und per Context bereitstellen                 |
| `WorkspaceProvider` | `localStorage`                                        | Bookmarks bereitstellen                                   |
| `DashboardPage`     | `useCaseData`, `useWorkspace`                         | Ladezustand prüfen, Daten weitergeben                     |
| `PeoplePage`        | `useCaseData`                                         | Ladezustand prüfen, Tab → richtige Liste                  |
| `TimelinePage`      | `useCaseData`                                         | Ladezustand prüfen, Typen ableiten, Daten weitergeben     |

### Presentational

| Komponente                                                                      | Bekommt                         | Zeigt                                                  |
| ------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------ |
| `Header`, `NavBar`, `NavButton`                                                 | `activeView`                    | Kopfzeile + Navigation                                 |
| `Footer`, `LoadingOverlay`                                                      | –                               | Fußzeile, Ladeanzeige                                  |
| `NotFoundPage`                                                                  | `requested`                     | „Page not found“                                       |
| `PagePlaceholder` (+ `EvidencePage`, `WorkspacePage`)                           | `title`, `vanillaView`, …       | Hinweis „noch nicht migriert“                          |
| `DashboardContent` (in `DashboardPage.tsx`)                                     | `data`, `bookmarkCount`         | Dashboard-Inhalt. Rechnet, liest aber nichts von außen |
| `IntroCard` (+ `HowToItem`), `CaseSummaryCard`, `StatCard`, `ReviewProgressBar` | Props                           | Dashboard-Bausteine                                    |
| `RecentEvidenceList`, `RecentTimelineList`, `MiniListItem`                      | `items` / `heading`, `children` | Kurzlisten                                             |
| `Badge`                                                                         | `tone`, `children`              | Farbiges Label                                         |
| `Card`                                                                          | `variant`, `children`           | Kartenrahmen                                           |
| `PersonCard`, `LocationCard`                                                    | `person` / `location`           | Eine Karte                                             |
| `TimelineItem`                                                                  | `event`, `locationNames`        | Ein Timeline-Eintrag                                   |
| **`TimelineFilters`** (neu, Split)                                              | `people`, `locations`, `types`  | Filterleiste                                           |
| **`TimelineList`** (neu, Split)                                                 | `events`, `locations`           | Liste oder Leerzustand                                 |

Auffällig: **Fast alles ist presentational.** Nur die Seiten (und die Shell) holen Daten. Daten
fließen von oben (Context → Seite) über Props nach unten. Das war schon die Hierarchie aus
UE3 Demo 7.

---

## 3. Der Split: `TimelinePage` → `TimelinePage` + `TimelineFilters` + `TimelineList`

**Vorher** (Demo 1–4) hat `TimelinePage` vier Dinge in einer Funktion gemacht:

1. Daten aus dem Context holen und den Ladezustand prüfen
2. ableiten, was angezeigt wird (Event-Typen entdoppeln)
3. die komplette Filterleiste rendern (4 `<select>`s, ~35 Zeilen JSX)
4. die Liste inkl. Leerzustand und Orts-Nachschlagen rendern

**Nachher:**

```tsx
// TimelinePage.tsx (feature)
<section className="view active">
  <h2>Investigation Timeline</h2>
  <TimelineFilters people={people} locations={locations} types={types} />
  <TimelineList events={timeline} locations={locations} />
</section>
```

| Datei                                | Einzige Aufgabe                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `src/pages/TimelinePage.tsx`         | **Was** gezeigt wird: Daten holen, Ladezustand, Typen ableiten, verteilen        |
| `src/components/TimelineFilters.tsx` | **Wie die Filterleiste aussieht**, aus übergebenen Auswahlmöglichkeiten          |
| `src/components/TimelineList.tsx`    | **Wie die Liste aussieht**: Einträge in übergebener Reihenfolge oder Leerzustand |

Die Grenze ist genau die aus der Regel oben: alles mit `useCaseData` bleibt in der Seite, alles
reine Markup wandert in Komponenten mit Props.

Kein neues Verhalten, nur umverteilt (im Browser geprüft: 15 Events, 4 Dropdowns, wie vorher).

---

## 4. Fragen

### F1: Die einzige Aufgabe jeder Hälfte – und beeinflusst eine Änderung in der einen die andere?

Die Aufgaben stehen in der Tabelle oben. Die Hälften berühren sich **nur über die Props**:

- `TimelineList` bekommt `events: TimelineEvent[]` und weiß nicht, **woher** sie kommen.
- `TimelinePage` übergibt eine Liste und weiß nicht, **wie** sie gezeichnet wird.

**Beispiele für Änderungen, die die andere Hälfte nicht betreffen:**

- **Demo 10 (direkt sichtbar):** Die Seite filtert die Liste nach `?person=…` aus der URL. Das ist
  eine Änderung **nur in `TimelinePage`** (`events={filtered}` statt `events={timeline}`).
  `TimelineList` bleibt unverändert, weil sie eine gefilterte Liste genauso zeichnet wie eine
  ungefilterte. Auch der Leerzustand funktioniert dann automatisch.
- Wenn die Daten in Übung 5 aus einer API statt aus JSON kämen, ändert sich nur der Provider bzw.
  die Seite.
- Wenn die Liste umgestaltet wird (z. B. als Tabelle statt Karten), ändert sich nur `TimelineList`.
  Die Seite übergibt dieselben Props.

**Was beide betrifft:** eine Änderung **an der Schnittstelle**, also an den Props selbst. Braucht
die Liste z. B. zusätzlich die Personen (Demo 9), muss die Seite sie mitgeben. Dann meldet
TypeScript sofort alle Aufrufer, bei denen die neue Prop fehlt. Die Kopplung ist also **genau**
der Props-Typ, nicht mehr.

Vorher, als alles in einer Funktion stand, waren Filterlogik und Markup verschränkt: Wer die Liste
umbaut, liest zwangsläufig an der Datenlogik vorbei und umgekehrt.

### F2: Konkrete Regel „presentational vs. feature“

> **Hängt das Ergebnis nur von den Props ab?** Dann presentational.
> **Braucht die Komponente einen Hook, der Context, URL, Browser-APIs oder Netzwerk liest?**
> Dann Feature, und sie sollte so weit oben wie möglich sitzen (bei uns: die Seite).

Praktischer Test: **Könnte ich die Komponente in einer leeren Testseite mit ausgedachten Props
rendern, ohne Provider oder Router drumherum?** `TimelineList` mit 2 erfundenen Events: ja →
presentational. `TimelinePage`: nein, sie wirft ohne `<CaseDataProvider>` einen Fehler →
Feature.

Folge der Regel: Presentational-Komponenten sind **wiederverwendbar** (`Badge` in Dashboard **und**
Timeline) und leicht zu testen. Feature-Komponenten sind die wenigen Stellen, an denen man schauen
muss, wenn falsche Daten ankommen.
