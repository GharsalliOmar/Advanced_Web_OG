# UE3 – Demo 9: Application Shell in React

> Aufgabe: Header/Branding, Navigationsleiste und ein Routing-Gerüst (ohne Router-Bibliothek) in
> React + TypeScript bauen; Navigation zwischen (Stub-)Seiten muss tatsächlich wechseln, was
> gerendert wird – für alle fünf Views, auch wenn nur das Dashboard in dieser Übung echten Inhalt
> bekommt. Dazu zwei Fragen: wie „die aktuelle View“ verfolgt wird (Vergleich mit `currentPage` und
> `handleHashChange()`), und was bei einer nicht existierenden View passiert.
>
> Skript: Kapitel 13 + 15 (PDF S. 90–95, 102–109).

**Öffnen:** `npm run dev` → <http://localhost:5173/Advanced_Web_OG/react.html> · live (nach Push):
<https://gharsalliomar.github.io/Advanced_Web_OG/react.html>

---

## 1. Was gebaut wurde

```
src/
├─ main.tsx                    (Demo 6) createRoot(#root).render(<App />)
├─ App.tsx                     Shell: useHashRoute() → <Header> + <PageRouter> + <Footer>; Seitentitel
├─ PageRouter.tsx              Route → genau EINE Seite (switch über ViewName) oder <NotFoundPage>
├─ vite-env.d.ts               Typen für import.meta.env (BASE_URL fürs Logo)
├─ lib/
│  └─ routes.ts                VIEWS-Liste, Typ ViewName, parseHash(), hrefFor()
├─ hooks/
│  └─ useHashRoute.ts          URL-Hash als React-Zustand (useSyncExternalStore)
├─ components/
│  ├─ Header.tsx               Logo, Titel, Untertitel + <NavBar>
│  ├─ NavBar.tsx               VIEWS.map → <NavButton>
│  ├─ NavButton.tsx            <a href="#view" class="nav-btn [active]" aria-current>
│  ├─ Footer.tsx
│  └─ PagePlaceholder.tsx      Stub-Inhalt + Link auf dieselbe View in der Vanilla-App
└─ pages/
   ├─ DashboardPage.tsx        Stub (echter Inhalt: Demo 10)
   ├─ EvidencePage.tsx         → PagePlaceholder
   ├─ PeoplePage.tsx           → PagePlaceholder
   ├─ TimelinePage.tsx         → PagePlaceholder
   ├─ WorkspacePage.tsx        → PagePlaceholder
   └─ NotFoundPage.tsx         unbekannter Hash
```

`styles.css`: eine neue Regel `a.nav-btn` (Links sehen aus wie die bisherigen Nav-Buttons). Die
Vanilla-App benutzt weiter `<button>` und ist davon nicht betroffen.

### Ablauf einer Navigation

```
Klick auf <a href="#timeline" class="nav-btn">        (NavButton – kein onClick!)
  │  Browser: Hash ändern, History-Eintrag, KEIN Reload
  ▼
Event "hashchange"
  │  useSyncExternalStore hat in subscribe() einen Listener angemeldet
  ▼
React ruft getHash() → "#timeline" ist neu → App rendert neu
  ▼
parseHash("#timeline") → { kind: "view", view: "timeline", param: null }
  ├─ <Header activeView="timeline">  → NavButton "Timeline" bekommt class "active" + aria-current
  ├─ <PageRouter route=…>            → <TimelinePage />; die vorige Seite wird aus dem DOM entfernt
  └─ useEffect                       → document.title = "Timeline – Project ReMotion (React)"
```

### Design-Entscheidungen

| Entscheidung                                              | Warum                                                                                                                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hash-Routing** beibehalten                              | GitHub Pages hat keine Rewrite-Regeln → mit `pushState` gäbe ein Reload auf `/evidence` einen 404 (Demo 1/4). Gleiches URL-Schema wie Vanilla.                                      |
| **Kein Router-Paket**                                     | Laut Angabe nicht nötig; ein eigener Hook (~10 Zeilen) macht den Vergleich mit `handleHashChange()` direkt sichtbar. React Router wäre der nächste Schritt (Übung 4/5).             |
| **`useSyncExternalStore`** statt `useState` + `useEffect` | Der Hash lebt außerhalb von React (im Browser). Der Hook liest ihn direkt – kein zweiter, gespiegelter Zustand, der auseinanderlaufen kann; An-/Abmelden des Listeners automatisch. |
| **`<a href>` statt `<button onClick>`**                   | Mittelklick / „In neuem Tab öffnen“ / Link kopieren funktionieren; keine Funktionen auf `window` nötig (Vanilla: `window.navigateTo` für inline `onclick`).                         |
| **`ViewName` als Union-Typ** aus der `VIEWS`-Liste        | Tippfehler wie `"evidense"` sind Compile-Fehler; der `switch` im `PageRouter` ist erschöpfend geprüft.                                                                              |
| **Parameter vorgesehen** (`#evidence/E04`)                | Laut Hierarchie (Demo 7) sollen Querverweise später über die URL laufen statt per DOM-Hack + `setTimeout`. Wird geparst, aber noch nicht benutzt.                                   |
| **Eigene Not-Found-Seite**                                | siehe Frage 2.                                                                                                                                                                      |
| **Seitentitel pro View** per `useEffect`                  | `document.title` liegt außerhalb von React → Seiteneffekt → gehört in einen Effect, nicht in den Render-Körper (Demo 5).                                                            |

### Geprüft (Browser, Dev-Server + `vite preview`)

| Schritt                      | URL             | Überschrift            | aktiver Nav-Eintrag | Titel                                |
| ---------------------------- | --------------- | ---------------------- | ------------------- | ------------------------------------ |
| Start                        | _(kein Hash)_   | Case Dashboard         | Dashboard           | Dashboard – Project ReMotion (React) |
| Klick „Timeline“             | `#timeline`     | Investigation Timeline | Timeline            | Timeline – …                         |
| Klick „Evidence“             | `#evidence`     | Evidence Catalogue     | Evidence            | Evidence – …                         |
| Zurück-Button                | `#timeline`     | Investigation Timeline | Timeline            | Timeline – …                         |
| `#gibtsnicht` eingeben       | `#gibtsnicht`   | Page not found         | _(keiner)_          | Not found – …                        |
| Zurück-Button                | `#timeline`     | Investigation Timeline | Timeline            | Timeline – …                         |
| `#evidence/E04`              | `#evidence/E04` | Evidence Catalogue     | Evidence            | Evidence – …                         |
| Reload auf `#people` (Build) | `#people`       | People & Locations     | People & Locations  | People & Locations – …               |

- In jedem Schritt genau **eine** `<section>` im `<main>` (Vanilla: immer alle fünf).
- Logo lädt (auch im Build unter `/Advanced_Web_OG/`), Platzhalter-Link führt auf
  `/Advanced_Web_OG/#people` (Vanilla). Keine Konsolenfehler.
- Vanilla-App unverändert: `#evidence` zeigt weiterhin 18 Karten, Nav-Einträge sind `<button>`.
- `npm run typecheck`, `lint`, `format:check`, `build` ✔.

---

## 2. Frage 1 – Wie wird „die aktuelle View“ verfolgt? Vergleich mit Vanilla

### Vanilla (`js/navigation.ts`, `js/state.ts`)

```ts
export function handleHashChange(): void {
  let hash = window.location.hash.replace("#", "");
  if (validViews.indexOf(hash) === -1) hash = "dashboard";
  state.currentPage = hash;                              // Kopie in globalem Objekt
  for (const section of sections) section.classList.remove("active");
  document.getElementById("view-" + hash)!.classList.add("active");
  for (const btn of navButtons) { /* active-Klasse von Hand umsetzen */ }
  if (hash === "dashboard") renderDashboard();
  else if (hash === "evidence" && !state.viewRendered.evidence) { renderEvidenceList(); ... }
  // ...
}
window.addEventListener("hashchange", handleHashChange); // (2× registriert, s. Demo 4)
```

### React (`src/hooks/useHashRoute.ts`, `src/App.tsx`)

```tsx
const hash = useSyncExternalStore(subscribe, getHash); // Hash direkt als Zustand
const route = parseHash(hash);                         // bei jedem Render abgeleitet
<Header activeView={activeView} />                     // aktiv = Vergleich im JSX
<PageRouter route={route} />                           // genau eine Seite
```

### Konzeptionell gleich (nur anders geschrieben)

- **Die Quelle der Wahrheit ist der URL-Hash.** Beide lesen `window.location.hash`.
- **Auslöser ist das `hashchange`-Event** – Klick, Zurück-Button, Adresszeile laufen in beiden
  Versionen über dasselbe Browser-Event.
- **Whitelist der erlaubten Views** (`validViews` ↔ `VIEWS`).
- **Zuordnung View → Inhalt** über eine Fallunterscheidung (`if/else if` ↔ `switch`).
- **Default ohne Hash:** Dashboard.

### Tatsächlich anders

| Aspekt                           | Vanilla                                                                                                    | React                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Wo liegt „die aktuelle View“** | Hash **plus Kopie** in `state.currentPage` (veränderliches globales Objekt)                                | **Nur** im Hash; `route` wird bei jedem Render daraus **abgeleitet** – keine zweite Kopie, die veralten kann |
| **Wie ändert sich die Anzeige**  | Imperativ: Klassen von Hand entfernen/setzen (Sections + Nav-Buttons), Render-Funktionen von Hand aufrufen | Deklarativ: JSX beschreibt „bei View X ist Button X aktiv und Seite X da“; React patcht den DOM              |
| **Nicht-aktive Views**           | Bleiben im DOM, per CSS versteckt                                                                          | Existieren nicht (werden **unmounted**)                                                                      |
| **Render-Cache**                 | `viewRendered`-Flags → Quelle des Dashboard-Bugs aus Übung 1                                               | Nicht nötig: Seite rendert, wenn sie gemountet wird oder sich ihre Daten ändern                              |
| **Listener-Verwaltung**          | Von Hand, einmal global (und versehentlich doppelt)                                                        | `subscribe`/Cleanup über `useSyncExternalStore` – React meldet an und ab                                     |
| **Navigation auslösen**          | `onclick="navigateTo('x')"` → braucht `window.navigateTo`                                                  | Normales `<a href="#x">` – kein JS für den Klick                                                             |
| **Typsicherheit**                | `string`; Tippfehler fallen erst zur Laufzeit auf                                                          | `ViewName`-Union; Tippfehler = Compile-Fehler, `switch` erschöpfend                                          |

**Wichtige Folge des Unmountens (ehrlicher Nachteil):** In Vanilla bleiben Filter und offene
Detailansicht erhalten, wenn man Evidence verlässt und zurückkommt (die Section bleibt im DOM). In
React wird `EvidencePage` beim Verlassen entfernt – lokaler `useState` darin wäre weg. Für Übung 4
heißt das: Zustand, der einen View-Wechsel überleben soll, gehört **in die URL** (z. B.
`#evidence?person=kernel-colt`) oder **oberhalb des Routers** (Provider aus Demo 7).

---

## 3. Frage 2 – Was passiert bei einer nicht existierenden View?

**Vanilla:** `#gibtsnicht` → `validViews` schlägt fehl → still `hash = "dashboard"`. Das Dashboard
wird angezeigt und hervorgehoben, **die URL bleibt aber `#gibtsnicht`** (in Demo 4 live geprüft). URL
und Inhalt widersprechen sich; der Nutzer erfährt nicht, dass sein Link falsch war; ein Lesezeichen
auf die falsche URL „funktioniert“ scheinbar.

**React-Shell:** `parseHash` liefert `{ kind: "notFound", requested: "gibtsnicht" }` →
`<NotFoundPage>`:

- Überschrift „Page not found“, Nennung des angefragten Namens, Link „Go to the dashboard“.
- **Kein** Nav-Eintrag ist hervorgehoben, Titel „Not found – …“.
- URL bleibt, was eingegeben wurde → URL und Inhalt passen zusammen.
- Zurück-Button führt zur vorigen gültigen View (live geprüft).
- Leerer Hash (App-Start) ist **kein** Fehler, sondern die Default-Route → Dashboard (wie Vanilla).
- `#evidence/E04` (gültige View + Zusatz) ist **kein** Not-Found: die View gilt, der Zusatz wird
  als Parameter mitgegeben.

**Alternative**, die ich bewusst nicht gewählt habe: unbekannten Hash per
`history.replaceState(null, "", "#dashboard")` auf das Dashboard umschreiben. Das wäre das
Verhalten der Vanilla-App, nur mit korrigierter URL – aber der Nutzer würde weiterhin nicht merken,
dass sein Link kaputt war. Eine Router-Bibliothek bietet beides an (`<Navigate replace>` bzw. eine
`*`-Route).

---

## 4. Live-Demo in der Übung

1. Zwei Tabs: Vanilla `/#evidence` und React `/react.html#evidence` – Header sieht gleich aus.
2. React: Nav-Einträge klicken → DevTools **Elements**: im `<main>` wechselt die **eine**
   `<section>`; bei Vanilla bleiben fünf da, nur `active` wandert.
3. Rechtsklick auf „Timeline“ → „Link in neuem Tab öffnen“ (geht in Vanilla nicht).
4. Zurück/Vor-Button, dann `#gibtsnicht` in der Adresszeile → Not-Found-Seite; dasselbe in Vanilla
   → Dashboard mit falscher URL.
5. React DevTools (Browser-Erweiterung): Komponentenbaum `App → Header → NavBar → NavButton ×5`,
   `PageRouter → TimelinePage → PagePlaceholder`.
6. Code: `useHashRoute.ts` neben `handleHashChange()` zeigen.
