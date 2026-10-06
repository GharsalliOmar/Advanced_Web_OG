# UE3 – Demo 8: Architecture Decision Record (ADR)

> Aufgabe: Begründen, ob eine **SPA mit React** für **diese App** die richtige Wahl ist – inklusive
> ehrlicher Nachteile. Dazu zwei Fragen: Was würde man verlieren (mit einer klassischen Website bzw.
> mit einer anderen SPA-Lösung)? Und bleibt man bei SPA, wenn die App auf schwachen Geräten / bei
> schlechtem Internet laufen **muss**?
>
> Skript: Kapitel 13–15 (PDF S. 90–109).

## Was ist ein ADR?

Ein **Steckbrief einer Entscheidung**, damit später jemand nachlesen kann, **warum** etwas so gebaut
wurde:

1. **Ausgangslage** – was ist das für eine App?
2. **Möglichkeiten** – was hätte man sonst machen können?
3. **Entscheidung** – was wurde gewählt, und warum?
4. **Folgen** – was gewinnt man, was verliert man?

---

## ADR-001: React-SPA für Project ReMotion

| Status    | Angenommen (Übung 3) |
| --------- | -------------------- |
| **Datum** | 2026-10-05           |

### 1. Ausgangslage – was ist unsere App?

- Ein **Werkzeug zum Arbeiten**, keine Seite zum Lesen: filtern, suchen, Bookmarks setzen, Notizen
  schreiben, zwischen Ansichten springen.
- **Wenig Daten:** 18 Evidence-Einträge, 6 Personen, 6 Orte, 15 Timeline-Events (~28 kB JSON).
- **Kein Server mit Logik:** Die Daten sind fertige Dateien auf GitHub Pages, gespeichert wird nur
  im Browser (`localStorage`).
- **Nicht öffentlich:** Google muss die App nicht finden.
- **Probleme der bisherigen Version** (Übung 1, Demo 3/4/7): Anzeige muss von Hand aktualisiert
  werden (Dashboard-Bug), kopierter HTML-Code läuft auseinander, XSS-Lücke bei Notizen.

### 2. Die Möglichkeiten

| Option                                 | In einem Satz                                                       |
| -------------------------------------- | ------------------------------------------------------------------- |
| **Klassische Website (MPA)**           | Jede Ansicht ist eine eigene Seite, jeder Klick lädt neu.           |
| **Vanilla behalten**                   | So weitermachen wie jetzt, nur aufräumen.                           |
| **React** ✅                           | UI in Bausteinen, React kümmert sich ums Aktualisieren.             |
| **Kleinere Alternative**               | Preact oder Svelte – wie React, aber viel kleiner.                  |
| **Vorgerenderte Seiten + bisschen JS** | Seiten sind fertig, nur Filter/Buttons bekommen JavaScript (Astro). |

### 3. Die Entscheidung: React-SPA

**Warum SPA** (und keine klassische Website)?

- Die App ist **interaktiv** – bei jedem Filter oder Stern neu laden wäre nervig.
- Mehrere Ansichten **teilen sich Daten** (Bookmarks: Dashboard, Evidence, Workspace) – in einer
  SPA einfach.
- Es gibt **keinen Server**, der Seiten bauen könnte.

**Warum React** (statt Vanilla)?

- Die Fehler aus Übung 1 kamen daher, dass man die Oberfläche **von Hand** aktualisieren muss und
  dabei Stellen vergisst. React macht das **automatisch**.
- **Bausteine statt Copy-Paste:** ein `<Badge>` statt sechsmal derselbe HTML-String.
- **Sicherer:** React maskiert Text automatisch → die XSS-Lücke bei Notizen verschwindet.
- **Verbreitet:** viele Werkzeuge, viel Hilfe, gefragt am Arbeitsmarkt – und die Lehrveranstaltung
  verlangt es.

### 4. Die Folgen

**Gewinnen wir:**

- Anzeige ist immer aktuell, ohne „neu rendern“ von Hand.
- Weniger doppelter Code, klarere Struktur.
- Routen mit Parametern möglich (`#evidence/E04`) → teilbare Links.

**Verlieren wir (ehrlich):**

- **Viel größer:** React-Version ~68,6 kB statt ~5,8 kB (gzip) – etwa **12× so groß**, React allein
  ist sogar etwa **7× so groß wie alle Falldaten zusammen**. Für 18 Einträge eigentlich
  überdimensioniert.
- **Langsamer beim ersten Öffnen:** erst React laden, dann Daten holen, dann anzeigen.
- **Ohne JavaScript ist die Seite leer.**
- **Mehr Werkzeuge, mehr Ärger:** z. B. musste TypeScript 7 auf 6 zurück, weil ein ESLint-Paket es
  verlangte.
- **Neue Regeln lernen:** Hooks, reine Komponenten (Demo 5).

### Fazit in einem Satz

> **Eine SPA passt gut zu dieser App. React ist vertretbar, aber nicht die sparsamste Wahl – Preact
> oder Svelte würden auch reichen. React wird vor allem wegen Verbreitung, Werkzeugen und der
> Lehrveranstaltung gewählt.**

### Wann neu entscheiden?

- Die App soll öffentlich und über Google auffindbar werden.
- Nutzer mit schwachen Geräten oder schlechtem Netz (siehe Frage 2).
- Die Bundle-Größe wird zum Problem → Preact testen.

---

## Frage 1 – Was würde man verlieren?

**Mit einer klassischen Website (MPA):**

- Jeder Klick lädt neu; Filter und Eingaben gehen beim Seitenwechsel verloren.
- Für Suche und Bookmarks bräuchte man **trotzdem** JavaScript – man hätte also beides.
- _Gewinnen_ würde man: schnellerer erster Seitenaufbau, funktioniert ohne JavaScript.

**Mit React statt einer Alternative:**

| Gegenüber …         | Mit React verliert man …                           | Mit React gewinnt man …                      |
| ------------------- | -------------------------------------------------- | -------------------------------------------- |
| **Vanilla**         | Größe und Einfachheit (keine Abhängigkeiten)       | automatisches Aktualisieren, Struktur        |
| **Preact / Svelte** | Größe – die wären viel kleiner und teils schneller | größeres Ökosystem, mehr Hilfe und Werkzeuge |

## Frage 2 – Schwache Handys / schlechtes Internet als Pflicht?

**Dann würde ich nicht bei der React-SPA bleiben.**

**Warum:** Ein schwaches Handy muss erst das ganze React herunterladen und ausführen, **bevor**
überhaupt etwas zu sehen ist. Bei schlechtem Netz dauert das lange.

**Stattdessen:** Die Seiten **beim Build fertig erzeugen** – das geht, weil unsere Daten sich nie
ändern. Der Nutzer bekommt sofort eine fertige Seite mit Inhalt, auch ohne JavaScript. Nur die
Teile, die man wirklich anklickt (Filter, Stern, Formular), bekommen ein **kleines** Stück
JavaScript (z. B. mit Astro).

---

## Zum Merken

1. **ADR** = Steckbrief einer Entscheidung: Lage, Optionen, Entscheidung, Folgen.
2. **SPA: ja** – interaktiv, Daten werden geteilt, kein Server.
3. **React: okay, aber nicht ideal** – löst unsere Probleme, ist aber sehr groß für so wenig Daten.
4. **Schwache Geräte:** vorgerenderte Seiten mit wenig JavaScript.

## Live-Demo in der Übung

1. `npm run build` → im Terminal die Größe von `main-*.js` (Vanilla) und `react-*.js` vergleichen.
2. DevTools → Network → „Slow 3G“ → `react.html` neu laden → zeigen, wie lange die Seite leer
   bleibt.
3. Fazit-Satz und „Wann neu entscheiden?“ vorlesen.
