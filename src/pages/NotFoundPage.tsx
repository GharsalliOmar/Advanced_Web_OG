// wird bei einem unbekannten hash gezeigt (z.b. #gibtsnicht).
// die vanilla-app zeigt in dem fall still das dashboard, laesst aber die
// falsche url stehen - url und inhalt passen dann nicht zusammen (demo 4).
// hier: ehrlich sagen, dass es die seite nicht gibt, und einen weg zurueck
// anbieten. die url bleibt, was der nutzer eingegeben hat.
import { DEFAULT_VIEW, hrefFor } from "../lib/routes";

interface NotFoundPageProps {
  requested: string;
}

export default function NotFoundPage({ requested }: NotFoundPageProps) {
  return (
    <section className="view active">
      <h2>Page not found</h2>
      <div className="intro-card">
        <p>
          There is no view called <code>{requested}</code>.
        </p>
        <p>
          <a href={hrefFor(DEFAULT_VIEW)}>Go to the dashboard</a>
        </p>
      </div>
    </section>
  );
}
