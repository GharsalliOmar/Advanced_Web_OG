# UE3 – Änderungsprotokoll

Laufende Notiz zu allen Änderungen in Übung 3, die nicht direkt eine eigene Demo-Datei haben. Die
Demos selbst sind in `UE3_DEMO*.md` dokumentiert.

---

## ESLint für TypeScript und React (zwischen Demo 6 und 7)

### Problem

Seit Übung 2 hat `eslint.config.js` nur `**/*.js` geprüft. Alle `.ts`-Dateien in `js/` und der neue
React-Code in `src/*.tsx` wurden **gar nicht gelintet** – `npm run lint` (und damit CI und Deploy)
war grün, ohne den eigentlichen Code anzusehen.

### Änderung

| Paket                         | Wofür                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `typescript-eslint`           | Parser für TS/TSX + TS-Regeln (`no-explicit-any`, `no-unused-vars` mit Typ-Verständnis, …)               |
| `eslint-plugin-react-hooks`   | „Rules of Hooks“ (Hooks nie in `if`/Schleifen/nach `return`) + vollständige `useEffect`-Abhängigkeiten   |
| `eslint-plugin-react-refresh` | Warnt, wenn eine `.tsx`-Datei neben Komponenten anderes exportiert → Fast Refresh könnte State verlieren |

`eslint.config.js`:

- `**/*.{ts,tsx}` → `tseslint.configs.recommended` (ohne Type-Information: schnell, keine
  `parserOptions.project` nötig; Typen prüft weiterhin `tsc`).
- `src/**/*.{ts,tsx}` (nur React-Code) → `react-hooks` (`recommended-latest`) + `react-refresh`
  (`vite`).
- `vite.config.js`/`eslint.config.js` → Node-Globals statt Browser-Globals.
- `ue3/**` ignoriert (Doku + Demo-5-Sandbox mit CDN-React).

**Geprüft:** `eslint --debug` zeigt 19 gelintete Dateien (vorher nur die `.js`-Configs). Testdatei
mit bedingtem `useState`, unbenutzter Variable und `any` → 3 Fehler
(`react-hooks/rules-of-hooks`, `@typescript-eslint/no-unused-vars`,
`@typescript-eslint/no-explicit-any`). Bestehender Code: 0 Fehler.

### Nebenwirkung: TypeScript 7.0.2 → 6.0.3

`typescript-eslint` (auch die neueste Canary 8.71) verlangt `typescript >=4.8.4 <6.1.0`. Grund:
TypeScript 7 ist der in Go neu geschriebene Compiler und bietet die **JavaScript-Compiler-API** nicht
mehr an, über die `typescript-eslint` den Code parst (`node_modules/typescript` enthält in 7.x nur
noch ein Starter-Skript für die native Binary und eine „unstable“ API).

**Entscheidung:** `typescript@6.0.3` – die letzte JS-basierte Version, gleiche Sprache und
Typprüfung. `npm run typecheck` läuft unverändert fehlerfrei. Nachteil: `tsc` ist langsamer als die
native Version – bei ~20 Dateien nicht spürbar.

Verworfene Alternativen:

- **TS 7 behalten + Oxlint** (Rust-Linter ohne TS-Abhängigkeit) für `.ts/.tsx`: zwei Linter, zwei
  Konfigurationen, Scripts und CI müssten beide aufrufen.
- **Gar nicht linten:** Hook-Regeln werden ab Demo 9/10 wichtig; Fehler dort sind zur Laufzeit
  schwer zu finden.

Erwähnungen von „TypeScript 7“ in `ue2/` bleiben als historischer Stand von Übung 2 stehen.
