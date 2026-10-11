# UE4 – Demo 1: JSX, Funktionskomponenten, typisierte Props, Composition & `children`

> Aufgabe: Mindestens 3 kleine Komponenten für People & Locations bzw. Timeline mit JSX und
> explizit typisierten Props bauen (kein `any`). Mindestens eine Komponente bauen, die `children`
> statt einer Daten-Prop bekommt, und sie an einer echten Stelle benutzen.
>
> Skript: Kapitel 15, _React Foundations_ (PDF S. 104–106).

**Öffnen:** `npm run dev` → <http://localhost:5173/Advanced_Web_OG/react.html#people> bzw.
`#timeline`

---

## 1. Was gebaut wurde

| Datei                             | Props (typisiert)                                 | Aufgabe                                                      |
| --------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `src/components/Card.tsx`         | `variant: "person" \| "location"`, `children`     | **Composition:** nur der Kasten, Inhalt kommt als `children` |
| `src/components/PersonCard.tsx`   | `person: Person`                                  | Eine Personenkarte (Bild, Rolle, Aufgaben, Aussage)          |
| `src/components/LocationCard.tsx` | `location: Location`                              | Eine Ortskarte (Name, Beschreibung, „Contains“-Liste)        |
| `src/components/TimelineItem.tsx` | `event: TimelineEvent`, `locationNames: string[]` | Ein Timeline-Eintrag                                         |
| `src/pages/PeoplePage.tsx`        | –                                                 | Platzhalter ersetzt: liest Daten, rendert alle Karten        |
| `src/pages/TimelinePage.tsx`      | –                                                 | Platzhalter ersetzt: Filter-Leiste (nur Optik) + Einträge    |

Die Typen `Person`, `Location`, `TimelineEvent` kommen unverändert aus `js/types.ts` (dieselben, die
auch die Vanilla-App benutzt) – eine Definition des Datenmodells für beide Versionen.

**`Card` an einer echten Stelle:** `PersonCard` und `LocationCard` benutzen beide `<Card>` als
äußeren Rahmen:

```tsx
<Card variant="person">
  <div className="person-card-header">…</div>
  <p>…</p>
</Card>
```

Die Timeline-Filter (`<select>`s) sind laut Angabe **nur optisch vollständig**: sie haben
`defaultValue`, aber kein `onChange`. Ein Wechsel ändert also nichts an der Liste (das ist
Übung 5).

Gleiches Markup und gleiche CSS-Klassen wie `renderPeople()`, `renderLocations()` und
`renderTimeline()` in `js/views/` → beide Versionen sehen gleich aus, ohne neues CSS.

---

## 2. Fragen

### F1: Ein JSX-Ausdruck, der einen JavaScript-Wert einbettet – was darf in `{…}`?

Beispiele aus dem Code:

```tsx
// PersonCard.tsx – Wert aus einem Objekt
<h3>{person.name}</h3>

// PersonCard.tsx – berechneter String als Attribut
<img src={import.meta.env.BASE_URL + person.avatar} alt={"Portrait of " + person.name} />

// TimelineItem.tsx – Funktionsaufruf und Array-Methode
{formatDate(event.time)}
Location: {locationNames.join(", ")}

// TimelinePage.tsx – ein Array von JSX-Elementen (aus .map)
{timeline.map((evt) => <TimelineItem key={evt.id} … />)}
```

**Was in `{…}` darf:** jeder JavaScript-**Ausdruck**, also alles, was einen Wert ergibt:
Variablen, Property-Zugriffe, Funktionsaufrufe, Rechnungen, String-Verkettung, Ternary
`a ? b : c`, `a && b`, `.map(...)`, Template-Strings.

**Was nicht darf:** **Anweisungen** (Statements), also `if`, `for`, `while`, `switch`,
Variablendeklarationen (`const x = …`). Grund: JSX wird zu Funktionsaufrufen übersetzt
(`<h3>{x}</h3>` → `jsx("h3", { children: x })`), und ein Funktionsargument muss ein Ausdruck sein.
Ein `if` ist kein Wert. Deshalb benutzt man in JSX `? :` statt `if` und `.map` statt `for`.

**Was gerendert wird:** Strings und Zahlen als Text, JSX-Elemente, Arrays davon.
`null`, `undefined`, `true` und `false` erscheinen **gar nicht** (wichtig für `&&`, siehe Demo 2).
Ein normales **Objekt** (z. B. `{person}`) ist ein Fehler („Objects are not valid as a React
child“). Das ist das React-Gegenstück zum `[object Object]`-Bug aus UE1, nur dass React es laut
meldet statt still Unsinn anzuzeigen.

**Wichtig für Sicherheit:** Text in `{…}` wird von React **escaped**. Steht in den Daten
`<script>`, erscheint das als Text auf der Seite. Die Vanilla-Version mit `innerHTML += person.name`
hätte das als HTML ausgeführt.

### F2: Was fängt TypeScript bei falschen Props? (echter Fehler vorgeführt)

Probe: eine `Location` als `person` übergeben und `PersonCard` ganz ohne Prop aufrufen.

```tsx
<PersonCard person={loc} />   // loc: Location
<PersonCard />
```

`npx tsc --noEmit` meldet:

```
error TS2740: Type 'Location' is missing the following properties from type 'Person':
              role, speciality, responsibilities, statement, and 2 more.
error TS2741: Property 'person' is missing in type '{}' but required in type 'PersonCardProps'.
```

TypeScript prüft also schon **beim Bauen**:

- **falsche Form** der Daten (fehlende Felder, falscher Typ),
- **fehlende Pflicht-Props**,
- **Tippfehler** im Prop-Namen (`<PersonCard persn={…}>` → „Property 'persn' does not exist“),
- **ungültige Werte** bei Union-Typen: `<Card variant="evidence">` geht nicht, weil `variant` nur
  `"person" | "location"` sein darf (es gibt auch nur für diese beiden CSS).

Ohne Typen würde die App erst **im Browser** kaputtgehen, z. B. mit
`Cannot read properties of undefined (reading 'map')` bei `person.responsibilities.map`.

**Grenze:** TypeScript prüft nur den Code, nicht die JSON-Daten zur Laufzeit. Wenn
`people.json` falsche Werte hätte, merkt das kein Typ (das ist dasselbe Thema wie in UE2 Demo 6).

### F3: Daten als benannte Prop vs. als `children` – warum `children` bei `Card`?

|                                 | Benannte Prop (`person={…}`)                               | `children`                                 |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Wer bestimmt das Markup?        | Die **Komponente**: sie bekommt Daten und baut daraus HTML | Der **Aufrufer**: er übergibt fertiges JSX |
| Was muss die Komponente wissen? | Die Form der Daten (`Person`)                              | Nichts über den Inhalt                     |
| Typisch für                     | Komponenten, die _eine bestimmte Sache_ darstellen         | Rahmen, Layouts, Wrapper                   |

`PersonCard` bekommt `person`, weil sie genau weiß, wie eine Person aussieht.

`Card` bekommt `children`, weil sie **nur der Rahmen** ist. Eine Personenkarte und eine Ortskarte
haben völlig verschiedenen Inhalt, aber denselben Kasten. Mit `children` muss `Card` weder `Person`
noch `Location` kennen. Hätte `Card` stattdessen eine Prop `person` und eine Prop `location`,
müsste sie für jede neue Art von Inhalt erweitert werden. Mit `children` geht jeder Inhalt, ohne
`Card` anzufassen.

Die Komponenten werden also **zusammengesteckt** (Composition) statt eine große Komponente mit
vielen Sonderfällen zu bauen.

### F4: Warum verträgt sich direkte DOM-Manipulation nicht mit React?

React geht davon aus, dass **React allein den DOM unter `#root` besitzt**.

So funktioniert ein Render: React hält eine Beschreibung des letzten Ergebnisses (Virtual DOM,
UE3 Demo 3). Bei einer Änderung baut es die neue Beschreibung, vergleicht sie mit der alten und
ändert im echten DOM **nur die Unterschiede**. Dafür muss Reacts Bild vom DOM stimmen.

Was passiert, wenn man selbst eingreift, wie die alte `app.js` es ständig tat:

- **`innerHTML = …`** ersetzt Knoten, die React noch für „seine“ hält. Beim nächsten Render will
  React einen Knoten ändern, der gar nicht mehr existiert → Fehler oder Inhalt verschwindet bzw.
  wird doppelt angezeigt.
- **`classList.add("active")`** wird beim nächsten Render stillschweigend überschrieben, weil
  React `className` aus den Props neu setzt. Die Änderung „flackert“ weg, oder sie bleibt, weil
  React keinen Unterschied sieht, und stimmt dann nicht mehr mit dem Zustand überein.
- **`appendChild`** fügt Knoten ein, die React nicht kennt. Die Listen-Zuordnung (Keys, Demo 3)
  stimmt dann nicht mehr.

Der Kern: In der Vanilla-App sagt man dem DOM **Schritt für Schritt, was zu tun ist** (imperativ).
In React **beschreibt** man, wie das Ergebnis für die aktuellen Daten aussehen soll (deklarativ),
und React erledigt die Schritte. Zwei „Besitzer“ desselben DOM, die beide schreiben, laufen
auseinander. Deshalb gilt in dieser Übung: kein `innerHTML`, kein `createElement`/`appendChild`.
