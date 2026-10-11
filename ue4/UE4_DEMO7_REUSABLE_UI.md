# UE4 – Demo 7: Wiederverwendbare UI-Elemente

> Aufgabe: Mindestens eine presentational Komponente herausziehen, die an **zwei oder mehr
> verschiedenen Stellen** der App wirklich benutzt wird (z. B. Badge, Kartenrahmen,
> Button-Variante). Ihre typisierte Props-API soll flexibel genug für alle Verwendungen sein, ohne
> ein Sammelsurium von Sonderfällen zu werden.
>
> Skript: Kapitel 16, _React Component Design and Routing_.

---

## 1. Was gebaut wurde

### Neu herausgezogen: `BulletList`

`src/features/people-locations/BulletList.tsx`

```tsx
interface BulletListProps {
  items: string[];
}

export default function BulletList({ items }: BulletListProps) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

Vorher stand **zweimal fast dasselbe** `<ul>{….map((x, index) => <li key={index}>{x}</li>)}</ul>`
in `PersonCard` (Aufgaben einer Person) und `LocationCard` (was ein Ort enthält), sogar mit zwei
leicht unterschiedlichen Kommentaren zur Key-Wahl. Jetzt:

```tsx
// PersonCard.tsx
<BulletList items={person.responsibilities} />
// LocationCard.tsx
<BulletList items={location.contains} />
```

Im Browser geprüft: gleiche Anzahl `<li>` pro Karte wie vorher (People 4/3/4/4/3/5, Locations
5/3/4/4/3/3).

Liegt in `features/people-locations/`, weil bisher nur dieses Feature sie benutzt (Regel aus
Demo 6). Benutzt sie ein zweites Feature, wandert sie nach `components/`.

### Bereits vorhanden und jetzt über Feature-Grenzen benutzt

| Komponente   | Wo benutzt                                                                                         | Status        |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------- |
| `Badge`      | `CaseSummaryCard`, `RecentEvidenceList` (Dashboard) **und** `TimelineItem` (Timeline, seit Demo 2) | `components/` |
| `Card`       | `PersonCard`, `LocationCard` (seit Demo 1)                                                         | feature-lokal |
| `BulletList` | `PersonCard`, `LocationCard` (neu)                                                                 | feature-lokal |

---

## 2. Fragen

### F1: Wo wird die Komponente benutzt, was variiert per Props, was bleibt fest – und wo liegt die Grenze?

**`Badge`** (`src/components/Badge.tsx`), das beste Beispiel, weil es zwei Features verbindet:

| Stelle                          | Aufruf                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| Dashboard, `CaseSummaryCard`    | `<Badge tone="flagged">{caseFile.status.toUpperCase()}</Badge>`           |
| Dashboard, `RecentEvidenceList` | `<Badge tone={statusTone(ev.status)}>{ev.status}</Badge>`                 |
| Timeline, `TimelineItem`        | `<Badge tone={CERTAINTY_TONE[event.certainty]}>{event.certainty}</Badge>` |

- **Variiert (Props):** `tone`, also die Farbe (`"reviewed" | "unreviewed" | "flagged" | "critical" | "relevant"`),
  und `children`, der Text.
- **Fest (in der Komponente):** das Element (`<span>`), das Klassen-Schema `badge badge-<tone>`,
  und damit Form, Schrift und Abstände aus dem CSS.

**`BulletList`:**

- **Variiert:** `items`, nur der Inhalt.
- **Fest:** `<ul>`/`<li>`-Markup und die **Key-Regel** (Index, begründet in Demo 4 F3). Die Regel
  steht jetzt an **einer** Stelle statt zweimal.

**Wo die Grenze liegt:** Props bekommt nur, **was sich zwischen den echten Verwendungen
tatsächlich unterscheidet**. Alles, was überall gleich ist, bleibt fest.

- Bei `Badge` unterscheidet sich **was es bedeutet** (Status vs. Certainty), aber nicht **wie es
  aussieht**. Deshalb gibt es `tone` als Prop, und die Übersetzung „Bedeutung → Farbe“ macht der
  **Aufrufer** (`statusTone()` im Dashboard, `CERTAINTY_TONE` in der Timeline). Würde `Badge`
  selbst `status` und `certainty` kennen, bräuchte es für jedes Feature einen Sonderfall
  (`if (certainty) … else if (status) …`). Genau das „special-cased mess“ aus der Angabe.
- `tone` ist ein **Union-Typ**, kein `string`/`className`. Man kann nur Farben wählen, für die es
  CSS gibt, und kein beliebiges Styling hineinreichen.
- Bei `BulletList` steht die Überschrift („Contains:“) bewusst **nicht** in der Komponente. Die
  `LocationCard` hat eine, die `PersonCard` nicht. Eine optionale `title`-Prop wäre der erste
  Sonderfall gewesen. Der Aufrufer schreibt sie einfach davor.

Faustregel: **Erst bei der zweiten echten Verwendung herausziehen**, und nur das variabel machen,
was die zwei Verwendungen wirklich unterscheidet. Keine Props auf Vorrat.

### F2: Vergleich mit dem doppelten HTML-Template-Code der Vanilla-App

In der Vanilla-App steht dasselbe Markup mehrfach als String-Verkettung, z. B. die Listenzeile
`'<div class="mini-list-item"><strong>' + …` zweimal in `js/views/dashboard.ts` und nochmal zweimal
in `js/views/workspace.ts`, jeweils leicht anders zusammengesetzt. Das Badge-Markup
`'<span class="badge ' + …` steht an 6 Stellen in `dashboard.ts`, `evidence.ts` und
`timeline.ts`. Bei People & Locations bauen
`renderPeople()` und `renderLocations()` je ihre eigene `<ul>`-Schleife mit `html += "<li>" + … +
"</li>"`.

Was die Komponente gibt, was kopierte Template-Strings nicht geben:

| Kopierte Strings (Vanilla)                                                                                                             | Komponente (React)                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Änderung muss an **jeder** Kopie gemacht werden. Vergisst man eine, sehen gleiche Dinge unterschiedlich aus.                           | **Eine** Stelle ändern, alle Verwendungen ändern sich mit.                              |
| Kopien **driften auseinander** („slightly differently“ in der Angabe): ein Feld mehr hier, eine Klasse weniger da.                     | Unterschiede sind nur über **Props** möglich und damit sichtbar und benannt.            |
| Ein String hat **keinen Typ**. Ein Tippfehler in `"badge-reviewd"` oder ein fehlendes Feld fällt erst im Browser auf (oder gar nicht). | **Typisierte Props**: `tone="reviewd"` ist ein Compile-Fehler, eine fehlende Prop auch. |
| Daten werden **ungeschützt** in HTML eingesetzt (`innerHTML` → XSS-Risiko bei Notizen).                                                | `{item}` wird von React **escaped**.                                                    |
| Man sieht am Aufruf nicht, **was** gebaut wird, nur String-Teile.                                                                      | `<BulletList items={…} />` liest sich wie das, was es ist.                              |
| Keine Identität: Bei jedem Rendern wird alles per `innerHTML` neu erzeugt.                                                             | React kann Knoten wiederverwenden (Keys, Demo 3).                                       |

Kurz: Eine Kopie ist **Text, der zufällig gleich aussieht**. Eine Komponente ist **ein benanntes
Ding mit Vertrag** (dem Props-Typ), das der Compiler prüft und das es nur einmal gibt.
