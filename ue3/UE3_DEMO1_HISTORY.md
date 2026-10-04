# UE3 – Demo 1: Historische Einordnung des Webs

> Aufgabe: Kurz erklären, wie sich Webanwendungen entwickelt haben, und diese App auf der Zeitleiste
> einordnen (mit Begründung). Dazu zwei Fragen zu AJAX/jQuery und zum Hash-Routing.
>
> Skript: Kapitel 12, _From Static Documents to Rich Web Applications_ (PDF S. 85–88).

---

## 0. Begriffe (Glossar)

| Begriff                                    | Erklärung                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HTML**                                   | Die Auszeichnungssprache, die den _Inhalt und die Struktur_ einer Seite beschreibt (Überschriften, Absätze, Buttons, …). Ist erstmal nur Text.                                                                                                                                                  |
| **DOM** (Document Object Model)            | Die _Baumstruktur aus Objekten_, die der Browser aus dem HTML baut. Jedes Element (`<div>`, `<button>`) ist ein Knoten in diesem Baum. JavaScript ändert nie das HTML-File, sondern immer den DOM – z. B. `document.getElementById("x").textContent = "…"`. Was im DOM steht, sieht der Nutzer. |
| **Rendern**                                | Aus Daten sichtbare Oberfläche machen. Entweder _serverseitig_ (Server baut fertiges HTML) oder _clientseitig_ (JavaScript im Browser baut den DOM).                                                                                                                                            |
| **Request / Roundtrip**                    | Eine Anfrage vom Browser an den Server und die Antwort zurück. Bei klassischen Websites löst jeder Klick einen vollständigen Roundtrip aus, der eine komplett neue Seite liefert.                                                                                                               |
| **Full Page Reload**                       | Der Browser verwirft die aktuelle Seite komplett (DOM, JS-Variablen, Scroll-Position) und baut die neue von Null auf.                                                                                                                                                                           |
| **Statische Website**                      | Der Server liefert fertige Dateien 1:1 aus, ohne pro Anfrage etwas zu berechnen (z. B. GitHub Pages).                                                                                                                                                                                           |
| **Dynamische (serverseitige) Website**     | Ein Programm auf dem Server (PHP, Java, Python, …) erzeugt das HTML _bei jeder Anfrage_ neu, meist mit Daten aus einer Datenbank.                                                                                                                                                               |
| **JavaScript**                             | Die Programmiersprache, die im Browser läuft (seit 1995). Kann auf den DOM zugreifen, auf Klicks reagieren und Daten nachladen.                                                                                                                                                                 |
| **AJAX** (Asynchronous JavaScript and XML) | Technik, mit der JavaScript _im Hintergrund_ Daten vom Server holt, ohne die Seite neu zu laden, und dann nur einen Teil des DOM aktualisiert. Begriff von 2005. Ursprünglich über `XMLHttpRequest`, heute über `fetch()`. Trotz des Namens heute fast immer JSON statt XML.                    |
| **XMLHttpRequest (XHR)**                   | Die ursprüngliche Browser-API für AJAX-Anfragen. Umständlich zu benutzen; heute durch `fetch()` ersetzt.                                                                                                                                                                                        |
| **JSON**                                   | Textformat für strukturierte Daten (`{"id": "E01", "title": "…"}`). Unsere App lädt `public/data/*.json` per `fetch()`.                                                                                                                                                                         |
| **jQuery**                                 | JavaScript-Bibliothek von 2006. Hat die damals großen Unterschiede zwischen Browsern (v. a. Internet Explorer) versteckt und DOM-Manipulation und AJAX stark vereinfacht: `$("#x").hide()`, `$.ajax(...)`. Jahrelang auf fast jeder Website; heute dank moderner Browser-APIs kaum noch nötig.  |
| **Web 2.0**                                | Schlagwort (~2004–2010) für interaktive Websites, auf denen Nutzer selbst Inhalte erzeugen (Facebook, YouTube, Wikipedia) – technisch stark auf AJAX gestützt.                                                                                                                                  |
| **SPA** (Single-Page Application)          | Eine Webanwendung, die nur _einmal_ ein HTML-Dokument lädt. Danach tauscht JavaScript die Inhalte (Views) selbst aus und holt nur noch Daten nach. Kein Full Page Reload beim Navigieren. **Unsere App ist eine SPA.**                                                                          |
| **MPA** (Multi-Page Application)           | Das klassische Gegenstück: jede „Seite“ ist ein eigenes HTML-Dokument vom Server, jeder Link = Full Page Reload.                                                                                                                                                                                |
| **Client-Side Rendering (CSR)**            | Der Browser bekommt ein (fast) leeres HTML + JavaScript, und das JavaScript baut die sichtbare Oberfläche. Typisch für SPAs.                                                                                                                                                                    |
| **Server-Side Rendering (SSR)**            | Der Server schickt bereits fertiges HTML mit Inhalt. Klassisch bei MPAs, heute auch bei modernen Frameworks (Next.js) kombiniert mit SPA-Verhalten.                                                                                                                                             |
| **Routing**                                | Die Zuordnung „welche URL → welche Ansicht“. Bei MPAs macht das der Server, bei SPAs JavaScript im Browser (_Client-side Routing_).                                                                                                                                                             |
| **Hash / Fragment**                        | Der Teil einer URL nach `#` (z. B. `…/index.html#evidence`). Wird **nie an den Server geschickt** – ändert er sich, lädt der Browser nichts neu, legt aber einen History-Eintrag an und feuert das Event `hashchange`.                                                                          |
| **Hash-Routing**                           | Client-side Routing über den Hash: `#dashboard`, `#evidence`, … JavaScript hört auf `hashchange` und zeigt die passende View. So macht es unsere App (`handleHashChange()` in `js/navigation.ts`).                                                                                              |
| **History API / `pushState`**              | Neuere Browser-API (HTML5), mit der JavaScript die URL _ohne_ `#` ändern kann (`/evidence`). Saubere URLs, braucht aber einen Server, der für jede URL `index.html` zurückgibt.                                                                                                                 |
| **Framework vs. Bibliothek**               | Eine Bibliothek (jQuery, React) rufst _du_ auf, wann du willst. Ein Framework (Angular) gibt die Struktur vor und ruft _deinen_ Code auf. React wird oft „Framework“ genannt, ist streng genommen eine UI-Bibliothek.                                                                           |
| **MVC / MV\***                             | Architekturmuster: **M**odel (Daten), **V**iew (Darstellung), **C**ontroller (Logik dazwischen). Frühe SPA-Frameworks (Backbone, AngularJS) haben das in den Browser gebracht.                                                                                                                  |
| **Komponente**                             | Ein in sich geschlossener, wiederverwendbarer UI-Baustein (z. B. `<StatCard>`), der aus Daten (Props/State) seine Darstellung beschreibt. Grundidee von React, Vue, Angular 2+.                                                                                                                 |
| **Deklarativ vs. imperativ**               | _Imperativ_: Schritt für Schritt sagen, wie der DOM geändert wird (`el.innerHTML = …`, `classList.add(…)`). _Deklarativ_: beschreiben, wie die UI bei einem bestimmten Zustand aussehen soll – das Framework kümmert sich um die DOM-Änderungen.                                                |
| **Virtual DOM**                            | Eine leichte Kopie des DOM als JavaScript-Objekte. React vergleicht alte und neue Version („Diffing“) und ändert im echten DOM nur, was sich wirklich geändert hat. (Thema von Demo 3.)                                                                                                         |
| **Hydration**                              | Bei SSR: Das fertige HTML vom Server wird im Browser von JavaScript „übernommen“ und interaktiv gemacht.                                                                                                                                                                                        |
| **SSG** (Static Site Generation)           | HTML wird einmal beim Build erzeugt und dann statisch ausgeliefert (Mischform aus statisch und dynamisch).                                                                                                                                                                                      |
| **SEO**                                    | Search Engine Optimization – ob Suchmaschinen den Inhalt einer Seite finden und indexieren können. Bei reinem CSR schwieriger, weil der Inhalt erst durch JavaScript entsteht.                                                                                                                  |

---

## 1. Zeitleiste der Webanwendungen

```
1991 ──── 1995 ──── 2005 ──── 2010 ──── 2013 ──── 2016 ──── heute
 │ Statische │ Server-   │  AJAX /   │ Frühe     │ Komponenten-│ Hybrid:
 │ Dokumente │ seitig    │  Web 2.0  │ SPAs      │ SPAs        │ SSR/SSG +
 │ (Web 1.0) │ dynamisch │  jQuery   │ Backbone, │ React, Vue, │ Hydration,
 │           │ PHP, CGI  │           │ AngularJS │ Angular 2+  │ Next.js, RSC
                                          ▲
                                     unsere App
                              (Architektur ~2011, Tooling 2020er)
```

| Ära                                                             | ca.       | Wer erzeugt das HTML?                                       | Was passiert bei einem Klick?                                                  |
| --------------------------------------------------------------- | --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Statische Dokumente** (Web 1.0)                               | 1991–1995 | Fertige `.html`-Dateien auf dem Server                      | Full Page Reload                                                               |
| **Serverseitig dynamisch** (CGI, PHP, ASP, JSP)                 | 1995–2005 | Server pro Anfrage, meist aus einer Datenbank               | Full Page Reload; JavaScript nur für kleine Effekte                            |
| **AJAX / Web 2.0** (Gmail 2004, Google Maps 2005, jQuery 2006)  | 2005–2010 | Hauptsächlich der Server; JS lädt Teile im Hintergrund nach | Nur ein Teil der Seite wird ausgetauscht                                       |
| **Frühe SPAs** (Backbone.js, AngularJS – beide 2010)            | 2010–2014 | Der Browser; Server liefert nur noch JSON                   | JS tauscht die View; Routing über `#`-URLs                                     |
| **Komponenten-SPAs** (React 2013, Vue 2014, Angular 2+ 2016)    | ab 2013   | Der Browser, deklarativ über Komponenten + Virtual DOM      | Zustand ändert sich → Framework rendert neu; Build-Tools & TypeScript Standard |
| **Hybrid** (Next.js 2016, Nuxt, Astro, React Server Components) | ab ~2016  | Teils wieder der Server (SSR/SSG), dann Hydration im Client | Erster Aufruf schnell & servergerendert, danach wie eine SPA                   |

**Roter Faden:** Das Rendern ist vom **Server zum Client** gewandert – und wandert seit einigen Jahren
**teilweise wieder zurück**, weil reines CSR Nachteile beim ersten Laden und bei SEO hat.

---

## 2. Einordnung dieser App

**These:** Die App ist architektonisch eine **frühe SPA (~2010–2013), nur ohne Framework** – mit
**Tooling der 2020er** (Vite, TypeScript, CI/CD). Mit Übung 3 machen wir den Schritt in die
**Komponenten-Ära**.

| Merkmal                                    | Beleg im Code                                                                                  | Passt zu                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Server liefert nur statische Dateien       | GitHub Pages, keine Server-Logik im Repo; Daten in `public/data/*.json`                        | SPA                                                             |
| Daten kommen als JSON, nicht als HTML      | `fetch("data/case.json")` usw. in `js/data.ts`                                                 | SPA (bei AJAX lieferte der Server oft fertige HTML-Schnipsel)   |
| Alle 5 Views in **einem** HTML-Dokument    | `<section id="view-dashboard">` … `<section id="view-workspace">` in `index.html`              | SPA – Views werden nur ein-/ausgeblendet                        |
| Hash-Routing ohne Neuladen                 | `handleHashChange()` in `js/navigation.ts` hört auf `hashchange`, toggelt CSS-Klasse `active`  | Typisch frühe SPA (Backbone.Router, AngularJS `ngRoute`)        |
| Imperatives Rendern per HTML-String        | `html += '<div class="stat-card">…'` → `container.innerHTML = html` in `js/views/dashboard.ts` | Vor der Komponenten-Ära: kein deklaratives UI, kein Virtual DOM |
| Manuelles Steuern, wann neu gerendert wird | `state.viewRendered.evidence` usw. in `js/navigation.ts`                                       | Vor dem Prinzip „UI = f(state)“                                 |
| Modernes Tooling                           | Vite, TypeScript, ES-Module, ESLint/Prettier, GitHub Actions                                   | 2020er                                                          |

**Warum nicht die anderen Ären?**

- **Nicht serverseitig dynamisch:** Kein einziges HTML wird auf dem Server berechnet.
- **Nicht AJAX/jQuery:** Dort lieferte der Server die Seite, JS ergänzte nur Teile. Hier baut der
  Client **die gesamte UI** aus JSON.
- **Nicht Komponenten-Ära:** Keine wiederverwendbaren Komponenten, kein deklaratives Rendering – der
  DOM wird von Hand per `innerHTML` überschrieben.

---

## 3. Frage 1 – Was hat AJAX/jQuery gelöst, und welche neuen Probleme entstanden?

### Problem vorher

Bei servergerenderten Seiten war **jede** Interaktion ein kompletter Roundtrip:

- die ganze Seite wird neu übertragen und neu gerendert → langsam, Flackern, viel Datenvolumen;
- Scroll-Position, Formulareingaben, aufgeklappte Elemente gehen verloren;
- echte „Anwendungs-Interaktion“ ist unmöglich (Karte verschieben ohne Neuladen → Google Maps;
  neue Mails sehen ohne Neuladen → Gmail).

### Lösung durch AJAX und jQuery

- **AJAX** (`XMLHttpRequest`): JavaScript fragt Daten **im Hintergrund** an und aktualisiert **nur
  einen Teil** des DOM. Die Seite bleibt stehen.
- **jQuery** glättete die Browser-Unterschiede (XHR war im IE ein ActiveX-Objekt, Events
  funktionierten unterschiedlich) und bot eine kurze API für DOM und AJAX.

### Neue Probleme

1. **Zustand an zwei Orten:** Teils im Server-HTML, teils per JS ins DOM geschrieben – oft wurde das
   DOM selbst zur „Wahrheit“. Unklar, was der aktuelle Stand ist.
2. **Imperativer Spaghetti-Code:** Jede Änderung muss von Hand an allen betroffenen DOM-Stellen
   nachgezogen werden. Vergisst man eine, ist die UI inkonsistent – genau das passierte in Übung 1
   (Dashboard zeigte veraltete Bookmark-Zahlen wegen des `viewRendered`-Flags).
3. **URL, Zurück-Button und Lesezeichen kaputt:** Die URL ändert sich bei AJAX-Updates nicht.
4. **SEO:** Crawler sahen nachgeladene Inhalte nicht.
5. **Keine Struktur** für große Anwendungen; Speicherlecks durch vergessene Event-Handler;
   XSS-Risiko durch zusammengebaute HTML-Strings.

### Antwort der SPA-Frameworks

- feste Struktur (MV\*, später Komponenten);
- **deklaratives Rendering** – UI wird aus dem Zustand abgeleitet (UI = f(state)) statt von Hand
  gepatcht;
- client-seitiges Routing mit funktionierender History;
- später Virtual DOM + Diffing, um nur Geändertes anzufassen.

---

## 4. Frage 2 – Aus welcher Ära stammt Hash-Routing?

**Ära:** frühe SPAs, ca. **2009–2013** (Backbone.Router, AngularJS `ngRoute`, Twitters `#!`-URLs
2010, Googles „AJAX crawling scheme“ für `#!` 2009, 2015 eingestellt).

**Warum der Hash?**

- Eine Änderung nur nach dem `#` schickt **keine Anfrage an den Server** → die Seite bleibt geladen.
- Trotzdem entsteht ein **Eintrag in der Browser-History** und das Event `hashchange` feuert
  (verfügbar ab ~2009, IE8) → Zurück-Button und Lesezeichen funktionieren wieder (löst AJAX-Problem 3).
- Funktioniert auf **jedem statischen Server**, ohne Konfiguration.

**Was das über den Zeitpunkt sagt:** Das Muster wurde üblich, als Browser zwar `hashchange` konnten,
die HTML5 History API (`pushState`, saubere URLs wie `/evidence`) aber noch nicht überall verfügbar
war (breit erst ~2011–2012, IE10). `pushState` braucht außerdem einen Server, der für jede URL
`index.html` zurückgibt. Danach wechselten die meisten Router auf `pushState`; der Hash blieb als
Fallback.

**Bezug zu unserer App:** Für uns ist Hash-Routing **heute noch sinnvoll**, weil GitHub Pages keine
Rewrite-Regeln kennt: Ein Reload auf `/Advanced_Web_OG/evidence` (pushState) gäbe 404, auf
`/Advanced_Web_OG/#evidence` funktioniert er.

---

## 5. Live-Demo in der Übung

1. Zeitleiste + Einordnungstabelle (Abschnitt 1 und 2) zeigen.
2. Im Code zeigen: `index.html` (alle Sections in einer Seite), `js/navigation.ts`
   (`handleHashChange`), `js/views/dashboard.ts` (`innerHTML`-String).
3. Im Browser: DevTools → **Network**-Tab offen, zwischen Views wechseln → **keine** neue
   HTML-Anfrage, nur die URL nach `#` ändert sich. Zurück-Button funktioniert trotzdem.
