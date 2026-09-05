"use client";

/**
 * KORSTABELL-LEVERANTÖR — VÅG 63 bygg-2 (optimering #1, RSC-delen):
 * /portfolj-forskning skickade korstabellens 100 rader som props till
 * BÅDE <Korstabell> och <ByggPortfoljKort> — två klientkomponenter från
 * en serverkomponent ⇒ flighten serialiserade hela raderkungen Två
 * gånger (~2×160 kB). Med leverantören rider raderkedjan EN gång, i
 * providerns props, och barnen (server-renderade slots) läser den ur
 * kontexten i stället för att var och en bära sin egen kopia.
 *
 * Komponenterna behåller sin valfria `rader`-prop (demo-wrapper och
 * framtida ytor som redan har raderna i klienten slipper providern) —
 * prop vinner över kontext.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { KorstabbellRad } from "@/lib/portfolj-forskning/typer";

const KorstabellKontext = createContext<KorstabbellRad[] | null>(null);

/** Håll raderkedjan EN gång per sida — se filhuvudet. */
export function KorstabellLeverantor({
  rader,
  children,
}: {
  rader: KorstabbellRad[];
  children: ReactNode;
}) {
  return <KorstabellKontext.Provider value={rader}>{children}</KorstabellKontext.Provider>;
}

/** Rader ur närmaste KorstabellLeverantor — null utan provider. */
export function lasKorstabellRader(): KorstabbellRad[] | null {
  return useContext(KorstabellKontext);
}
