/**
 * RAPPORTAKADEMIN — CITAT-VALIDATOR (BESLUT 2, LAGBESLUT
 * STYRELSE-MUADCVYF-CG1JM2, 2026-09-21).
 *
 * LAGRUM: Lag (1960:729) om upphovsrätt till litterära och konstnärliga
 * verk, 22 § — citaträtten med TRE kumulativa krav: (i) inom ändamålets
 * gränser, (ii) i omfattning som motiveras av ändamålet, (iii) i skälig
 * omfattning med angivande av källa. Verkshöjd (ÄL 1 §): tal och
 * nyckeltal är FRIA — textcitat hålls korta. Källa:
 * laggrundade-beslut-2026-09-21.md BESLUT 2.
 *
 * MEKANIK (maskinell tvingande, inte manualregel): intagspipelinen för
 * rapporttext SKALL köra valideraRapportIntag() och REFUSERA dokumentet
 * vid ett enda fel — sektionen lagras aldrig, felet rapporteras till
 * ansvarig kanal. 200-ordstaket är en SÄKERHETSLINJE under ÄL 22 §:s
 * proportionalitetskrav — ALDRIG en rätt att fylla. Hela PDF:er hostas
 * ALDRIG (beslutet); bildcitat hålls stängda i avaktan på eget beslut.
 */

/** Ett textcitat ur en rapport, med de källuppgifter ÄL 22 § kräver. */
export type CitatSektion = {
  /** sektionsnamn (t.ex. "forvaltningsberattelse") — inte personuppgift */
  sektion: string;
  /** citatet självt — text i klartext, ej HTML */
  text: string;
  /** källangivelse (bolag + dokument, t.ex. "Volvo AB ÅR 2025, s. 12") */
  kalla: string;
  /** länk till originaldokumentet (https) — original hostas aldrig här */
  lank: string;
};

/**
 * HÅRT ORD-TAK PER SEKTION. Beslutet anger 200 ord som maskinell
 * säkerhetslinje; valideraren REFUSERAR vid överträff (>= är fel —
 * taket är taket, ingen gränszon).
 */
export const CITAT_ORDTAK_PER_SEKTION = 200;

/** Ordräknare — whitespace-separerade token, robust mot nyrader/tabb. */
export function raknaOrd(text: string): number {
  const ren = text.trim();
  if (ren === "") return 0;
  return ren.split(/\s+/).length;
}

/**
 * Validera ETT citat mot ÄL 22 §:s tre krav + taket. Returnerar ok=false
 * med konkreta felrader — pipelinen NEKAR (lagrar ej) vid ok=false.
 */
export function valideraCitat(citat: CitatSektion): {
  ok: boolean;
  fel: string[];
  ord: number;
} {
  const fel: string[] = [];
  const text = typeof citat.text === "string" ? citat.text : "";
  const kalla = typeof citat.kalla === "string" ? citat.kalla.trim() : "";
  const lank = typeof citat.lank === "string" ? citat.lank.trim() : "";
  const sektion = typeof citat.sektion === "string" ? citat.sektion.trim() : "";

  const ord = raknaOrd(text);

  if (sektion === "") fel.push("sektion saknas");
  if (text.trim() === "") fel.push("text saknas");
  if (ord > CITAT_ORDTAK_PER_SEKTION) {
    fel.push(`ordtak överträtt: ${ord} > ${CITAT_ORDTAK_PER_SEKTION} (ÄL 22 § skälig omfattning)`);
  }
  if (kalla === "") fel.push("källa saknas (ÄL 22 § kräver källangivelse)");
  if (lank === "") {
    fel.push("länk saknas (god sed enligt beslutet: källa + länk till original)");
  } else if (!/^https?:\/\//.test(lank)) {
    fel.push(`länk är inte http(s): "${lank.slice(0, 60)}"`);
  }

  return { ok: fel.length === 0, fel, ord };
}

/**
 * Validera HELT rapportintag — ALLA sektioner skall passa. Ett enda fel
 * refuserar dokumentet (atomiskt: inget lagras halvt). Tomma intag
 * refuseras likaså (en rapport utan textlager är ett intagsfel).
 */
export function valideraRapportIntag(sektioner: CitatSektion[]): {
  ok: boolean;
  felPerSektion: { sektion: string; fel: string[]; ord: number }[];
} {
  const felPerSektion = sektioner.map((s) => {
    const v = valideraCitat(s);
    return { sektion: s.sektion, fel: v.fel, ord: v.ord };
  });
  const ok = sektioner.length > 0 && felPerSektion.every((s) => s.fel.length === 0);
  return { ok, felPerSektion };
}
