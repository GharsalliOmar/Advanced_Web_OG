# UE3 – Demo 3: Der Virtual DOM

> Aufgabe: In eigenen Worten erklären, was der Virtual DOM ist und welches Problem er löst; ein
> konkretes Beispiel aus der **originalen** `app.js` finden, wo eine kleine Zustandsänderung einen
> großen Teil des DOM per `innerHTML` neu erzeugt. Dazu drei Fragen: wie ein Virtual DOM das
> vermeiden würde, ob er „schneller“ ist, und ob er eine App automatisch schnell macht.
>
> Skript: Kapitel 15, _React Foundations_ (PDF S. 102–109).

Begriffe (DOM, Rendern, deklarativ/imperativ, Komponente): siehe Glossar in
[UE3_DEMO1_HISTORY.md](UE3_DEMO1_HISTORY.md).

---

## 1. Was ist der Virtual DOM? (eigene Worte)

Der **echte DOM** ist der Objektbaum, den der Browser anzeigt. Ihn zu verändern ist vergleichsweise
teuer: Jede Änderung kann Style-Berechnung, Layout und Neuzeichnen auslösen, und neu erzeugte Knoten
verlieren ihren bisherigen Zustand (Fokus, Hover, Textauswahl, Scroll-Position, angehängte Listener).

Der **Virtual DOM** ist eine **leichte Beschreibung der UI als normale JavaScript-Objekte**
(„hier soll ein `<button class="bookmark-btn active">★</button>` stehen“). Bei jeder
Zustandsänderung erzeugt die Komponente einfach eine **komplett neue Beschreibung**, so als würde
sie alles neu rendern. Die Bibliothek **vergleicht** dann die neue mit der alten Beschreibung
(_Diffing_ / _Reconciliation_) und überträgt **nur die tatsächlichen Unterschiede** in den echten
DOM (_Patching_).

**Das gelöste Problem:** Man will Code so _schreiben_, als würde man bei jeder Änderung alles neu
rendern (einfach, deklarativ, keine vergessenen Stellen: UI = f(state)) – aber ohne den echten DOM
dafür jedes Mal wegzuwerfen. Der Virtual DOM verbindet die **Einfachheit von „alles neu rendern“**
mit der **Schonung des echten DOM durch gezielte Updates**.

---

## 2. Beispiel aus der originalen `app.js`: ein Bookmark-Klick

**Ablauf im Original** (`app.js`, vor Übung 1; in `js/views/evidence.ts` heute noch genauso):

1. Klick auf den Stern einer Evidence-Karte → `handleEvidenceListClick()` → `handleBookmarkClick(id)`
   (`app.js` Z. 434).
2. Der Zustand ändert sich minimal: eine ID kommt in `bookmarks` dazu, `ev.bookmarked = true`.
3. Danach: `if (currentPage === "evidence") renderEvidenceList();` (Z. 448).
4. `renderEvidenceList()` (Z. 369) filtert **alle** Evidence neu, baut für **jede** Karte per
   `renderEvidenceCardHTML()` (Z. 397) einen HTML-String und ersetzt mit
   `container.innerHTML = html;` (Z. 390) die **gesamte Liste**.

**Was sich eigentlich ändern müsste:** an **einem** Knoten die Klasse (`bookmark-btn` →
`bookmark-btn active`) und an **einem** Textknoten das Zeichen (☆ → ★). Also **2 kleine Änderungen**.

**Was tatsächlich passiert – live gemessen** (deployte App, `#evidence`, `MutationObserver` auf
`#evidenceList`, ein Bookmark-Klick):

| Messwert                                    | Ergebnis                       |
| ------------------------------------------- | ------------------------------ |
| Karten in der Liste                         | 18                             |
| Elemente pro Karte                          | 13                             |
| **Entfernte Elemente**                      | **217**                        |
| **Neu erzeugte Elemente**                   | **217**                        |
| Ist die erste Karte danach dasselbe Objekt? | **Nein** – komplett neu gebaut |

→ **217 Elemente** werden weggeworfen und neu geparst/erzeugt, um **2 Details** zu ändern.

**Nebenwirkungen, die man sieht bzw. merkt:**

- **Fokus geht verloren:** Wer per Tastatur (Tab + Enter) bookmarkt, hat danach keinen Fokus mehr
  auf dem Button – der alte Button existiert nicht mehr.
- Hover-Zustände, Textauswahl, laufende CSS-Transitions in der Liste werden zurückgesetzt.
- Listener an inneren Knoten wären weg. Die App umgeht das mit **Event Delegation** (ein Listener am
  Container, `data-action="bookmark"`) – im Grunde ein Workaround genau für dieses
  `innerHTML`-Problem.
- Unnötige Arbeit: Filter läuft komplett neu, 18 HTML-Strings werden gebaut und vom Browser neu
  geparst.

**Code-Ausschnitt (Original):**

```js
function handleBookmarkClick(evidenceId) {
  // ... bookmarks.push(evidenceId); ev.bookmarked = true; ...
  saveBookmarksToStorage();
  if (currentPage === "evidence") renderEvidenceList(); // ← baut ALLE 18 Karten neu
}

function renderEvidenceList() {
  // ...
  for (var i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html; // ← alter Inhalt weg, alles neu
}
```

Weitere Stellen mit demselben Muster: `renderDashboard()` (komplettes Dashboard bei jeder
Aktualisierung neu), `renderWorkspace()`/Notizliste, die Dropdowns (`innerHTML +=` in Schleifen).

---

## 3. Frage 1 – Wie würde ein Virtual-DOM-Ansatz das vermeiden?

Konzeptionell, für denselben Bookmark-Klick:

1. **Zustand ändern:** `bookmarks` bekommt die ID dazu.
2. **Neu „rendern“ – aber nur virtuell:** Die Liste erzeugt eine neue Beschreibung aller 18 Karten
   als JS-Objekte (billig: keine echten DOM-Knoten, kein HTML-Parsing).
3. **Diffing:** Alte und neue Beschreibung werden verglichen. Jede Karte hat einen stabilen
   **Key** (`key={ev.id}`), damit die Bibliothek weiß, welche alte Karte zu welcher neuen gehört.
   Ergebnis: 17 Karten identisch; bei der 18. sind 12 von 13 Knoten identisch. Unterschied nur:
   `className` des Buttons und Text des Icons.
4. **Patching:** Genau **2 Operationen** am echten DOM, z. B.
   `button.className = "bookmark-btn active"` und `span.textContent = "★"`.

**Ergebnis:** Die anderen 215 Elemente bleiben **dieselben Objekte** – Fokus, Hover, Scroll, Auswahl
bleiben erhalten; der Browser muss nur minimal neu layouten.

**Rolle der Keys:** Ohne Keys (oder mit Array-Index als Key) würde die Bibliothek beim **Sortieren**
annehmen, dass sich der Inhalt jeder Position geändert hat, und viel mehr patchen. Mit `ev.id` als
Key erkennt sie, dass Karten nur **verschoben** wurden.

```
Zustand ändert sich
      │
      ▼
neuer virtueller Baum  ──diff──►  alter virtueller Baum
      │                                │
      └──────── Unterschiede: 2 ───────┘
                       │
                       ▼
           echter DOM: 2 gezielte Änderungen
```

---

## 4. Frage 2 – Ist der Virtual DOM „schneller“ als `innerHTML`?

**Nein, nicht grundsätzlich.** Der Virtual DOM ist **zusätzliche Arbeit** _oben drauf_ – am Ende
landen die Änderungen trotzdem im echten DOM.

| Ansatz                                                        | Kosten                                                                                                                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gezielte Hand-Änderung** (`btn.classList.toggle("active")`) | **Am schnellsten** – genau 2 DOM-Operationen, kein Diffing. Aber: man muss für **jede** mögliche Änderung von Hand wissen, welche Knoten betroffen sind. |
| **Virtual DOM**                                               | Ganzen virtuellen Baum neu erzeugen (JS-Objekte, Speicher) **+** Baum vergleichen (Diffing, CPU) **+** minimale DOM-Patches.                             |
| **`innerHTML` komplett neu**                                  | String bauen + Browser parst HTML (nativ, sehr schnell) + **alle** Knoten neu erzeugen, Layout neu, Zustand der Knoten weg.                              |

**Was eingetauscht wird:**

- Man **zahlt** mit JavaScript-Arbeit (Baum erzeugen + vergleichen) bei **jedem** Update, auch wenn
  sich fast nichts ändert.
- Man **spart** teure echte DOM-Operationen und den **Verlust von DOM-Zustand**.
- Für ein **erstes** Rendern einer großen Liste kann `innerHTML` sogar schneller sein (kein Diffing,
  nativer Parser).
- Der eigentliche Gewinn ist **nicht rohe Geschwindigkeit**, sondern: deklarativer Code, der
  **ohne Nachdenken „schnell genug“** ist, statt für jede Zustandsänderung eine handgeschriebene
  gezielte Update-Funktion zu brauchen (die man – siehe Übung 1 – leicht vergisst).

Beleg, dass es auch ohne Virtual DOM geht: **Svelte** und **SolidJS** verzichten bewusst darauf und
aktualisieren über Compiler bzw. feingranulare Reaktivität direkt die betroffenen Knoten.

---

## 5. Frage 3 – Macht ein Virtual DOM eine App automatisch schnell?

**Nein.** Er verhindert nur _unnötige DOM-Änderungen_ – nicht unnötige _Arbeit_. Typische Gründe,
warum eine React-App trotzdem langsam ist:

1. **Zu viele Re-Renders:** Zustand liegt zu weit oben im Baum → bei jedem Tastendruck im Suchfeld
   rendert die ganze App neu (virtuell + Diffing), obwohl sich nur die Liste ändert.
2. **Teure Berechnungen im Render:** z. B. bei jedem Render alle Evidence filtern + sortieren, ohne
   `useMemo`. Der Virtual DOM spart das nicht – der Code läuft trotzdem.
3. **Instabile Props:** Neue Objekte/Funktionen bei jedem Render (`onClick={() => …}`,
   `style={{…}}`) machen `React.memo` wirkungslos.
4. **Fehlende oder falsche Keys** (Index als Key): unnötiges Neu-Mounten, verlorener Zustand.
5. **Riesige Listen ohne Virtualisierung:** 10 000 Karten = 10 000 × 13 Knoten im DOM, egal wie
   geschickt gepatcht wird.
6. **Große Bundles:** React selbst + Abhängigkeiten müssen erst geladen und geparst werden – das ist
   der CSR-Preis aus Demo 2, den der Virtual DOM nicht löst.
7. **Datenlade-Wasserfälle:** `useEffect`-Ketten, die nacheinander fetchen (wie unsere sequenziellen
   Requests).
8. **Context-Änderungen**, die alle Konsumenten neu rendern lassen.

Werkzeuge dagegen: React DevTools **Profiler**, `useMemo`/`useCallback`/`React.memo`, Zustand
möglichst lokal halten, Listen-Virtualisierung, Code-Splitting.

---

## 6. Live-Demo in der Übung

1. App auf `#evidence` öffnen, DevTools → **Elements**, `#evidenceList` aufklappen.
2. Einen Stern klicken → **die komplette Liste blinkt lila** (Chrome markiert geänderte Knoten) –
   nicht nur der eine Button.
3. Optional in der Konsole messen:

```js
const list = document.getElementById("evidenceList");
let added = 0;
const obs = new MutationObserver((ms) =>
  ms.forEach((m) =>
    m.addedNodes.forEach((n) => {
      if (n.nodeType === 1) added += 1 + n.querySelectorAll("*").length;
    })
  )
);
obs.observe(list, { childList: true, subtree: true });
// jetzt einen Stern klicken, dann:
console.log("neu erzeugte Elemente:", added); // → 217
obs.disconnect();
```

4. Im Vergleich dazu (sobald die Evidence-View in React existiert, Übung 4/5): derselbe Klick
   markiert nur den einen Button.
