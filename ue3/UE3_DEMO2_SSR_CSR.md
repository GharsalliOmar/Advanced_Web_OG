# UE3 – Demo 2: SSR vs. CSR

> Aufgabe: Vergleichstabelle Server-Side vs. Client-Side Rendering; eine echte Website mit
> beobachtbaren Belegen als SSR oder CSR einordnen; erklären, warum diese App SSR/CSR ist (Ablauf
> Schritt für Schritt) und welchen Preis sie dafür zahlt.
>
> Skript: Kapitel 13, _Rendering and Navigation Architectures_ (PDF S. 90–95).

Begriffe (DOM, SPA, CSR, SSR, Hash-Routing, …): siehe Glossar in
[UE3_DEMO1_HISTORY.md](UE3_DEMO1_HISTORY.md).

---

## 1. Vergleichstabelle

|                                                       | **Server-Side Rendering (SSR)**                                                                                                   | **Client-Side Rendering (CSR)**                                                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Was schickt der Server beim ersten Request?**       | **Fertiges HTML mit Inhalt** – Texte, Listen, Daten sind schon drin. Der Server hat vorher Daten geholt und das HTML gebaut.      | Ein **fast leeres HTML-Gerüst** + **JavaScript-Bundle(s)**. Die eigentlichen Daten fehlen noch.                                                                |
| **Was muss der Browser tun, bevor man Inhalt sieht?** | HTML parsen, CSS laden, darstellen → **Inhalt sofort sichtbar**. JS (falls vorhanden) macht die Seite danach nur noch interaktiv. | HTML parsen → **JS herunterladen, parsen, ausführen** → JS holt **Daten per `fetch`** (weitere Roundtrips) → JS baut den DOM → **erst jetzt Inhalt sichtbar**. |
| **Folge-Navigation**                                  | Klassisch: **neuer Request an den Server**, komplett neues HTML, Full Page Reload.                                                | **Kein neues HTML.** JS tauscht die View selbst aus, lädt höchstens noch Daten nach → schnell und flüssig.                                                     |
| **Stärken**                                           | Schneller erster sichtbarer Inhalt, funktioniert ohne JS, gut für SEO und Link-Vorschauen                                         | Flüssige App-Bedienung, wenig Serverlast, statisches Hosting reicht                                                                                            |
| **Schwächen**                                         | Jeder Klick = Roundtrip, Server braucht Rechenleistung, Zustand geht bei Navigation verloren                                      | Langsamer erster Inhalt, ohne JS nichts zu sehen, schwieriger für SEO, viel Arbeit für schwache Geräte                                                         |

**Merksatz:** Bei SSR arbeitet der **Server, bevor** die Seite ankommt. Bei CSR arbeitet der
**Browser, nachdem** sie angekommen ist.

Moderne Frameworks (Next.js, Nuxt) kombinieren beides: erster Aufruf servergerendert, danach
übernimmt JS und die Seite verhält sich wie eine SPA (_Hydration_, Kapitel 14).

---

## 2. Echte Website: Wikipedia ist (überwiegend) SSR

Beispielseite: <https://en.wikipedia.org/wiki/World_Wide_Web>

| Beleg                     | Wie prüfen                                                | Beobachtung                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Seitenquelltext**       | `Strg+U`                                                  | Der Artikeltext steht bereits im rohen HTML: _„The **World Wide Web** (also known as WWW, W3, or simply the Web) …“_. Auch per `curl` (ganz ohne JavaScript) bestätigt. |
| **Network-Tab**           | DevTools → Network → Reload                               | Die **erste Antwort** (Typ `document`, `text/html`) ist groß und enthält den Inhalt. Es gibt **keinen** nachgelagerten JSON-Request, der den Artikel lädt.              |
| **JavaScript abschalten** | DevTools → `Strg+Shift+P` → „Disable JavaScript“ → Reload | Artikel **vollständig lesbar**. Nur Extras (Link-Vorschau beim Hovern o. ä.) fehlen.                                                                                    |
| **Navigation**            | Link im Artikel anklicken                                 | Neuer `document`-Request im Network-Tab → Full Page Reload → klassisches SSR/MPA-Verhalten.                                                                             |

**Fazit:** Wikipedia ist SSR; JavaScript ist nur eine Ergänzung (_progressive enhancement_).

**Gegenbeispiel CSR:** unsere eigene App (Abschnitt 3). In der Übung beide nebeneinander mit
abgeschaltetem JavaScript zeigen.

---

## 3. Frage 1 – Unsere App ist CSR: Ablauf Schritt für Schritt

**Die App ist reines CSR.** GitHub Pages liefert nur statische Dateien, das gesamte sichtbare
Dashboard entsteht im Browser durch JavaScript.

Ablauf beim Aufruf von <https://gharsalliomar.github.io/Advanced_Web_OG/>:

1. **Request `index.html`.** GitHub Pages schickt die Datei unverändert. Enthalten: Header,
   Nav-Buttons, alle fünf `<section class="view">`, die Intro-Karte – aber
   `<div id="dashboardContent">` ist **leer** (nur der Kommentar `<!-- rendered by app.js -->`;
   am deployten HTML geprüft).
2. **HTML parsen**, CSS (`assets/index-*.css`) und JS-Bundle (`assets/index-*.js`,
   `type="module"`) nachladen. Sichtbar ist jetzt **nur der Header und das Lade-Overlay**
   („Loading case file…“). Alle Views sind per CSS versteckt (`.view { display: none; }`, nur
   `.view.active` ist sichtbar) – und noch keine hat `active`.
3. **JS läuft:** Bei `DOMContentLoaded` startet `initApp()` (`js/main.ts`): Bookmarks/Notizen aus
   `localStorage` lesen, Event-Listener registrieren, `loadAllData()` aufrufen.
4. **Daten-Roundtrips nacheinander** (`loadCorePeopleAndLocations()` in `js/data.ts`):
   `case.json` → **dann** `people.json` → **dann** `locations.json`. Jeder Request startet erst,
   wenn der vorige fertig ist.
5. **`renderDashboard()`** baut einen HTML-String und setzt ihn per `innerHTML`. Evidence-Zahlen
   stehen hier noch auf **0** (`evidence.json` fehlt noch).
6. **`handleHashChange()`** (aus `initApp`) gibt `#view-dashboard` die Klasse `active` → **erst
   jetzt ist das Dashboard überhaupt sichtbar** (noch unter dem Overlay).
7. **`evidence.json` und `timeline.json`** werden gestartet (ohne `await`, laufen gleichzeitig);
   jede rendert das Dashboard nach Ankunft erneut.
8. **Overlay verschwindet**, sobald `loadingStepsRemaining` 0 ist – nach Core- und Timeline-Schritt.
   **Evidence zählt nicht mit** → bei langsamer Verbindung ist das Dashboard kurz sichtbar, während
   Evidence-Zahl und Fortschrittsbalken noch 0 zeigen.

**Wasserfall im Network-Tab:**

```
index.html ─► CSS + JS ─► case.json ─► people.json ─► locations.json ─► evidence.json
                                                                     └► timeline.json
```

Bis die ersten Falldaten erscheinen: mindestens **5 Roundtrips hintereinander** (HTML, JS, case,
people, locations). Bei SSR wäre es **einer**.

**Live-Beweis:**

- `Strg+U` → `dashboardContent` ist leer.
- JavaScript abschalten → keine Falldaten.
- Network-Tab → Wasserfall wie oben.

---

## 4. Frage 2 – Was kostet diese Wahl?

### a) Nutzer ohne JavaScript

Sieht nur den Header und das **Lade-Overlay, das nie verschwindet** (das Verstecken macht JS). Die
Nav-Buttons sind tot (inline `onclick="navigateTo(...)"`). Kein einziger Falldatensatz. Bei
Wikipedia wäre der Inhalt voll lesbar.

### b) Langsame Verbindung (DevTools → Network → „Slow 3G“)

Der größte praktische Preis:

- Erst muss das **gesamte JS-Bundle** geladen sein, bevor überhaupt die erste Datenanfrage startet.
- Dann folgen drei JSON-Requests **sequenziell** – jeder bringt die volle Latenz mit. Bei ~2 s
  Latenz pro Roundtrip summiert sich das schnell auf > 10 s Spinner.
- Dazu erscheinen kurz **falsche/leere Werte** (Evidence = 0), weil Daten nur teilweise da sind.

Bei SSR käme der fertige Inhalt mit der ersten Antwort.

### c) Suchmaschinen-Crawler und Link-Vorschauen

- Ein Crawler ohne JS findet nur den statischen Rahmen (Header, Intro-Texte, leere Container).
  Fallbeschreibung, Evidence, Personen, Timeline existieren für ihn nicht.
- Googlebot führt JS zwar aus, aber verzögert und nicht garantiert. Viele andere Crawler und
  Link-Vorschauen (WhatsApp, Slack, Teams) führen **gar kein** JS aus.
- **Hash-Routing:** Alles nach `#` geht nie an den Server → für Crawler gibt es nur **eine** URL.
  `#evidence` oder `#timeline` sind keine eigenen, indexierbaren Seiten.

### d) Schwache Geräte

Das gesamte Rendern (JS parsen, DOM bauen) passiert auf dem Gerät des Nutzers statt auf dem Server.

### Einordnung

Für **diese** App sind die meisten Kosten **tragbar**: Sie ist ein internes Ermittlungswerkzeug,
kein öffentlicher Inhalt (SEO egal), und laut README wird ein aktueller Desktop-Browser mit JS
vorausgesetzt. Ernst ist vor allem **(b)** – die sequenziellen Requests. Die werden laut
Übungsangabe in einer späteren Übung optimiert (parallel laden).
