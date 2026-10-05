# UE3 – Demo 6: React + TypeScript-Einstiegspunkt im Vite-Projekt

> Aufgabe: React- und TypeScript-Support (Vite-Plugin, `tsx`, React-Typen) ins bestehende
> Vite-Projekt aus Übung 2 einbauen; einen minimalen Einstiegspunkt (`<App />`) anlegen, der
> sichtbar etwas rendert, **ohne** die Vanilla-App zu entfernen; entscheiden und dokumentieren, wie
> beide Versionen während der Migration koexistieren.
>
> Skript: Kapitel 15, _React Foundations_ (PDF S. 102–109).

---

## 1. Was installiert und konfiguriert wurde (und wofür)

### Pakete

| Paket                  | Version | Art               | Wofür                                                                                                                                               |
| ---------------------- | ------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react`                | 19.3    | `dependencies`    | Die Bibliothek selbst: Komponenten-Modell, Hooks, `jsx-runtime` (die Funktionen, zu denen JSX kompiliert wird).                                     |
| `react-dom`            | 19.3    | `dependencies`    | Der „Renderer“ für den Browser: `createRoot()`, überträgt Reacts Element-Baum in echte DOM-Knoten.                                                  |
| `@vitejs/plugin-react` | 6.1     | `devDependencies` | Vite-Plugin: übersetzt JSX/TSX mit der _automatic runtime_ und aktiviert **React Fast Refresh** (HMR, das Komponenten-State beim Speichern behält). |
| `@types/react`         | 19.3    | `devDependencies` | TypeScript-Typen für React (JSX-Elemente, Props, Hooks). React selbst ist in JS geschrieben und bringt keine Typen mit.                             |
| `@types/react-dom`     | 19.3    | `devDependencies` | TypeScript-Typen für `react-dom/client` (`createRoot` usw.).                                                                                        |

**Warum `dependencies` vs. `devDependencies`?** `react` und `react-dom` landen **im ausgelieferten
Bundle** (laufen beim Nutzer) → `dependencies`. Plugin und Typen werden nur **beim Entwickeln/Bauen**
gebraucht und sind im fertigen JS nicht mehr vorhanden → `devDependencies`.

### Konfiguration

| Datei            | Änderung                                                                 | Warum                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.js` | `plugins: [react()]`                                                     | Ohne Plugin weiß Vite nicht, welche JSX-Runtime es verwenden soll, und es gibt kein Fast Refresh.                                                                                 |
| `vite.config.js` | `build.rollupOptions.input: { main: "index.html", react: "react.html" }` | Der Dev-Server liefert jede `.html`-Datei aus, der **Build** nimmt aber standardmäßig nur `index.html`. Ohne diesen Eintrag fehlt `react.html` in `dist/` → 404 auf GitHub Pages. |
| `tsconfig.json`  | `"jsx": "react-jsx"`                                                     | Ohne die Option meldet `tsc` bei jedem JSX-Tag einen Fehler. `react-jsx` = moderne Runtime: kein `import React` in jeder Datei nötig.                                             |
| `tsconfig.json`  | `"include": ["js/**/*.ts", "src/**/*.ts", "src/**/*.tsx"]`               | Damit `npm run typecheck` (und damit `npm run build` und die Deploy-Pipeline) auch den React-Code prüft.                                                                          |

**Arbeitsteilung:** `tsc` **prüft** nur Typen (`noEmit`). **Übersetzt** wird das TSX von Vite
(Typen entfernen + JSX → `_jsx(...)`-Aufrufe). Beide verwenden dieselbe Runtime, sonst würde geprüft,
was nicht gebaut wird.

### Neue Dateien

```
react.html        zweiter HTML-Einstiegspunkt, nur <div id="root"> + <script src="src/main.tsx">
src/main.tsx      sucht #root, createRoot(...).render(<StrictMode><App /></StrictMode>)
src/App.tsx       Root-Komponente (Platzhalter; Shell kommt in Demo 9, Dashboard in Demo 10)
```

Die Vanilla-App (`index.html`, `js/**`) ist **unverändert**.

### Geprüft

- `npm run typecheck` ✔ (`tsc --listFiles` zeigt `src/App.tsx`, `src/main.tsx` und
  `@types/react` im Programm)
- `npm run lint` ✔, `npm run format:check` ✔
- `npm run build` ✔ → `dist/index.html` **und** `dist/react.html`
- Dev-Server: `/Advanced_Web_OG/react.html` rendert die App-Komponente, `/Advanced_Web_OG/#evidence`
  zeigt weiterhin alle 18 Evidence-Karten – beide ohne Konsolenfehler.
- `vite preview` (Produktions-Build): `react.html` rendert ebenfalls korrekt.

---

## 2. Frage 1 – Was musste installiert/konfiguriert werden, damit JSX durch Vite kompiliert?

Kurzfassung der Kette:

1. **`@vitejs/plugin-react`** in `vite.config.js` – sorgt dafür, dass Vite `.tsx`/`.jsx`-Dateien
   mit der richtigen JSX-Transformation (automatic runtime → `react/jsx-runtime`) übersetzt, und
   baut React Fast Refresh in den Dev-Server ein.
2. **`react` + `react-dom`** – das, was der kompilierte Code zur Laufzeit importiert
   (`react/jsx-runtime` für die `_jsx`-Aufrufe, `react-dom/client` für `createRoot`).
3. **`"jsx": "react-jsx"` in `tsconfig.json`** + **`@types/react`/`@types/react-dom`** – damit
   TypeScript JSX versteht und typprüft. Ohne Typen wüsste `tsc` nicht, welche Props ein `<div>`
   erlaubt (`className` ja, `class` nein) oder was `createRoot` zurückgibt.
4. **`include` um `src/` erweitert** – sonst prüft `tsc` den React-Code gar nicht.
5. **`rollupOptions.input`** – nur nötig wegen des zweiten HTML-Einstiegs (Koexistenz), nicht für
   JSX selbst.

**Bemerkenswert:** Vite kann `.tsx` grundsätzlich schon ohne Plugin übersetzen (es entfernt Typen
und kennt JSX). Das Plugin legt aber die React-Runtime fest und bringt Fast Refresh – ohne Plugin
müsste man die JSX-Optionen von Hand setzen und hätte bei jeder Änderung einen vollen Reload mit
State-Verlust.

---

## 3. Frage 2 – Wie kommt `<App />` aus der `.tsx`-Datei auf die Seite?

### Im Dev-Server (`npm run dev`)

```
Browser: GET /Advanced_Web_OG/react.html
  │  Vite liefert react.html aus und fügt seinen HMR-Client + Fast-Refresh-Vorspann ein
  ▼
<script type="module" src="src/main.tsx">
  │  Browser fordert src/main.tsx an
  ▼
Vite übersetzt main.tsx ON DEMAND (nur diese Datei, im Speicher):
  - TypeScript-Typen entfernen
  - JSX  <StrictMode><App /></StrictMode>  →  _jsx(StrictMode, { children: _jsx(App, {}) })
  - Import "react" → vorgebündelte Datei aus node_modules/.vite/deps/
  ▼
Browser führt main.tsx aus → importiert ./App (wieder on demand übersetzt)
  ▼
document.getElementById("root")  →  createRoot(rootElement)
  ▼
.render(<StrictMode><App /></StrictMode>)
  │  React ruft App() auf → bekommt React-Elemente (Objekte, Demo 5)
  ▼
react-dom erzeugt echte DOM-Knoten (createElement, textContent, …)
und hängt sie in <div id="root"> ein  →  sichtbar
```

### Im Produktions-Build (`npm run build`)

- Vite/Rolldown startet bei **beiden** Einstiegen (`index.html`, `react.html`), folgt allen
  `import`s, übersetzt TSX → JS, bündelt React + unseren Code zu **einer** Datei
  `assets/react-[hash].js` (minifiziert, Content-Hash im Namen).
- `dist/react.html` wird umgeschrieben: `src="src/main.tsx"` →
  `src="/Advanced_Web_OG/assets/react-[hash].js"`.
- Zur Laufzeit dann wie oben ab „Browser führt … aus“ – nur ohne Übersetzen, alles schon fertig.

**Größenvergleich aus dem Build** (gzip):

| Bundle                       | Größe (gzip) |
| ---------------------------- | ------------ |
| Vanilla-App (`main-*.js`)    | ~5,8 kB      |
| React-Version (`react-*.js`) | ~68,6 kB     |

Fast alles davon ist React + React-DOM selbst – der konkrete Preis aus Demo 2 (CSR: mehr JS, bevor
etwas sichtbar ist).

---

## 4. Koexistenz von Vanilla und React (Task 3 + Frage 3)

### Entscheidung: zweiter HTML-Einstiegspunkt (`react.html`) neben `index.html`

|             | Vanilla                                            | React                                                        |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------ |
| URL (lokal) | `http://localhost:5173/Advanced_Web_OG/`           | `http://localhost:5173/Advanced_Web_OG/react.html`           |
| URL (live)  | `https://gharsalliomar.github.io/Advanced_Web_OG/` | `https://gharsalliomar.github.io/Advanced_Web_OG/react.html` |
| Code        | `index.html` + `js/**/*.ts`                        | `react.html` + `src/**/*.tsx`                                |
| Daten       | `public/data/*.json` (gemeinsam)                   | `public/data/*.json` (gemeinsam)                             |
| Styles      | `styles.css` (gemeinsam)                           | `styles.css` (gemeinsam)                                     |

**Begründung:**

1. **Die Vanilla-App bleibt die funktionierende, ausgelieferte Version.** In Übung 3 werden nur Shell
   und Dashboard migriert; Evidence, People, Timeline und Workspace gibt es bis Übung 4/5 nur in
   Vanilla. Nutzer (und die Übungsabgabe) brauchen in der Zwischenzeit eine vollständige App.
2. **Komplett getrennte Laufzeit.** Beide Seiten laden eigenes JS, teilen sich keinen globalen
   Zustand. Die Vanilla-App hängt Funktionen an `window` (inline `onclick`) und schreibt per
   `innerHTML` – würde React im selben Dokument laufen, könnten sich beide gegenseitig den DOM
   kaputtschreiben.
3. **Direkter Vergleich möglich.** Beide Versionen nebeneinander in zwei Tabs → ideal für Demo 10
   („rendert das React-Dashboard dieselben Zahlen?“).
4. **Kein Risiko für das Deployment.** Die Pipeline baut beide; die Haupt-URL ändert sich nicht.
5. **Einfaches Umschalten am Ende.** Wenn alle Views migriert sind (Übung 5): `react.html` wird zu
   `index.html`, `js/` wird gelöscht.
6. **Gemeinsam genutzt, wo es sinnvoll ist:** dieselben JSON-Daten und dasselbe `styles.css` → die
   React-Version sieht von Anfang an gleich aus, ohne CSS zu duplizieren.

### Was mit den Alternativen schiefgehen würde

| Alternative                                                                                            | Problem                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sofortiger kompletter Umstieg** (`index.html` → nur noch React)                                      | Bis Übung 5 wären 4 von 5 Views nur Stubs – die ausgelieferte App wäre monatelang **kaputt**. Kein Vergleich mit dem Original möglich.                                                                                                                                                                                                         |
| **React-Inseln in derselben Seite** (z. B. React rendert nur `#dashboardContent`, Rest bleibt Vanilla) | Zwei Systeme schreiben in **denselben DOM**: Vanilla-`handleHashChange()`/`renderDashboard()` würde Reacts Knoten per `innerHTML` überschreiben. Zwei Quellen der Wahrheit für den Zustand (`state`-Objekt vs. React-State), Synchronisation nötig. Für eine spätere „Strangler“-Migration View für View denkbar, aber deutlich komplizierter. |
| **Flag/Query-Parameter** (`?react=1` in derselben `index.html`)                                        | Beide Codebasen würden immer geladen (größeres Bundle für alle), die Einstiegslogik müsste entscheiden, wer den DOM bekommt; `index.html` enthält das ganze Vanilla-Markup, das React-Version nicht braucht.                                                                                                                                   |
| **Eigenes Repo/Projekt für React**                                                                     | Daten, Styles, Typen (`js/types.ts`) müssten kopiert werden und würden auseinanderlaufen; zwei Pipelines.                                                                                                                                                                                                                                      |

**Bekannter Nachteil der gewählten Lösung:** Ein Teil der Arbeit existiert zeitweise doppelt
(Header/Nav in `index.html` und als React-Komponenten). Das ist während einer Migration gewollt und
endet mit dem Umschalten.

---

## 5. Offene Punkte für spätere Demos

- **ESLint prüft aktuell nur `**/*.js`** (seit Übung 2) – `.ts`/`.tsx` werden gar nicht gelintet.
  Für React wären `typescript-eslint` und `eslint-plugin-react-hooks` (prüft die Hook-Regeln)
  sinnvoll.
- `App.tsx` ist ein Platzhalter → Shell (Header, Nav, Routing) in **Demo 9**, Dashboard in **Demo 10**.

---

## 6. Live-Demo in der Übung

1. `package.json` (neue Einträge), `vite.config.js`, `tsconfig.json` zeigen.
2. `npm run dev` → zwei Tabs: `/Advanced_Web_OG/` (Vanilla) und `/Advanced_Web_OG/react.html`.
3. In `src/App.tsx` den Text ändern und speichern → Änderung erscheint **ohne** Reload (Fast
   Refresh; im Network-Tab kein neues Dokument).
4. DevTools → Sources: `src/main.tsx` ansehen – im Browser ist das schon übersetztes JS mit
   `jsx(...)`-Aufrufen statt JSX.
5. Fehler zeigen: in `App.tsx` `class="…"` statt `className` schreiben → `npm run typecheck`
   meldet den Fehler.
6. `npm run build` → in `dist/` liegen `index.html` **und** `react.html`.
