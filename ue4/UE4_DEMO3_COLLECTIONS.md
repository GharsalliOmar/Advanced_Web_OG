# UE4 – Demo 3: Listen rendern

> Aufgabe: Personen-, Orts- und Timeline-Liste jeweils als gemappte Sammlung von Komponenten
> rendern, jede mit einer passenden `key`-Prop.
>
> Skript: Kapitel 15, _React Foundations_.

---

## 1. Was gebaut wurde

**Kein neuer Code in diesem Commit.** Die drei Listen gibt es schon seit Demo 1. Ohne sie hätten
die Komponenten aus Demo 1 keine „echte Stelle“ in der App gehabt. Hier ist nur dokumentiert, wo
sie stehen:

| Liste    | Datei                        | Code                                                                     |
| -------- | ---------------------------- | ------------------------------------------------------------------------ |
| Personen | `src/pages/PeoplePage.tsx`   | `people.map((person) => <PersonCard key={person.id} person={person} />)` |
| Orte     | `src/pages/PeoplePage.tsx`   | `locations.map((location) => <LocationCard key={location.id} … />)`      |
| Timeline | `src/pages/TimelinePage.tsx` | `timeline.map((evt) => <TimelineItem key={evt.id} event={evt} … />)`     |

Die `key`s sind die **ids aus den Daten** (`"nova-byte"`, `"L03"`, `"T07"`). Die sind eindeutig
und ändern sich nie, egal wie die Liste sortiert oder gefiltert wird.

Weitere gemappte Listen mit stabilen Keys:

- Filter-Dropdowns in `TimelinePage.tsx`: `<option key={p.id}>`, `<option key={l.id}>`,
  `<option key={t}>` (der Typ-String selbst ist eindeutig, weil vorher per `new Set` entdoppelt)
- Aus UE3: `NavBar` (`key={v.name}`), `IntroCard` (`key={item.view}`), Dashboard-Listen
  (`key={ev.id}` / `key={evt.id}`)

Bewusst mit `key={index}`: die Text-Listen **innerhalb** einer Karte
(`person.responsibilities`, `location.contains`). Warum das dort in Ordnung ist, steht in Demo 4 F3.

**Vergleich zur Vanilla-App:** `renderPeople()` baut mit `for` + `html += …` einen langen String
und setzt ihn per `container.innerHTML = html`. Bei jedem Aufruf wird der **gesamte** Inhalt
weggeworfen und neu erzeugt. In React gibt `.map()` ein **Array von Elementen** zurück, und React
entscheidet anhand der `key`s, welche DOM-Knoten bleiben können.

---

## 2. Fragen

### F1: Wofür benutzt React `key` intern?

`key` ist die **Identität** eines Listen-Elements zwischen zwei Renders.

Beim Neu-Rendern vergleicht React die neue Liste mit der alten (Reconciliation, UE3 Demo 3). Ohne
Keys kann es nur nach **Position** vergleichen: „Element 0 alt“ ↔ „Element 0 neu“. Mit Keys
vergleicht es nach **Name**: „`T07` alt“ ↔ „`T07` neu“, egal an welcher Stelle `T07` jetzt steht.

Daraus folgt für jedes Element der neuen Liste:

| Fall                                | Was React tut                                                                                                                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key gab es vorher auch              | **Wiederverwenden:** derselbe DOM-Knoten, dieselbe Komponenten-Instanz (inkl. State), nur geänderte Props werden eingetragen. Steht er woanders, wird der Knoten **verschoben**, nicht neu gebaut. |
| Key ist neu                         | Neue Komponente **erzeugen** (mount), neuen DOM-Knoten einfügen                                                                                                                                    |
| Key gab es vorher, jetzt nicht mehr | Komponente **entfernen** (unmount), DOM-Knoten löschen, ihr State ist weg                                                                                                                          |

Wichtig:

- `key` ist **keine normale Prop**. Die Komponente bekommt sie nicht zu sehen
  (`props.key` ist `undefined`). Sie ist nur für React selbst.
- Keys müssen nur **unter Geschwistern** eindeutig sein, nicht in der ganzen App.
- Ändert man den Key eines Elements absichtlich, wirft React es weg und baut es neu. Das ist ein
  bekannter Trick zum „Zurücksetzen“ einer Komponente (wird in Demo 10 benutzt).

Fehlt der Key ganz, nimmt React intern den Index und gibt in der Konsole eine Warnung aus
(„Each child in a list should have a unique "key" prop“). Was dann schiefgehen kann, zeigt Demo 4.
