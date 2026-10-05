import type { CaseFile } from "../../js/types";
import Badge from "./Badge";

interface CaseSummaryCardProps {
  caseFile: CaseFile;
}

export default function CaseSummaryCard({ caseFile }: CaseSummaryCardProps) {
  return (
    <div className="case-summary-card">
      <h3>{caseFile.title || "Case"}</h3>
      <p>
        {/* wie vanilla (dashboard.ts): fallstatus immer im "flagged"-stil */}
        <Badge tone="flagged">{(caseFile.status || "unknown").toUpperCase()}</Badge>
      </p>
      <p>{caseFile.summary || ""}</p>
    </div>
  );
}
