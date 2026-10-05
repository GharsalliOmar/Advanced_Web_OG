// demo 4 (ue2): eslint-konfiguration (flat config, das neue format ab eslint 9).
// prueft NUR echten-code-logik (typos, unused vars, unreachable code, ...) -
// alles was mit AUSSEHEN zu tun hat (anfuehrungszeichen, einrueckung, semikolons)
// macht prettier, siehe .prettierrc. eslint-config-prettier ganz am ende schaltet
// die paar eslint-eigenen stil-regeln ab, damit sich beide werkzeuge nicht in
// die quere kommen.
// ue3 (vor demo 7): bis hierher hat eslint NUR **/*.js angeschaut - alle
// .ts-dateien aus ue2 und der neue react-code (.tsx) wurden gar nicht gelintet.
// jetzt dazu:
// - typescript-eslint: parser, der TS/TSX versteht + TS-spezifische regeln.
//   bewusst die "recommended"-variante OHNE type-information (kein
//   parserOptions.project) - schnell und ohne extra-konfiguration; die
//   typpruefung selbst macht weiterhin tsc (npm run typecheck).
//   achtung: typescript-eslint braucht die JS-API von typescript -> die gibt
//   es in typescript 7 (go-port) nicht mehr, deshalb typescript 6.0.3.
// - react-hooks: prueft die "rules of hooks" (hooks nur oben in komponenten,
//   nie in if/schleifen) und vollstaendige useEffect-abhaengigkeiten.
// - react-refresh: warnt, wenn eine .tsx-datei neben komponenten noch andere
//   sachen exportiert - dann kann vite's fast refresh den state nicht behalten.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    // app.js: eingefrorene vor-refactor-datei aus ue1, nur zum diffen behalten,
    // wird nie mehr angefasst -> soll auch nicht gelintet werden.
    // dist/, public/, node_modules/: generierte bzw. daten-/bild-dateien, kein
    // code von uns. ue1/, ue2/, ue3/: doku (+ die demo5-wegwerf-sandbox).
    ignores: ["dist/**", "public/**", "node_modules/**", "app.js", "ue1/**", "ue2/**", "ue3/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    // react-regeln nur fuer den react-code, nicht fuer die vanilla-.ts in js/
    files: ["src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"], reactRefresh.configs.vite],
  },
  // vite.config.js laeuft in node, nicht im browser
  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  prettierConfig
);
