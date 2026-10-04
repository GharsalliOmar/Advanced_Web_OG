# UE3 – Demo 5: React-Einführung

> Aufgabe: Eine winzige React-Komponente von Grund auf schreiben, die statische Daten als JSX
> rendert (ohne State, ohne Props, gern in einer Wegwerf-Sandbox); in eigenen Worten erklären, was
> eine „Komponente“ ist und wie sie sich von einer Funktion unterscheidet, die einen HTML-String
> zurückgibt (z. B. `renderEvidenceCardHTML()` in der alten `app.js`). Dazu drei Fragen zu JSX,
> zum Weg in den DOM und zu „Komponenten sind nur Funktionen“.
>
> Skript: Kapitel 15, _React Foundations_ (PDF S. 102–109).

---

## 1. Die Sandbox-Komponente (Task 1)

**Datei:** [`ue3/demo5-sandbox/index.html`](demo5-sandbox/index.html)

Bewusst **nicht** Teil der App: React kommt per CDN, JSX wird von Babel direkt im Browser übersetzt
(`<script type="text/babel">`). Das ist nur für Experimente in Ordnung – im echten Projekt übersetzt
Vite das JSX beim Build (Demo 6).

**Öffnen:** `npm run dev`, dann <http://localhost:5173/Advanced_Web_OG/ue3/demo5-sandbox/>

```jsx
function CaseCard() {
  const people = ["Signal Scholar", "Kernel Colt", "Nova Byte"];
  return (
    <div className="case-card">
      <h2>Project ReMotion</h2>
      <p>
        Case <strong>REMOTION-2026-10</strong> · status: open
      </p>
      <ul>
        {people.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CaseCard />);
```

**Was man daran über JSX sieht:**

- Sieht aus wie HTML, ist aber **JavaScript**: `className` statt `class` (weil `class` in JS ein
  reserviertes Wort ist).
- `{ … }` öffnet eine Lücke für einen **JavaScript-Ausdruck** (`{name}`, `{people.map(...)}`).
- Listen entstehen mit `.map()`; jedes Element braucht einen stabilen `key` (siehe Demo 3).
- Eine Komponente gibt **genau ein** Wurzelelement zurück (hier `<div>`), Name beginnt mit
  **Großbuchstaben** (`<CaseCard />` = Komponente, `<div>` = HTML-Element).

**Live geprüft:** Seite rendert die Karte, keine Konsolenfehler. Erzeugter DOM:

```html
<div class="case-card">
  <h2>Project ReMotion</h2>
  <p>Case <strong>REMOTION-2026-10</strong> · status: open</p>
  <ul>
    <li>Signal Scholar</li>
    <li>Kernel Colt</li>
    <li>Nova Byte</li>
  </ul>
</div>
```

---

## 2. Was ist eine Komponente? (Task 2)

**Eigene Worte:** Eine React-Komponente ist eine Funktion, die **beschreibt, wie ein Stück UI für
bestimmte Eingaben (Props/State) aussehen soll** – als Baum aus React-Elementen, nicht als fertiges
HTML. Sie ist ein **Baustein**, den man wie ein eigenes HTML-Tag verwenden und verschachteln kann
(`<Dashboard><StatCard /></Dashboard>`). **Wann** sie aufgerufen wird, wie oft, und wie ihr
Ergebnis in den DOM kommt, entscheidet **React**, nicht der Entwickler.

**Unterschied zu `renderEvidenceCardHTML(ev)` aus der alten `app.js`:**

```js
function renderEvidenceCardHTML(ev) {
  var html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html += "<h3>" + ev.title + "</h3>";
  // ...
  return html; // ← ein STRING
}
// Aufrufer: container.innerHTML = html;
```

|                              | `renderEvidenceCardHTML(ev)` (String-Funktion)                                | React-Komponente `<EvidenceCard ev={ev} />`                                |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Rückgabe**                 | Ein **String** mit HTML-Text                                                  | Ein **Objektbaum** (React-Elemente), eine _Beschreibung_                   |
| **Wer ruft sie auf?**        | Der Entwickler, von Hand, in `renderEvidenceList()`                           | **React**, wann immer sich Props/State ändern                              |
| **Wie kommt es in den DOM?** | Entwickler setzt `container.innerHTML = …` → Browser parst den String neu     | React vergleicht mit dem vorigen Baum und patcht nur Unterschiede (Demo 3) |
| **Wann wird aktualisiert?**  | Nur wenn jemand daran denkt, neu zu rendern (vgl. `viewRendered`-Bug)         | Automatisch bei jeder Zustandsänderung                                     |
| **Ereignisse**               | Nicht im String möglich → Event Delegation / `onclick="…"` + `window`-Globals | `onClick={() => toggleBookmark(ev.id)}` direkt an der Komponente           |
| **Eigener Zustand**          | Keiner – reine Textproduktion                                                 | Kann lokalen State (`useState`) und Effekte haben                          |
| **Sicherheit (XSS)**         | `"<h3>" + ev.title + "</h3>"` – HTML in den Daten wird **ausgeführt**         | `<h3>{ev.title}</h3>` – Text wird **automatisch escaped**                  |
| **Typprüfung / Fehler**      | Tippfehler im HTML-String (`<dvi>`, fehlendes `"`) fallen niemandem auf       | JSX wird vom Compiler geprüft; mit TypeScript auch die Props               |
| **Wiederverwendung**         | String-Verkettung, schwer verschachtelbar                                     | `<EvidenceCard />` überall einsetzbar, mit Kindern kombinierbar            |

---

## 3. Frage 1 – Was ist JSX, und wozu wird es kompiliert?

**JSX** ist eine **Syntax-Erweiterung für JavaScript**, die wie HTML aussieht. Browser verstehen sie
**nicht** – ein Compiler (Babel, esbuild, TypeScript, Oxc/Vite) übersetzt jedes JSX-Tag vor der
Ausführung in einen **normalen Funktionsaufruf**. JSX ist also nur „syntaktischer Zucker“.

**Echte Compiler-Ausgabe** – mit dem lokalen TypeScript-Compiler des Projekts erzeugt
(`npx tsc CaseCard.jsx --ignoreConfig --allowJs --jsx …`; zur Lesbarkeit umformatiert, im Original
steht `·` als `·`):

Eingabe:

```jsx
export function CaseCard() {
  return (
    <div className="case-card">
      <h2>Project ReMotion</h2>
      <p>
        Case <strong>REMOTION-2026-10</strong> · status: open
      </p>
      <ul>
        <li>6 people</li>
        <li>6 locations</li>
      </ul>
    </div>
  );
}
```

**Klassische Transformation** (`--jsx react`, React ≤ 16):

```js
export function CaseCard() {
  return React.createElement(
    "div",
    { className: "case-card" },
    React.createElement("h2", null, "Project ReMotion"),
    React.createElement(
      "p",
      null,
      "Case ",
      React.createElement("strong", null, "REMOTION-2026-10"),
      " · status: open"
    ),
    React.createElement(
      "ul",
      null,
      React.createElement("li", null, "6 people"),
      React.createElement("li", null, "6 locations")
    )
  );
}
```

**Moderne „automatische“ Transformation** (`--jsx react-jsx`, Standard seit React 17 – das nutzt
auch Vite):

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CaseCard() {
  return _jsxs("div", {
    className: "case-card",
    children: [
      _jsx("h2", { children: "Project ReMotion" }),
      _jsxs("p", {
        children: ["Case ", _jsx("strong", { children: "REMOTION-2026-10" }), " · status: open"],
      }),
      _jsxs("ul", {
        children: [_jsx("li", { children: "6 people" }), _jsx("li", { children: "6 locations" })],
      }),
    ],
  });
}
```

**Was diese Aufrufe zurückgeben:** keine DOM-Knoten, sondern **schlichte JavaScript-Objekte**, etwa:

```js
{ type: "div", props: { className: "case-card", children: [ /* weitere Objekte */ ] } }
```

Genau diese Objekte bilden den **Virtual DOM** aus Demo 3.

---

## 4. Frage 2 – Wie wird die Ausgabe jeweils zu echtem DOM?

**`renderEvidenceCardHTML(ev)` (String):**

```
Daten → String-Verkettung → "<div class=…>…</div>" (Text)
      → container.innerHTML = text
      → Browser-HTML-Parser zerlegt den Text
      → alte Knoten im Container werden ALLE gelöscht, neue erzeugt
```

- Der Entwickler entscheidet **wann** und **wohin**.
- Der Browser sieht nur Text; er weiß nicht, was sich gegenüber vorher geändert hat → alles neu.
- Daten werden **als HTML interpretiert** (XSS-Risiko, bei Notizen in dieser App tatsächlich
  vorhanden – siehe `TODO` in `js/views/workspace.ts`).

**React-Komponente:**

```
Daten → Komponente (Funktion) → React-Elemente (Objekte, kein HTML-Text)
      → React vergleicht mit dem vorigen Objektbaum (Reconciliation)
      → react-dom erzeugt/ändert gezielt Knoten über DOM-APIs
        (document.createElement, node.textContent = …, setAttribute)
```

- Kein HTML-Parsing von Strings; React baut Knoten direkt per DOM-API.
- Beim ersten Mal werden alle Knoten erzeugt, danach **nur noch Unterschiede** gepatcht.
- Text in `{…}` wird als **Text** gesetzt, nie als HTML → kein XSS durch Daten.
- Der Entwickler ruft die Komponente **nie selbst** auf (`CaseCard()`), sondern übergibt sie als
  `<CaseCard />` an React (`root.render(...)`); React steuert den Aufruf.

**Fundamentaler Unterschied in einem Satz:** Die String-Funktion **erzeugt HTML**, das jemand anders
blind in den DOM schreibt; die Komponente **beschreibt einen Zielzustand**, und React findet den
günstigsten Weg dorthin.

---

## 5. Frage 3 – „Komponenten sind nur Funktionen“ – und Seiteneffekte beim Rendern

**Bedeutung:** Eine (Funktions-)Komponente ist wörtlich eine JavaScript-Funktion: Eingabe Props →
Ausgabe React-Elemente. Keine Klasse, kein spezielles Objekt, kein Template-System. Man kann in ihr
normales JS verwenden (Variablen, `if`, `.map()`), sie importieren, exportieren, testen wie jede
Funktion.

**Aber:** React erwartet, dass diese Funktion **rein** (pure) ist – gleiche Props/State → gleiche
Ausgabe, und **keine Veränderungen außerhalb** ihrer selbst während des Renderns. Grund: React
entscheidet selbst, **wann und wie oft** es eine Komponente aufruft:

- bei jeder Änderung von State/Props und jedes Mal, wenn die Eltern-Komponente neu rendert,
- im **StrictMode** (Entwicklung) bewusst **zweimal**, um unreine Komponenten aufzudecken,
- mit Concurrent Rendering kann React ein Rendern **beginnen, verwerfen und wiederholen**, ohne dass
  das Ergebnis je im DOM landet.

**Was mit einem Seiteneffekt im Render passiert – live demonstriert** (zweiter Teil der Sandbox):

```jsx
let renderCount = 0; // globale Variable

function ImpureCounter() {
  renderCount++; // Seiteneffekt WÄHREND des Renderns
  return <p>Ich wurde angeblich {renderCount}× gerendert.</p>;
}
// im <React.StrictMode> gerendert
```

**Ergebnis im Browser: „Ich wurde angeblich 2× gerendert.“** – obwohl nur einmal angezeigt wurde.

**Was kaputtgeht:**

- **Unvorhersehbare Werte:** Zähler, IDs, Summen hängen davon ab, wie oft React zufällig gerendert
  hat (StrictMode, Eltern-Re-Render, verworfene Renders).
- **Doppelte Aktionen:** Ein `fetch`, `localStorage.setItem` oder `push` in ein globales Array im
  Render-Körper passiert bei jedem Rendern erneut – doppelte Requests, doppelte Einträge.
- **Endlosschleifen:** Ändert der Seiteneffekt etwas, das wieder ein Rendern auslöst (z. B. State
  setzen im Render-Körper) → Rendern ohne Ende.
- **Inkonsistente UI:** Zwei Komponenten, die dieselbe globale Variable lesen, sehen je nach
  Render-Reihenfolge unterschiedliche Werte.
- **Bezug zu Übung 1:** Genau diese Art Fehler – geteilter, nebenbei veränderter Zustand – war der
  Mutationsbug (Sortieren hat `allEvidence` mit zerstört).

**Richtig:** Seiteneffekte gehören in **Event-Handler** (`onClick`) oder in **`useEffect`**, nicht
in den Render-Körper. Zustand gehört in `useState`/Props, nicht in globale Variablen.

---

## 6. Live-Demo in der Übung

1. `npm run dev` → <http://localhost:5173/Advanced_Web_OG/ue3/demo5-sandbox/>
2. Quelltext zeigen: `CaseCard` (JSX) und daneben die kompilierte Form aus Abschnitt 3.
3. DevTools → Elements: `#root` enthält normale DOM-Knoten – kein JSX mehr, keine `className`.
4. Konsole: `React.createElement("h2", null, "Hi")` eintippen → man sieht das **Objekt**
   (`{type: "h2", props: {...}}`), keinen DOM-Knoten.
5. Den roten Text „2× gerendert“ zeigen und erklären (StrictMode + unreine Komponente).
