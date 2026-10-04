# UE3 – Demo 4: SPA vs. MPA – State & Routing

> Aufgabe: Live zeigen bzw. skizzieren, wie Navigation in dieser App funktioniert (Auslöser, welcher
> Code läuft, was im Gegensatz zu einer Multi-Page-Site **nicht** passiert); auflisten, welcher
> Zustand einen Reload überlebt und welcher verloren geht. Dazu drei Fragen: wo „die Daten der
> aktuellen Seite“ leben, was ein Router-Framework leistet, und was der Zurück-Button bewirkt.
>
> Skript: Kapitel 13, _Rendering and Navigation Architectures_ (PDF S. 90–95).

Begriffe (SPA, MPA, Routing, Hash, `pushState`): siehe Glossar in
[UE3_DEMO1_HISTORY.md](UE3_DEMO1_HISTORY.md).

---

## 1. Wie Navigation in dieser App funktioniert

### Ablauf beim Klick auf „Evidence“

```
 Klick auf <button class="nav-btn" onclick="navigateTo('evidence')">      (index.html)
   │
   ▼
 navigateTo("evidence")                                                    (js/navigation.ts)
   └─ window.location.hash = "evidence"
        │   Browser: URL wird …/#evidence, neuer History-Eintrag,
        │   KEIN Request an den Server, KEIN Neuladen
        ▼
 Browser feuert Event "hashchange"
   │
   ▼
 handleHashChange()                                                        (js/navigation.ts)
   ├─ hash = location.hash ohne "#"; unbekannt? → "dashboard"
   ├─ state.currentPage = hash
   ├─ alle <section class="view">: Klasse "active" weg
   ├─ #view-<hash>: Klasse "active" dazu          ← CSS: .view {display:none} / .view.active {display:block}
   ├─ Nav-Buttons: "active" umsetzen (Hervorhebung)
   └─ rendern:
        dashboard  → renderDashboard()     (jedes Mal)
        evidence   → renderEvidenceList()  (nur beim 1. Besuch, Flag state.viewRendered.evidence)
        people     → renderPeople() + renderLocations() (nur 1. Besuch)
        timeline   → renderTimeline()      (nur 1. Besuch)
        workspace  → renderWorkspace()     (jedes Mal)
```

**Auslöser** einer View-Änderung können sein:

- Nav-Buttons und „Go to …“-Buttons auf dem Dashboard (`navigateTo(...)`),
- Querverweise zwischen Views (z. B. People → „view“ evidence, Timeline → Evidence, Workspace →
  „Open“) – ebenfalls `navigateTo(...)`,
- der Nutzer selbst: Zurück/Vor-Button, Hash in der Adresszeile ändern, Lesezeichen,
- der App-Start: `initApp()` ruft nach dem Laden der Kerndaten einmal `handleHashChange()` auf.

Alle Wege laufen über **eine** Stelle: `hashchange` → `handleHashChange()`.

### Was dabei **nicht** passiert (im Gegensatz zu einer MPA)

| Bei einer klassischen Multi-Page-Site                          | Hier                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Request an den Server, neues HTML-Dokument                     | **Kein Request.** Im Network-Tab erscheint beim View-Wechsel **nichts**.          |
| Altes Dokument wird verworfen (DOM, JS-Variablen, Scroll)      | Dokument bleibt. Alle 5 Views existieren dauerhaft im DOM, nur ein-/ausgeblendet. |
| CSS/JS werden (aus dem Cache) neu ausgewertet, App startet neu | JS läuft einfach weiter; `state` im Speicher bleibt erhalten.                     |
| Daten werden pro Seite vom Server neu geholt                   | JSON wurde **einmal** beim Start geladen und wird für alle Views wiederverwendet. |
| Weißer Bildschirm / Flackern zwischen Seiten                   | Sofortiger Wechsel.                                                               |
| Server entscheidet, welche Seite zur URL gehört                | JavaScript entscheidet (Client-side Routing).                                     |

**Live-Demo:** DevTools → Network offen, zwischen Views klicken → keine neuen Requests; nur die URL
nach `#` ändert sich. Elements-Tab → die Klasse `active` springt zwischen den `<section>`s.

_Randnotiz:_ `handleHashChange` wird in `js/main.ts` zweimal als `hashchange`-Listener registriert
(Z. 58 und Z. 112). Weil es dieselbe Funktionsreferenz ist, ignoriert `addEventListener` die zweite
Registrierung – läuft also trotzdem nur einmal, ist aber überflüssiger Code.

---

## 2. Welcher Zustand überlebt einen Reload?

Live geprüft: Evidence-View geöffnet, Suche „camera“, Sortierung „Title A–Z“, Personenfilter gesetzt,
Detailansicht offen, gescrollt → `location.reload()`.

### Bleibt erhalten

| Zustand                | Wo gespeichert                                  | Wird gesetzt …                                                 |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| **Aktuelle View**      | **URL-Hash** (`#evidence`)                      | bei jeder Navigation                                           |
| **Bookmarks**          | `localStorage["remotion_bookmarks"]` (ID-Array) | sofort bei jedem Stern-Klick                                   |
| **Notizen**            | `localStorage["remotion_notes"]` (`{id: text}`) | nur beim Klick auf „Save note“                                 |
| **Hypothesen-Entwurf** | `localStorage["remotion_hypothesis"]` (Objekt)  | nur beim Klick auf „Save hypothesis draft“                     |
| Falldaten (JSON)       | Server (`public/data/*.json`)                   | werden einfach neu geladen – nicht „verloren“, aber neu geholt |

### Geht verloren (nur im JS-Speicher oder im DOM)

| Zustand                                                                        | Wo er lebt                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Suchbegriff, alle Evidence-Filter, Sortierung                                  | Werte der `<input>`/`<select>` im DOM                     |
| Gefilterte/sortierte Liste                                                     | `state.filteredEvidence`                                  |
| Geöffnete Evidence-Detailansicht                                               | `state.selectedEvidence` + DOM (`#evidenceDetailSection`) |
| Gewählter Tab „People/Locations“                                               | `state.currentPeopleTab` + CSS-Klassen                    |
| Timeline-Reihenfolge und -Filter                                               | `<select>`-Werte im DOM                                   |
| **Ungespeicherte** Notiz / Hypothesen-Änderungen                               | `<textarea>`/Formularfelder im DOM                        |
| Scroll-Position                                                                | Browser/DOM                                               |
| Interne Flags (`viewRendered`, `evidenceViewLoading`, `loadingStepsRemaining`) | `state` (werden neu initialisiert)                        |

**Ergebnis der Live-Prüfung:** nach dem Reload `#evidence` aktiv ✔, Suche leer, Sortierung wieder
„Newest first“, Personenfilter leer, Detail geschlossen.

**Achtung, schon ohne Reload:** `renderWorkspace()` läuft bei **jedem** Besuch der Workspace-View und
lädt dabei den gespeicherten Hypothesen-Entwurf neu (`loadHypothesisFromStorage()`) und baut die
Evidence-Auswahl neu (`populateHypothesisDropdowns()`). Wer Änderungen nicht speichert, die View
verlässt und zurückkommt, verliert sie also auch innerhalb der laufenden SPA.

---

## 3. Frage 1 – Wo leben „die Daten der aktuellen Seite“?

### MPA

Die Daten leben **auf dem Server** (Datenbank, Session). Pro Request holt der Server sie, baut daraus
HTML und schickt es. Zwischen zwei Requests hält der **Browser praktisch nichts** außer der URL
(inkl. Query-Parametern), Cookies und evtl. Formulardaten. Jede Seite startet „frisch“.

### SPA (diese App)

Die Daten leben **im Browser-Tab**:

- im **JS-Speicher** (`state`-Objekt in `js/state.ts`: `allEvidence`, `allPeople`, `filteredEvidence`, …),
- im **DOM** (Filterwerte, offene Detailansicht, Formularinhalte),
- in **`localStorage`** (Bookmarks, Notizen, Hypothese),
- in der **URL** (nur die aktuelle View als Hash).

### Konsequenzen

**Gut:**

- Daten werden **einmal** geladen und von allen Views geteilt → Navigation ohne Wartezeit.
- Zustand bleibt beim Wechseln erhalten (Filter in Evidence sind beim Zurückkommen noch da).
- Weniger Serverlast; statisches Hosting (GitHub Pages) reicht.

**Schlecht:**

- **Reload oder neuer Tab = Zustand weg** (Abschnitt 2), sofern nicht bewusst in `localStorage`
  oder in der URL gespeichert.
- **Nicht teilbar:** Einen Link „Evidence E04, gefiltert nach Kernel Colt“ gibt es nicht – nur
  `#evidence`.
- **Veraltete Daten:** Die JSON-Daten werden nie neu geholt. Ändern sie sich auf dem Server, sieht
  man das erst nach einem Reload.
- **Konsistenz ist Aufgabe des Entwicklers:** Mehrere Views zeigen dieselben Daten aus demselben
  Speicher – wenn eine View nicht neu rendert, zeigt sie Veraltetes (genau der Dashboard-Bug aus
  Übung 1 durch das `viewRendered`-Flag).
- Speicher wächst mit der Laufzeit des Tabs, nichts wird automatisch „aufgeräumt“.

---

## 4. Frage 2 – Was leistet eine Router-Bibliothek, was `handleHashChange()` nicht kann?

Der handgeschriebene Router kann genau eins: **Hash-String → eine von 5 Sections einblenden.** Eine
Router-Bibliothek (z. B. React Router, TanStack Router, Vue Router) übernimmt zusätzlich:

| Aufgabe                                   | Router-Bibliothek                                                                             | Unsere App                                                                                                                                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Routen mit Parametern**                 | `/evidence/:id`, `?person=kernel-colt` → Werte stehen in der Komponente zur Verfügung         | Gibt es nicht. Querverweise setzen stattdessen Filter-`<select>`s direkt im DOM und rufen per `setTimeout(..., 0)` nach dem Hashwechsel `openEvidenceDetail()` auf (`js/views/people.ts`, `timeline.ts`, `workspace.ts`) |
| **Verschachtelte Routen / Layouts**       | z. B. Evidence-Liste + Detail als Unterroute                                                  | Detail ist nur ein ein-/ausgeblendetes `<div>`, nicht Teil der URL                                                                                                                                                       |
| **Not-Found-Route / Redirects**           | eigene 404-Seite oder `replace` auf eine gültige URL                                          | Unbekannter Hash → Dashboard wird gezeigt, aber die URL bleibt `#gibtsnicht` (live geprüft)                                                                                                                              |
| **History API (`pushState`)**             | saubere URLs `/evidence` statt `#evidence`, `push` vs. `replace` steuerbar                    | nur Hash, jede Navigation ist ein `push`                                                                                                                                                                                 |
| **Echte Links**                           | `<Link to="…">` rendert ein `<a href>` → Mittelklick/„In neuem Tab öffnen“/Link kopieren geht | Navigation über `<button onclick>` → kein „in neuem Tab öffnen“                                                                                                                                                          |
| **Mount/Unmount von Views**               | nur die aktive Route ist im DOM, beim Verlassen wird aufgeräumt                               | alle Views immer im DOM; manuelles Render-Caching per `viewRendered`-Flags                                                                                                                                               |
| **Daten laden pro Route / Pending-State** | Loader, Lade- und Fehlerzustände pro Route                                                    | Daten global beim Start, Spinner-Logik von Hand                                                                                                                                                                          |
| **Navigation Guards**                     | „Ungespeicherte Änderungen – wirklich verlassen?“                                             | fehlt (Hypothese/Notiz gehen still verloren)                                                                                                                                                                             |
| **Scroll-Wiederherstellung**              | Scroll-Position pro History-Eintrag                                                           | fehlt                                                                                                                                                                                                                    |
| **Code-Splitting / Lazy Loading**         | Code einer Route erst bei Bedarf laden                                                        | ein Bundle für alles                                                                                                                                                                                                     |
| **Barrierefreiheit / Titel**              | Fokus auf neue Überschrift, `document.title` pro Route                                        | Titel bleibt immer gleich, Fokus bleibt auf dem Button                                                                                                                                                                   |
| **Aktiv-Markierung**                      | automatisch (`NavLink`)                                                                       | von Hand per Schleife über `.nav-btn`                                                                                                                                                                                    |

---

## 5. Frage 3 – Was passiert beim Zurück-Button?

**Kurz:** Er funktioniert für den **View-Wechsel**, aber nur dafür.

**Warum er überhaupt funktioniert:** `navigateTo()` setzt `location.hash`. Jede Hash-Änderung legt
einen **History-Eintrag** an. „Zurück“ setzt den Hash auf den vorigen Wert → Browser feuert
`hashchange` → `handleHashChange()` blendet die vorige View ein. Kein Reload, kein Request.

**Live geprüft** (Dashboard → Evidence mit Personenfilter + offener Detailansicht → People →
2 × Zurück):

| Schritt                  | URL           | sichtbare View | Detail offen?  | Filter „Person“ |
| ------------------------ | ------------- | -------------- | -------------- | --------------- |
| Start                    | _(kein Hash)_ | Dashboard      | nein           | –               |
| Evidence, Filter, Detail | `#evidence`   | Evidence       | ja             | kernel-colt     |
| People                   | `#people`     | People         | ja (versteckt) | kernel-colt     |
| **Zurück**               | `#evidence`   | Evidence       | **ja**         | **kernel-colt** |
| **Zurück**               | _(kein Hash)_ | Dashboard      | ja (versteckt) | kernel-colt     |

**Was daraus folgt:**

1. Zurück springt **ganze Views**, nicht einzelne Schritte innerhalb einer View. Das Öffnen der
   Detailansicht, Filter oder der People/Locations-Tab erzeugen **keinen** History-Eintrag → Zurück
   schließt z. B. nicht die Detailansicht, sondern verlässt die ganze View.
2. Die vorige View erscheint **so, wie man sie verlassen hat** (Filter, offenes Detail) – weil sie
   nie aus dem DOM entfernt und wegen `viewRendered` auch nicht neu gerendert wird. Das ist Zustand
   aus dem Speicher, nicht aus der URL.
3. Ist man auf dem ersten Eintrag (App ohne Hash geöffnet), verlässt „Zurück“ die App komplett.
4. „Vor“ funktioniert symmetrisch.
5. Ungültiger Hash: Dashboard wird gezeigt, die URL bleibt aber falsch stehen.

---

## 6. Live-Demo in der Übung

1. DevTools → **Network**: zwischen Views klicken → keine Requests.
2. DevTools → **Elements**: Klasse `active` wandert zwischen den `<section class="view">`s.
3. **Sources**: Breakpoint in `handleHashChange()` setzen, Nav-Button klicken → Call Stack zeigt,
   dass der Aufruf vom `hashchange`-Event kommt, nicht direkt vom Klick.
4. **Application → Local Storage**: die drei `remotion_*`-Keys zeigen; Reload → Bookmarks bleiben,
   Filter sind weg.
5. Evidence filtern + Detail öffnen → People → **Zurück** → Detail und Filter noch da, aber der
   Zurück-Button hat die Detailansicht nicht geschlossen.
