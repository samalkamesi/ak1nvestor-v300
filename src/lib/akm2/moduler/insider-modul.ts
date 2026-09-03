/**
 * AKM2 · LAGER 2 — Insidermodulen V29 (VILLKORAD — AKM2-BESLUT §1).
 *
 * V29 är den enda villkorade variabeln: den kräver MANUEL data från
 * Finansinspektionens insiderregister (R1 spår 13: Yahoo-data är opålitlig
 * för Stockholmsbörsen). Modulen är INAKTIV som standard — raknaV29Insider
 * returnerar osatt tills komplett InsiderData tillförs från den manuella
 * källan. Funktionen läser ev. framtida fält via InsiderData-parametern;
 * BolagsNyckeltal i sig (exkl. aterkop.insiderkopSenaste6man, som enbart
 * nämns som kompletterande observation) bär ingen insiderdata idag.
 *
 * R1 §5 V29-trösklar: 5 p: nettoköp senaste 6 mån + insiderägande 5–25 %
 * (över ~25 % växer entrenchment-risken, Morck–Shleifer–Vishny 1988) ·
 * 4 p: nettoköp · 3 p: neutralt eller founder kvar · 1 p: upprepad
 * nettoförsäljning av VD/CFO · 0 p: massaförsäljning i kombination med
 * M-Score-flagga (V23). R1:s "2 p: ingen data" är avsiktligt ersatt med
 * osatt — BESLUT §1 gör V29 villkorad och osatt-läget ska inte ge poäng.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */

import type { BolagsNyckeltal } from "../../portfolj-forskning/typer";
import type { VariabelSvar } from "./karna-moduler";

/** V29 är inaktiv som standard (BESLUT §1: "inaktiv" tills FI-data accepteras). */
export const INSIDER_MODUL_AKTIV = false;

/**
 * Manuell insiderdata ur Finansinspektionens insiderregister (framtidens
 * fält — alla valfria tills manuell inmatning byggs i flödet).
 */
export type InsiderData = {
  /** Nettoköp senaste 6 mån, kronor (köpkronor − försäljningskronor, VD/styrelse). */
  nettoKopSenaste6Man?: number | null;
  /** Insiderägande i procentenheter av aktierna (5–25 % = alignment-zon). */
  insiderAgandeProcent?: number | null;
  /** Founder kvar i bolaget (ja/nej). */
  founderKvar?: boolean | null;
  /** Upprepad nettoförsäljning av VD/CFO (massaförsäljning). */
  massaForsaljningVDcfo?: boolean | null;
  /** Beneish M-Score-flagga från V23 (M > −1,78). */
  mScoreFlaggad?: boolean | null;
};

const TROSKEL_TEXT =
  "Trösklar (R1 §5 V29): nettoköp + insiderägande 5–25 % → 5 p · nettoköp → 4 p · " +
  "neutralt/founder kvar → 3 p · upprepad nettoförsäljning VD/CFO → 1 p · massaförsäljning " +
  "kombinerad med M-Score-flagga (V23) → 0 p. (R1:s \"2 p: ingen data\" är ersatt med osatt — " +
  "BESLUT §1 gör V29 villkorad.)";

function arTal(x: number | null | undefined): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/**
 * V29 · Insidersignaler & ägarstruktur. Returnerar osatt när InsiderData
 * saknas eller är ofullständig — aldrig gissning.
 */
export function raknaV29Insider(
  k: BolagsNyckeltal,
  insiderData?: InsiderData | null
): VariabelSvar {
  // Kompletterande observation ur befintliga fält (aldrig poängbärande):
  const svagNot =
    arTal(k.aterkop?.insiderkopSenaste6man) && (k.aterkop?.insiderkopSenaste6man ?? 0) > 0
      ? ` Obs: aterkop.insiderkopSenaste6man visar ${k.aterkop?.insiderkopSenaste6man} insiderköp ` +
        "(antal, ej kronor — kan inte mappas mot R1:s nettoköpströsklar utan FI-register)."
      : "";

  if (!insiderData) {
    return {
      poang: 0,
      osatt: true,
      motivering:
        "Osatt (inaktiv som standard): V29 kräver manuell data ur Finansinspektionens " +
        "insiderregister — nettokronor, ägarandel och founder-status finns inte i " +
        "BolagsNyckeltal och Yahoo-data är opålitlig för .ST-listan (R1 spår 13)." +
        svagNot +
        " " +
        TROSKEL_TEXT,
    };
  }

  const netto = insiderData.nettoKopSenaste6Man;
  const agande = insiderData.insiderAgandeProcent;
  const founder = insiderData.founderKvar === true;
  const massa = insiderData.massaForsaljningVDcfo === true;
  const mFlagga = insiderData.mScoreFlaggad === true;

  if (!arTal(netto)) {
    // Nettokronor saknas — founder-status ensam räcker enligt R1 för 3 p-fallet
    // ("neutralt/founder kvar"), men utan netto kan försäljning inte uteslutas.
    if (insiderData.founderKvar === true && massa === false) {
      return {
        poang: 3,
        motivering:
          "Founder kvar i bolaget, nettohandel okänd — R1:s 3-poängsfack " +
          "(\"neutralt/founder kvar\") tolkat konservativt: poäng ges endast eftersom " +
          "massaförsäljning uttryckligen avståtts i den manuella källan." +
          " " + TROSKEL_TEXT,
      };
    }
    return {
      poang: 0,
      osatt: true,
      motivering:
        "Osatt: InsiderData ofullständig — nettoKopSenaste6Man (kronor) krävs för att " +
        "klassa nettoriktningen enligt R1. " + TROSKEL_TEXT,
    };
  }

  // 0 p: massaförsäljning + M-Score-flagga (R1:s kombinationsvillkor).
  if (netto < 0 && massa && mFlagga) {
    return {
      poang: 0,
      motivering:
        `Nettoförsäljning ${netto.toLocaleString("sv-SE")} kr senaste 6 mån, massaförsäljning ` +
        "från VD/CFO OCH M-Score-flagga (V23) — R1:s 0-poängskombination. " + TROSKEL_TEXT,
    };
  }

  if (netto < 0) {
    return {
      poang: massa ? 0 : 1,
      motivering:
        `Nettoförsäljning ${netto.toLocaleString("sv-SE")} kr senaste 6 mån (VD/styrelse) — ` +
        (massa
          ? "massaförsäljning utan M-flagga bedöms som 0 p-tecken i kombination med negativ nettoriktning"
          : "R1: insiderförsäljning är mindre informativ än köp men negativ nettoriktning ger 1 p") +
        ". " + TROSKEL_TEXT,
    };
  }

  if (netto === 0) {
    return {
      poang: 3,
      motivering:
        `Nettoneutralt (${netto.toLocaleString("sv-SE")} kr) senaste 6 mån` +
        (founder ? " med founder kvar" : "") +
        " — R1:s 3-poängsfack (neutralt/founder kvar). " +
        TROSKEL_TEXT,
    };
  }

  // Nettoköp > 0.
  if (arTal(agande)) {
    if (agande >= 5 && agande <= 25) {
      return {
        poang: 5,
        motivering:
          `Nettoköp ${netto.toLocaleString("sv-SE")} kr senaste 6 mån med insiderägande ` +
          `${agande.toString().replace(".", ",")} % — inside alignment-zonen 5–25 % ` +
          "(R1/Morck m.fl. 1988: över ~25 % växer entrenchment-risken). Poäng 5/5. " +
          TROSKEL_TEXT,
      };
    }
    return {
      poang: 4,
      motivering:
        `Nettoköp ${netto.toLocaleString("sv-SE")} kr men insiderägandet ` +
        `${agande.toString().replace(".", ",")} % ligger utanför alignment-zonen 5–25 % ` +
        (agande > 25
          ? "(entrenchment-risk enligt Morck m.fl. 1988 — 5-poängsnivån hålls borta)"
          : "(under 5 % — svagare signal)") +
        ". Poäng 4/5. " + TROSKEL_TEXT,
    };
  }

  return {
    poang: 4,
    motivering:
      `Nettoköp ${netto.toLocaleString("sv-SE")} kr senaste 6 mån; insiderägandet okänt ` +
      "(kan ej verifiera alignment-zonen 5–25 % — därför 4 p, inte 5 p). " + TROSKEL_TEXT,
  };
}
