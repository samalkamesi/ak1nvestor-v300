"use client";

import { useState } from "react";
import type {
  KorstabbellRad,
  PortfoljForslag,
  PortfoljUppfoljning,
  RiskProfil,
} from "@/lib/portfolj-forskning/typer";
import demoJson from "../../../../verktyg/fixtures/korstabell-demo.json";
import { Korstabell } from "./korstabell";
import { PortfoljDjupvy } from "./portfolj-djupvy";
import { RiskvalPanel } from "./riskval-panel";

// ═══════════════════════════════════════════════════════════
// DEMO-WRAPPER — monterar hela portföljforskningen med de
// syntetiska fixturena i verktyg/fixtures/korstabell-demo.json
// (20 bolag över 3 branscher, 1 portföljförslag, uppföljning
// med 3 snapshot-tillfällen). Importeras av fas 2-integratören
// när rutterna ska kopplas; inga rutter pekar hit ännu.
// ═══════════════════════════════════════════════════════════

const demo = demoJson as unknown as {
  rader: KorstabbellRad[];
  forslag: PortfoljForslag;
  uppfoljning: PortfoljUppfoljning;
};

export function PortfoljForskningDemo() {
  const [valdProfil, setValdProfil] = useState<RiskProfil | undefined>(undefined);

  return (
    <div className="space-y-8">
      <RiskvalPanel vald={valdProfil} onVald={setValdProfil} />
      <Korstabell rader={demo.rader} />
      <PortfoljDjupvy forslag={demo.forslag} uppfoljning={demo.uppfoljning} rader={demo.rader} />
    </div>
  );
}
