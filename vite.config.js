// demo 2 (ue2): minimal vite-config.
// braucht fast nichts, weil unser layout schon zu vite's zero-config-defaults passt:
// - index.html liegt im projekt-root      -> vite findet den einstiegspunkt automatisch
// - "public/" ist vite's default-name fuer statische dateien, die 1:1 (ungehasht,
//   unveraendert) unter derselben absoluten url ausgeliefert werden -> data/*.json
//   (per fetch() geladen) und assets/... (per <img src> aus JSON-daten gerendert)
//   passen genau in dieses schema, weil beides zur build-zeit NICHT statisch analysierbar
//   ist (fetch-pfad ist ein string, img-src wird erst zur laufzeit aus JSON gebaut).
// demo 9 (ue2): "base" ergaenzt - github pages liefert ein projekt (kein
// user/org-Pages-repo) nicht unter "/", sondern unter "/<repo-name>/" aus
// (https://gharsalliomar.github.io/Advanced_Web_OG/). ohne "base"
// wuerde vite alle asset-pfade im build relativ zu "/" schreiben -> 404 fuer
// js/css/bilder, sobald die seite unter dem repo-unterpfad laeuft. betrifft
// NICHT nur den build: vite haengt "base" auch beim dev-server/preview an
// die url an (z.b. localhost:5173/Advanced_Web_OG/) - ein
// aufruf von localhost:5173/ alleine leitet automatisch dorthin um.
// demo 6 (ue3): react dazu.
// - plugin-react: uebersetzt JSX/TSX (automatic runtime, "react/jsx-runtime")
//   und haengt react fast refresh an HMR an (komponenten-aenderung ohne
//   state-verlust).
// - zwei html-einstiegspunkte: index.html = bestehende vanilla-app (bleibt
//   unangetastet), react.html = neue react-version waehrend der migration.
//   vite baut im dev-server automatisch jede .html-datei, im build aber nur
//   index.html - deshalb rollupOptions.input mit beiden. ohne das wuerde
//   react.html auf github pages schlicht fehlen (404).
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/Advanced_Web_OG/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        react: resolve(root, "react.html"),
      },
    },
  },
});
