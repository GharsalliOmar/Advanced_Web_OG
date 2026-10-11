# UE4 – Demo 2: Bedingtes Rendern

> Aufgabe: Mindestens zwei echte Fälle von bedingtem Rendern in den migrierten Views (z. B. ein
> Leerzustand und ein zustandsabhängiger Stil/Label wie der aktive Tab oder die Farbe eines
> Certainty-Badges). Dabei mindestens zwei verschiedene Techniken benutzen (Ternary, `&&`, Early
> Return, Lookup) und begründen können, welche wo.
>
> Skript: Kapitel 15, _React Foundations_.

**Öffnen:** `#people`, `#people/locations`, `#timeline`

---

## 1. Was gebaut wurde

| Fall                                   | Wo                                          | Technik                          |
| -------------------------------------- | ------------------------------------------- | -------------------------------- |
| Aktiver Tab (Klasse `active`)          | `PeoplePage.tsx`, die zwei Tab-Links        | **Ternary** im `className`       |
| People- **oder** Locations-Liste       | `PeoplePage.tsx`                            | **Ternary** mit zwei JSX-Zweigen |
| Leerzustand „No timeline events match“ | `TimelinePage.tsx`                          | **Ternary** (Hinweis oder Liste) |
| Farbe des Certainty-Badges             | `TimelineItem.tsx`, `CERTAINTY_TONE`        | **Lookup-Tabelle** (`Record`)    |
| „Location:“-Zeile nur wenn vorhanden   | `TimelineItem.tsx`                          | **`&&`**                         |
| Daten noch nicht geladen / Fehler      | `PeoplePage.tsx`, `TimelinePage.tsx` (oben) | **Early Return** (`null`)        |

### Tabs ohne `useState`

Der aktive Tab ist **kein State**, sondern kommt aus der URL:

- `#people` → People-Tab
- `#people/locations` → Locations-Tab

`PageRouter.tsx` liest den Teil nach dem `/` (das `param` aus dem bestehenden Hash-Router aus UE3)
und gibt ihn als Prop weiter: `<PeoplePage tab={route.param === "locations" ? "locations" : "people"} />`.
Die Tabs sind `<a href>`-Links statt `<button onclick>`. Ein Klick ändert nur den Hash, React rendert
neu. So bleibt die Regel „kein State über das Nötige hinaus“ eingehalten. In Demo 8 wird das auf
React Router (`/team/people`, `/team/locations`) umgestellt.

**CSS:** `a.tab-btn` zu `a.nav-btn, a.btn` dazugenommen (keine Unterstreichung) und
`color: inherit`, damit der inaktive Tab nicht link-blau ist (`styles.css`).

### Warum welche Technik wo

- **Ternary `a ? b : c`**: wenn es **zwei** sinnvolle Ergebnisse gibt. Beim Tab braucht die Klasse
  in beiden Fällen einen Wert (`"tab-btn active"` / `"tab-btn"`), und es wird immer genau eine der
  beiden Listen gezeigt. Beim Leerzustand: entweder Hinweis oder Liste, nie beides.
- **`&&`**: wenn es nur „anzeigen oder **nichts**“ gibt. Die Location-Zeile hat keinen
  sinnvollen „sonst“-Inhalt.
- **Lookup-Tabelle**: wenn ein Wert aus **mehreren** Möglichkeiten auf einen anderen abgebildet
  wird. Statt der `if`-Kette aus `certaintyBadgeClass()` (Vanilla) ein Objekt:
  ```ts
  const CERTAINTY_TONE: Record<Certainty, BadgeTone> = {
    confirmed: "reviewed",
    reported: "flagged",
    contradictory: "critical",
  };
  ```
  `Record<Certainty, …>` heißt: für **jeden** Wert von `Certainty` muss ein Eintrag da sein. Kommt
  später ein vierter Wert dazu, meldet TypeScript die fehlende Zeile. Bei der `if`-Kette würde er
  still in den `return "unreviewed"`-Fall fallen.
- **Early Return**: wenn die **ganze** Komponente in einem Fall nichts Sinnvolles zeigen kann. Ohne
  geladene Daten gibt es keine Liste. Nach dem `if (…) return` weiß TypeScript außerdem, dass
  `caseData.data` existiert (Type Narrowing), deshalb steht die Prüfung ganz oben.

Der Leerzustand ist mit den echten Daten (15 Events, kein Filter) gerade nicht sichtbar. In Demo 10
wird die Liste per `?person=…` gefiltert. Dann ist er mit einer unbekannten Person erreichbar.

---

## 2. Fragen

### F1: `condition && <Component />` statt Ternary – was, wenn `condition` die Zahl `0` ist?

Die Stelle im Code (`TimelineItem.tsx`):

```tsx
{
  locationNames.length > 0 && <p className="evidence-meta">Location: …</p>;
}
```

So funktioniert `&&` in JavaScript: `a && b` gibt **`a` selbst** zurück, wenn `a` falsy ist,
sonst `b`. Es gibt also nicht `true`/`false` zurück, sondern einen der beiden Werte.

React rendert `false`, `null`, `undefined` als **nichts**. Eine Zahl rendert es aber als **Text**,
auch die `0`.

Würde man also schreiben:

```tsx
{
  locationNames.length && <p>Location: …</p>;
}
```

dann ergibt das bei einem leeren Array `0 && …` → `0`, und auf der Seite steht eine einzelne,
sinnlose **„0“** im Timeline-Eintrag.

**Betrifft das unseren Code?** Nein, weil die Bedingung ausdrücklich ein Vergleich ist
(`length > 0`), und der ist immer ein Boolean. Das ist eine bewusste Regel: Links von `&&` steht
**nie eine nackte Zahl**. Alternativen wären `!!length && …` oder eben ein Ternary
`length ? … : null`. Aktuell hat jedes Event in `timeline.json` mindestens einen Ort, der Fall
würde also nur bei neuen Daten auftreten. Genau dann wäre der Bug schwer zu bemerken.

Das gleiche Muster gab es schon in UE3: `{status === "loading" && <LoadingOverlay />}` in `App.tsx`
(auch ein Vergleich, also sicher).

### F2: Warum ist `return null` manchmal besser als ein leeres `<div>`? Wo benutzt?

Benutzt in `PeoplePage.tsx` und `TimelinePage.tsx`:

```tsx
if (caseData.status === "loading") return null;
```

Solange die Daten laden, liegt das `LoadingOverlay` aus `App.tsx` über allem. Die Seite selbst muss
nichts zeigen.

Warum `null` statt `<div></div>`:

- **`null` erzeugt keinen DOM-Knoten.** Ein leeres `<div>` ist ein echtes Element. Es kann
  Abstände, Rahmen oder Grid-Zellen bekommen (`.people-grid` ist ein CSS-Grid; ein leeres Kind
  würde eine Zelle belegen), und `:empty`/`:first-child`-Selektoren verhalten sich anders.
- **Sauberes HTML:** Kein bedeutungsloses Element, das man im DevTools-Baum für „echten“ Inhalt
  halten könnte.
- **Klare Aussage im Code:** `return null` heißt „hier gibt es nichts“. Ein leeres `<div>` sieht
  aus wie ein Platzhalter, der vergessen wurde.

Ein `<div>` (oder eine andere Hülle) ist dann richtig, wenn der **Platz** gebraucht wird, z. B. damit
das Layout nicht springt, wenn der Inhalt später erscheint, oder wenn CSS ein festes Element
erwartet.

Wichtig: `return null` ist nur ein **früher** Ausgang der Funktion. Die Hooks (`useCaseData()`)
stehen **davor**, weil Hooks bei jedem Render in derselben Reihenfolge aufgerufen werden müssen
(Rules of Hooks, prüft ESLint).
