// header mit branding + navigation - gleiches markup/gleiche css-klassen wie
// der statische header in index.html, damit beide versionen gleich aussehen.
import type { ViewName } from "../lib/routes";
import NavBar from "./NavBar";

// BASE_URL = "base" aus vite.config.js ("/Advanced_Web_OG/") - so stimmt der
// pfad im dev-server, in vite preview und auf github pages gleichermassen.
const logoSrc = import.meta.env.BASE_URL + "assets/logo/logo.svg";

interface HeaderProps {
  activeView: ViewName | null;
}

export default function Header({ activeView }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src={logoSrc} alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>
        <NavBar activeView={activeView} />
      </div>
    </header>
  );
}
