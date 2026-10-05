// ---------------------------------------------------------------------
// BADGE (ue3 demo 10) - die mehrfach verwendete komponente aus demo 7 F2.
// in der vanilla-app steht dasselbe markup an 6 stellen als string
// ('<span class="badge ' + getStatusBadgeClass(...) + '">'), die farb-logik
// verteilt auf 3 funktionen. hier: EIN baustein, gueltige varianten als typ.
// ---------------------------------------------------------------------
import type { ReactNode } from "react";

export type BadgeTone = "reviewed" | "unreviewed" | "flagged" | "critical" | "relevant";

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone, children }: BadgeProps) {
  return <span className={"badge badge-" + tone}>{children}</span>;
}
