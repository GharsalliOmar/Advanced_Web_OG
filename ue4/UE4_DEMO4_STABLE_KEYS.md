# UE4 – Demo 4: Stabile Keys und Listen-Identität

> Aufgabe: In einem Wegwerf-Beispiel absichtlich `key={index}` benutzen und zeigen (durch
> Umsortieren oder Filtern), dass es ein sichtbar falsches Ergebnis liefert. Danach durch eine
> echte, stabile id ersetzen.
>
> Skript: Kapitel 15, _React Foundations_.

**Öffnen:** `npm run dev` → <http://localhost:5173/Advanced_Web_OG/ue4/demo4-keys/>

---

## 1. Was gebaut wurde

`ue4/demo4-keys/index.html`: eine **Wegwerf-Sandbox** wie die aus UE3 Demo 5 (React per CDN, JSX
per Babel im Browser). Sie ist **nicht Teil der App**, deshalb ist dort `useState` erlaubt. Ohne
eine Änderung an der Liste (Umdrehen/Entfernen) lässt sich der Fehler nicht zeigen, und genau das
ist in der App in dieser Übung noch verboten.

Aufbau:

- 4 echte Timeline-Events (T01–T04)
- jede Zeile (`<Row>`) hat eine **Checkbox** und ein **Notizfeld**. Beide sind _uncontrolled_: ihr
  Wert lebt im DOM-Knoten, nicht in den Props
- **dieselbe** Liste zweimal nebeneinander: links `key={index}`, rechts `key={evt.id}`
- Buttons: „Reihenfolge umdrehen“, „Ersten entfernen“, „Zurücksetzen“

### Vorführung

1. In **beiden** Spalten bei **T01** „Notiz zu T01“ eintippen und das Häkchen setzen.
2. „Reihenfolge umdrehen“ klicken.

Ergebnis (im Browser geprüft):

| Position | Links: `key={index}`                                | Rechts: `key={evt.id}`                                 |
| -------- | --------------------------------------------------- | ------------------------------------------------------ |
| 1        | **T04** – Nova enters storage · ☑ „Notiz zu T01“ ❌ | T04 – Nova enters storage                              |
| 2        | T03                                                 | T03                                                    |
| 3        | T02                                                 | T02                                                    |
| 4        | T01 – Patch raises a concern · (leer) ❌            | **T01** – Patch raises a concern · ☑ „Notiz zu T01“ ✅ |

Links steht die Notiz für T01 jetzt bei **T04**. Der Text (aus den Props) ist gewandert, der
Zustand (aus dem DOM) nicht. Mit „Ersten entfernen“ passiert dasselbe: T01 verschwindet, aber
seine Notiz rutscht zu T02.

### Warum

Links sind die Keys `0, 1, 2, 3`, **vor und nach** dem Umdrehen. Für React heißt das: „Element mit
Key 0 gibt es noch, es hat nur neue Props (`evt` = T04)“. Also behält es die Komponente und ihren
DOM-Knoten (mit Notiz und Häkchen) und tauscht nur den Text aus.

Rechts heißen die Keys `T01…T04`. Nach dem Umdrehen steht `T01` an Position 4. React erkennt das
**selbe** Element, **verschiebt** den DOM-Knoten und die Notiz geht mit.

### Ersetzt durch stabile id

In der App selbst stehen überall die echten ids als Key (`person.id`, `location.id`, `evt.id`,
siehe Demo 3). Das Wegwerf-Beispiel ist nur in der Sandbox. In der rechten Spalte ist die
korrigierte Version zu sehen.

---

## 2. Fragen

### F1: Was geht konkret schief, wenn Keys fehlen, doppelt sind oder der Index sind?

- **Key fehlt:** React nimmt intern den Index und **warnt** in der Konsole
  („Each child in a list should have a unique "key" prop“). Das Verhalten ist dann genau wie bei
  `key={index}`.
- **Key = Index** (bei Liste, die sich umsortiert oder filtert): Die Identität hängt an der
  **Position** statt am Datensatz. Folgen:
  - **Zustand landet beim falschen Element**: eingetippter Text, Häkchen, aufgeklappte
    `<details>`, Fokus, Scroll-Position, `useState` in der Kind-Komponente (siehe Vorführung).
  - **Unnötige Arbeit:** Beim Entfernen des ersten Elements ändert React _alle_ Zeilen (neue Props
    für jede Position) und löscht die letzte, statt einfach die erste zu löschen.
  - **Animationen/Effekte** laufen beim falschen Element (z. B. ein „neu“-Effekt beim Einfügen
    oben würde beim letzten Element ausgelöst).
  - **Keine Warnung!** React sieht eindeutige Keys und ist zufrieden. Der Fehler ist still.
- **Key doppelt:** React **warnt** („Encountered two children with the same key“). Zwei Elemente
  können nicht auseinandergehalten werden. Elemente werden dann doppelt angezeigt, verschwinden
  oder bekommen den Zustand des anderen. Welches Verhalten genau auftritt, ist nicht festgelegt.

### F2: Der Index-als-id-Bug aus der Vanilla-App – in React als `key={index}` sichtbar oder nur eine Warnung?

Der Bug in der Vanilla-App: die **Notizliste im Workspace** (`renderNotesList()`, `app.js` bzw.
`js/views/workspace.ts`). Jede Notiz bekommt als Kennung die **Position** des Evidence-Eintrags im
`allEvidence`-Array, nicht dessen id:

```js
noteEntries.push({ index: i, evidenceId: ev.id, … });
html += '<div id="noteText-' + entry.index + '">' + …;
```

Wird `allEvidence` umsortiert (in UE1 hat das Sortieren das Array direkt verändert, siehe
UE1 Demo 2), gehört `noteText-3` plötzlich zu einem anderen Evidence-Eintrag.

**Direkt nach React übertragen als `key={index}`:**

- **Konsole:** **Gar keine Warnung.** Die Keys sind eindeutig, React meckert nur bei _fehlenden_
  oder _doppelten_ Keys. (Eine Warnung gäbe es nur, wenn man den Key ganz weglässt.)
- **Sichtbarer Fehler? In dieser Form nein.** Die Notizzeilen zeigen nur Text aus den Props
  (`evidenceId`, `title`, `text`) und haben **keinen eigenen Zustand**. Wenn sich die Reihenfolge
  ändert, behält React zwar die DOM-Knoten nach Position, trägt aber die neuen Props ein. Am
  Bildschirm steht danach trotzdem das Richtige. Es wird nur mehr umgebaut als nötig.
- **Sichtbar würde es, sobald eine Zeile eigenen Zustand bekommt:** z. B. „Notiz bearbeiten“ mit
  einem `<input>`, aufklappbarer Text, Lösch-Bestätigung. Dann passiert genau das aus der Sandbox:
  der Bearbeiten-Zustand bleibt an der Position und gehört plötzlich zu einer anderen Notiz. Das
  wird in Übung 5 (Workspace mit `useState`) relevant.

Gemeinsam ist beiden Fällen: **Position ist keine Identität.** Im Vanilla-Code gab es keine
Prüfung, die das bemerkt. In React gibt es auch keine. Den Unterschied macht nur, ob die Elemente
Zustand haben.

### F3: Alle echten Daten haben ids – gibt es trotzdem legitime Gründe für `key={index}`?

Ja, wenn **alle** diese Bedingungen erfüllt sind:

1. Die Liste wird **nie umsortiert, gefiltert, oder in der Mitte verändert** (höchstens hinten
   angehängt),
2. die Einträge haben **keinen eigenen Zustand** (kein Input, keine Kind-Komponente mit State),
3. es gibt **keine natürliche id** (und der Wert selbst ist nicht garantiert eindeutig).

Genau so ein Fall steht in unserem Code, bewusst mit Kommentar:

```tsx
// PersonCard.tsx
{
  person.responsibilities.map((r, index) => <li key={index}>{r}</li>);
}
// LocationCard.tsx
{
  location.contains.map((item, index) => <li key={index}>{item}</li>);
}
```

Das sind reine Text-Listen (`string[]`) ohne id. Sie werden immer in der Reihenfolge aus der JSON
gezeigt, und ein `<li>` mit Text hat keinen Zustand. Der Text selbst als Key (`key={r}`) ginge
meistens auch, würde aber bei zwei gleichen Einträgen eine Doppel-Key-Warnung geben. Der Index ist
hier also sogar die robustere Wahl.

Weitere typische Fälle: statische Skeleton-/Platzhalterzeilen beim Laden, Zeilen einer festen
Tabelle, die nur angezeigt wird.

**Nicht** legitim: der Index nur „weil es schneller getippt ist“, obwohl eine id da wäre. Und eine
**zufällige** id (`key={Math.random()}`) ist noch schlimmer: sie ändert sich bei jedem Render, und
React baut jedes Mal alles neu (Zustand weg, Fokus weg).
