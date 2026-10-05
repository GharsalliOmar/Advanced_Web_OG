# UE3 – Demo 8: Architecture Decision Record

> Aufgabe: Argumentieren, ob eine **SPA mit React** für **diese konkrete App** die richtige
> Architektur ist – mit ehrlichen Nachteilen, nicht nur Vorteilen. Dazu zwei Fragen: was man bei
> servergerendertem Vanilla bzw. bei einer anderen SPA-Variante verlieren würde, und ob man bei
> einer harten Anforderung „schwache Geräte / schlechte Verbindung“ bei SPA bleiben würde.
>
> Skript: Kapitel 13–15 (PDF S. 90–109).

Ein **ADR** (Architecture Decision Record) ist ein kurzes, datiertes Dokument, das **eine**
Architekturentscheidung festhält: in welcher Lage sie getroffen wurde, welche Optionen es gab, was
entschieden wurde und welche Folgen man bewusst in Kauf nimmt. Spätere Entwickler sollen nicht nur
sehen, _was_ gebaut wurde, sondern _warum_ – und wann man die Entscheidung neu prüfen sollte.

---

## ADR-001: Client-seitige SPA mit React als Zielarchitektur

|              |                                                           |
| ------------ | --------------------------------------------------------- |
| **Status**   | Angenommen (Übung 3) – mit Überprüfungs-Auslösern (s. u.) |
| **Datum**    | 2026-10-05                                                |
| **Betrifft** | gesamtes Frontend, Hosting, Migration Übung 3–5           |
| **Ersetzt**  | Vanilla-TS-SPA mit `innerHTML`-Rendering (Übung 1–2)      |

### 1. Kontext – was die App ist und was sie braucht

**Was die App tut:** Ein Ermittlungswerkzeug zu einem einzelnen Fall. Nutzer lesen Falldaten,
filtern/sortieren/durchsuchen Evidence, springen zwischen Evidence, Personen, Orten und Timeline hin
und her, setzen Bookmarks, schreiben Notizen und entwerfen eine Hypothese.

**Messbare Eckdaten:**

| Eigenschaft             | Wert                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Datenmenge              | 18 Evidence, 6 Personen, 6 Orte, 15 Timeline-Events; **~28 kB JSON (~9,5 kB gzip)** |
| Daten ändern sich?      | **Nein** – statische JSON-Dateien, ändern sich nur mit einem neuen Deployment       |
| Schreibende Aktionen    | Nur lokal: Bookmarks, Notizen, Hypothese in `localStorage`; **kein Backend**        |
| Hosting                 | GitHub Pages – **nur statische Dateien**, keine Server-Logik, keine Rewrite-Regeln  |
| Nutzer                  | Ermittler/Studierende am Desktop/Tablet, aktueller Browser mit JS (README)          |
| SEO / öffentliche Links | Irrelevant – internes Werkzeug                                                      |
| Vanilla-Code            | ~1 600 Zeilen TS in `js/`, 5 Views                                                  |
| Bundle (gzip)           | Vanilla **~5,8 kB** · React-Grundgerüst (Demo 6) **~68,6 kB**                       |

**Probleme der bisherigen Architektur** (aus Übung 1 und Demo 3–4):

- Zustand und Darstellung laufen auseinander (Dashboard-Bug durch `viewRendered`-Cache).
- Jede kleine Änderung baut große DOM-Teile neu (Bookmark-Klick: 217 Elemente, Demo 3).
- Duplizierter Markup-Code, der bereits auseinanderläuft (`LocationSelect`, Badges – Demo 7).
- Funktionen auf `window` für inline `onclick`, Event-Delegation als Workaround.
- XSS-Risiko durch Nutzertext in `innerHTML` (Notizen).
- Querverweise per DOM-Manipulation + `setTimeout` statt Routen mit Parametern.

**Rahmenbedingung:** Die Lehrveranstaltung verlangt in Übung 3–5 die Migration auf React.

### 2. Betrachtete Optionen

| #     | Option                                                   | Kurzbeschreibung                                                                              |
| ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **A** | Klassische MPA, servergerendert                          | Jede View ein eigenes HTML-Dokument vom Server (bzw. beim Build erzeugt), Links = Full Reload |
| **B** | Vanilla-TS-SPA beibehalten, aufräumen                    | Bisheriger Ansatz + kleiner Router + `<template>`/gezielte DOM-Updates statt `innerHTML`      |
| **C** | **SPA mit React** (CSR)                                  | Komponenten, deklaratives Rendering, Hooks/Context für geteilten Zustand                      |
| **D** | SPA mit leichterer Bibliothek                            | Preact (~4 kB, fast gleiche API), Svelte (Compiler), SolidJS (feingranulare Reaktivität)      |
| **E** | Statisch vorgerendert + interaktive Inseln (SSG/Islands) | z. B. Astro: HTML mit Inhalt beim Build erzeugen, nur Filter/Bookmarks/Formular als JS-Inseln |

### 3. Entscheidung

**Option C: Client-seitige SPA mit React + TypeScript, gebaut mit Vite, ausgeliefert als statische
Dateien auf GitHub Pages.**

**Begründung, warum SPA (statt A/E) für diese App passt:**

1. **Es ist eine Anwendung, kein Dokument.** Der Kern ist Interaktion: filtern, sortieren, suchen
   bei jedem Tastendruck, Bookmarks umschalten, zwischen Views springen. Bei einer MPA wäre jede
   dieser Aktionen ein Seitenwechsel oder bräuchte ohnehin viel JS.
2. **Geteilter Zustand über Views hinweg.** Bookmarks erscheinen im Dashboard (Anzahl), in Evidence
   (Stern) und im Workspace (Liste); Filter und offene Detailansicht sollen beim Hin- und
   Herwechseln erhalten bleiben. Das ist in einer SPA natürlich (Zustand im Speicher), in einer MPA
   nur über Umwege (URL-Parameter, `localStorage` bei jedem Seitenaufruf neu einlesen).
3. **Kein Backend vorhanden.** Alle schreibenden Aktionen sind ohnehin client-seitig
   (`localStorage`). Eine MPA mit echter Server-Logik bräuchte einen Server, den es nicht gibt.
4. **Daten sind klein.** ~9,5 kB gzip werden einmal geladen und für alle Views wiederverwendet.
5. **Die klassischen CSR-Nachteile treffen hier kaum:** kein SEO-Bedarf, Desktop-Nutzer mit JS.

**Begründung, warum React (statt B/D):**

1. **Deklaratives Rendering** löst genau die beobachteten Fehlerklassen: UI wird aus dem Zustand
   abgeleitet, statt von Hand nachgezogen (`viewRendered`-Bug, Demo 3).
2. **Komponenten** beseitigen die Duplikation (`Badge`, `PersonSelect`, `LocationSelect`, Demo 7).
3. **Sicherheit per Default:** `{text}` wird escaped – das Notizen-XSS verschwindet ohne Extra-Code.
4. **Context + Hooks** passen genau zum Zustandsbild aus Demo 7 (`CaseDataProvider`,
   `WorkspaceProvider`).
5. **Ökosystem und Werkzeuge:** React Router, Testing Library, React DevTools/Profiler, ESLint-Hooks-
   Regeln (schon eingebaut), große Community, TypeScript-Typen erstklassig.
6. **Zukunftsoffen:** Falls die App einmal SSR/SSG braucht, gibt es dafür etablierte React-Wege
   (React Router Framework-Modus, Next.js), ohne die Komponenten neu zu schreiben.
7. **Lehrveranstaltung und Arbeitsmarkt:** React ist das geforderte und das am weitesten verbreitete
   Werkzeug – das zählt bei einem Lernprojekt tatsächlich als Grund.

### 4. Konsequenzen

**Positiv:**

- UI-Konsistenz automatisch; keine manuellen Render-Caches mehr.
- Weniger Duplikation, klarere Struktur (eine Komponente = eine Aufgabe).
- Typisierte Props, Lint-Regeln für Hooks, bessere Fehlersuche (React DevTools).
- Routing mit Parametern möglich (`#evidence/E04`) → teilbare Links, funktionierender Zurück-Button
  für Detailansichten.

**Negativ – bewusst in Kauf genommen:**

| Nachteil                                         | Konkret in dieser App                                                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **~12× größeres JS-Bundle**                      | 68,6 kB statt 5,8 kB gzip – **React allein ist ~7× so groß wie alle Falldaten zusammen.** Für 18 Evidence-Einträge objektiv überdimensioniert. |
| **Langsamerer erster Inhalt**                    | Erst React laden + ausführen, dann Daten holen, dann rendern (CSR-Wasserfall aus Demo 2 wird länger, nicht kürzer).                            |
| **Ohne JS nichts**                               | Wie bisher – aber jetzt ist sogar die Header-/Nav-Struktur JS-abhängig (`react.html` enthält nur `<div id="root">`).                           |
| **Mehr Werkzeug-Komplexität und Abhängigkeiten** | Plugin, Typen, Lint-Plugins; Versionskonflikte sind real (gerade erlebt: `typescript-eslint` erzwang TypeScript 6 statt 7).                    |
| **Lernkurve / neue Fehlerklassen**               | Rules of Hooks, Abhängigkeits-Arrays, StrictMode-Doppelrender, unnötige Re-Renders (Demo 3 F3).                                                |
| **Migrationsaufwand**                            | Zwei Versionen parallel (`index.html` + `react.html`) bis Übung 5; Teile existieren zeitweise doppelt.                                         |
| **Laufzeit-Overhead**                            | Virtual-DOM-Diffing bei jeder Änderung – hier unmerklich, aber nicht gratis.                                                                   |

**Ehrliches Fazit:** Eine **SPA** ist für diese App die richtige Architektur. **React** ist eine
_vertretbare_, aber nicht die _technisch sparsamste_ Wahl: Preact oder Svelte würden dieselben
Probleme mit einem Bruchteil des JS lösen. React wird gewählt wegen Ökosystem, Verbreitung,
Zukunftsoffenheit und weil die Lehrveranstaltung es vorgibt – nicht, weil die App es technisch
erzwingt.

### 5. Überprüfungs-Auslöser (wann diese Entscheidung neu bewerten?)

- Die App soll öffentlich und über Suchmaschinen/Link-Vorschauen auffindbar werden → SSG/SSR.
- Zielgruppe mit schwachen Geräten oder mobilen Netzen (siehe Frage 2) → Option E.
- Bundle-Größe wird zum Problem → Preact über `preact/compat` als Drop-in-Ersatz testen.
- Daten werden groß oder dynamisch (Backend, mehrere Fälle, Mehrbenutzer) → Datenlade-Bibliothek,
  ggf. Server-Rendering.

---

## Frage 1 – Was würde man verlieren?

### …wenn die App servergerendertes Vanilla-HTML/JS bliebe (Option A)

- **Flüssige Navigation:** Jeder View-Wechsel wäre ein Full Page Reload – kurzes Weiß, Scroll weg.
- **Zustand zwischen Views:** Filter, Suchbegriff, offene Detailansicht gingen bei jedem
  Seitenwechsel verloren, außer man schreibt alles in URL-Parameter oder `localStorage` und liest es
  auf jeder Seite neu ein.
- **Interaktivität bleibt trotzdem JS:** Live-Suche, Sortieren, Bookmark-Stern ohne Reload – das
  braucht weiterhin clientseitiges JS. Man hätte dann **beides**: Server-Rendering _und_ DOM-Code.
- **Ein Server:** Echtes SSR bräuchte ein Backend (GitHub Pages kann das nicht); alternativ ein
  Build-Schritt, der 5 HTML-Seiten vorab erzeugt.
- **Die Komponenten-Vorteile** (Wiederverwendung, deklaratives Rendering, Escaping) – außer man
  nutzt eine Template-Engine, die ähnliches bietet.

_Was man gewinnen würde:_ schnellerer erster Inhalt, funktioniert ohne JS, kleiner, SEO-fähig.

### …wenn man React statt einer anderen SPA-Variante wählt

| Gegenüber …                         | Was man mit React **verliert**                                                                                                                   | Was man mit React **gewinnt**                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Vanilla-TS + kleiner Router** (B) | ~63 kB Bundle, null Abhängigkeiten, volle Kontrolle über jedes DOM-Update, kein Build-Plugin, keine Framework-Updates                            | Deklaratives Rendering, Komponentenmodell, Konventionen, Werkzeuge – statt alles selbst zu bauen |
| **Preact** (D)                      | ~60 kB Bundle (Preact ~4 kB) bei nahezu identischer API                                                                                          | Größeres Ökosystem, offizielle Doku, React-Compiler, neueste Features zuerst                     |
| **Svelte / SolidJS** (D)            | Kleinere Bundles, kein Virtual DOM (direkte, feingranulare Updates → oft schneller), weniger Boilerplate (kein `useState`/`useEffect`-Regelwerk) | Verbreitung, Stellenmarkt, Bibliotheken, Lehrmaterial                                            |
| **htmx / Alpine.js**                | Fast kein Build, HTML bleibt führend, minimale JS-Menge                                                                                          | Passt für komplexen geteilten Client-Zustand (Bookmarks über 3 Views) deutlich besser            |

---

## Frage 2 – Harte Anforderung: schwache Geräte / schlechte Verbindung?

**Nein – dann würde ich die Architektur ändern**, und zwar weg von reinem CSR hin zu **statisch
vorgerendertem HTML mit kleinen interaktiven Inseln (Option E)**.

**Warum nicht bei der React-SPA bleiben:**

- Auf einem schwachen Gerät dauert es spürbar, ~69 kB gzip (≈ 220 kB unkomprimiert) JS zu parsen und
  auszuführen, **bevor** überhaupt etwas Inhaltliches erscheint.
- Bei schlechter Verbindung verlängert sich der Wasserfall HTML → JS → JSON → Rendern; jede Stufe
  bringt die volle Latenz mit.
- Auch „React + SSR/Hydration“ löst das nur halb: Der Inhalt ist zwar sofort sichtbar, aber zum
  Interaktiv-Werden muss das schwache Gerät trotzdem das ganze React-Bundle laden und die Seite
  hydrieren.

**Wie es stattdessen aussähe – und warum das hier besonders gut passt:**

1. **Die Daten sind statisch.** Alles, was in den JSON-Dateien steht, kann **beim Build** in fertiges
   HTML eingebaut werden (SSG). Kein Server nötig – GitHub Pages reicht weiterhin.
2. Jede View wird eine eigene, vorgerenderte Seite mit vollem Inhalt → sofort lesbar, auch ohne JS
   und bei 2G.
3. Nur die wirklich interaktiven Teile (Suche/Filter, Bookmark-Stern, Notiz-Editor,
   Hypothesen-Formular) werden als **Inseln** mit JS nachgeladen – mit einer kleinen Bibliothek
   (Preact, Svelte) oder Vanilla. Werkzeug z. B. **Astro**.
4. Geteilter Zustand (Bookmarks) über `localStorage`, Filter in der URL (`?person=kernel-colt`) →
   teilbar und reload-fest.
5. Zusätzlich: Datenanfragen parallel statt nacheinander, Bilder (`assets/people/*.png`) verkleinern
   und `loading="lazy"`.

**Abwägung:** Man verliert etwas Navigations-Komfort (Seitenwechsel = Reload, durch Browser-Cache
und kleine Seiten aber schnell) und die Einfachheit _eines_ Zustandsmodells. Bei einer **harten**
Anforderung an schwache Geräte wiegt der schnelle, JS-unabhängige erste Inhalt schwerer.

---

## Live-Demo in der Übung

1. Kontext-Tabelle zeigen; `npm run build` ausführen → Größenvergleich `main-*.js` vs.
   `react-*.js` im Terminal.
2. DevTools → Network → „Slow 3G“ + CPU-Drosselung „6× slowdown“ (Performance-Tab) →
   `react.html` neu laden und zeigen, wie lange `#root` leer bleibt.
3. Entscheidung + „Ehrliches Fazit“ vorlesen, dann die Überprüfungs-Auslöser.
