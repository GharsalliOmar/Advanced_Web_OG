// ---------------------------------------------------------------------
// REACT ENTRY POINT (ue3 demo 6)
// wird von react.html als <script type="module" src="src/main.tsx"> geladen.
// sucht das leere <div id="root"> und uebergibt es an react - ab hier
// gehoert alles innerhalb von #root react, wir fassen den DOM dort nie
// mehr selbst an.
// ---------------------------------------------------------------------
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Expected #root to exist in react.html");
}

// StrictMode: nur in der entwicklung aktiv, rendert komponenten bewusst
// doppelt, um unreine komponenten aufzudecken (siehe demo 5 frage 3).
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
