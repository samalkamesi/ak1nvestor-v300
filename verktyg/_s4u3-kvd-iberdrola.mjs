#!/usr/bin/env node
/**
 * _s4u3-kvd-iberdrola.mjs — tillverkning + KVD för kvartalsläspaketet
 * sa-laser-du-iberdrola-q3-2026 (seriens första energipaket).
 * Tre lägen:
 *   node verktyg/_s4u3-kvd-iberdrola.mjs tal   → skriv ut kanoniska tal
 *   node verktyg/_s4u3-kvd-iberdrola.mjs bygg  → skriv paket-JSON (tal ur källfilen)
 *   node verktyg/_s4u3-kvd-iberdrola.mjs kvd   → kontrollera levererad fil
 * Källor: data/portfolj-system/bolagsunivers.json (IBE.MC),
 *         data/blogg-utkast/kvartal/2026-q3/kalender-energi.json.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const T = uni.find((b) => b.ticker === "IBE.MC");
if (!T) throw new Error("IBE.MC saknas i universumfilen");

const med = (arr) => {
  const s = arr.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sekt = uni.filter((b) => b.bransch === "energi");
const fält = (b) => ({
  pe: b.vardering?.pe ?? null, pb: b.vardering?.pb ?? null, roe: b.lonksamhet?.roe ?? null,
  ebit: b.lonksamhet?.ebitMarginal ?? null, netto: b.lonksamhet?.nettoMarginal ?? null,
});
const sektMed = {}, uniMed = {}, n = {};
for (const k of Object.keys(fält(T))) {
  sektMed[k] = med(sekt.map((b) => fält(b)[k]));
  uniMed[k] = med(uni.map((b) => fält(b)[k]));
  n[k] = { sekt: sekt.filter((b) => fält(b)[k] !== null).length, uni: uni.filter((b) => fält(b)[k] !== null).length };
}

// ── Kanoniska tal (alla beräknade ur universumfilen) ─────────────────────────
const pe = T.vardering.pe, pb = T.vardering.pb, roe = T.lonksamhet.roe, roic = T.lonksamhet.roic;
const pris = T.pris, mcap = T.marknadsKapitalMdr, ebitM = T.lonksamhet.ebitMarginal;
const nettoM = T.lonksamhet.nettoMarginal, bruttoM = T.lonksamhet.bruttoMarginal;
const skuldEk = T.stabilitet.skuldEgenkapital, fcfMarg = T.lonksamhet.fcfMarginal;
const fcfY = T.vardering.fcfYield, pegKalla = T.vardering.peg, evEbitKalla = T.vardering.evEbit;
const prognos = T.tillvaxt.prognosTillvaxt, ttm = T.tillvaxt.omsattningTillvaxtTTM;
const omsCagrF = T.tillvaxt.omsattningCAGR5ar, resCagrF = T.tillvaxt.resultatCAGR5ar;
const oms = T.serier.omsattning, res = T.serier.resultat;
const cagr = (a, b, p) => (b / a) ** (1 / p) - 1;

const tal = {
  // Identitetstest
  identitet: pb / roe, peKalla: pe,
  identAvvPct: (pe - pb / roe) / pe * 100,
  omvand: pe * roe,
  implicitEPS: pris / pe,
  // Absolutkontroll: P/E × årsresultat mot börsvärde
  peGangerRes: pe * res.at(-1) / 1e9,           // mdr €
  peUnderlag: mcap * 1e3 / pe,                  // M€ (mcap i mdr → M€)
  arsResultatM: res.at(-1) / 1e6,               // M€
  residualPct: (res.at(-1) / 1e6 - mcap * 1e3 / pe) / (res.at(-1) / 1e6) * 100,
  pePaArsresultat: (mcap * 1e3) / (res.at(-1) / 1e6), // mcap(mdr)×1000 ÷ årsresultat(M€)
  // PEG
  pegKalla, prognos,
  pegPaArsPE: (mcap * 1e3 / (res.at(-1) / 1e6)) / (prognos * 100),
  pegPaFaltPE: pe / (prognos * 100),
  implicitTillvaxtFalt: pe / pegKalla,
  implicitTillvaxtArs: (mcap * 1e3 / (res.at(-1) / 1e6)) / pegKalla,
  // EV-kedja (NIKE-mönstret, fem steg; mdr € / M€)
  ekKedja: mcap / pb,
  skuldKedja: (mcap / pb) * skuldEk,
  evKedja: mcap / pb + (mcap / pb) * skuldEk,
  ebitBas: oms.at(-1) * ebitM / 1e6,            // M€, 2025-bas
  evEbitKedja: (mcap / pb + (mcap / pb) * skuldEk) / (oms.at(-1) * ebitM / 1e9),
  evEbitKalla,
  kedjeKvot: evEbitKalla / ((mcap / pb + (mcap / pb) * skuldEk) / (oms.at(-1) * ebitM / 1e9)),
  evImplikit: evEbitKalla * (oms.at(-1) * ebitM / 1e9), // mdr
  residualEv: evEbitKalla * (oms.at(-1) * ebitM / 1e9) - (mcap / pb + (mcap / pb) * skuldEk),
  // FCF-kontroll
  fcfKronor: oms.at(-1) * fcfMarg / 1e6,        // M€
  fcfYieldEgen: (oms.at(-1) * fcfMarg / 1e9) / mcap * 100,
  fcfYKalla: fcfY * 100,
  // Serier och steg
  omsM: oms.map((v) => v / 1e6), resM: res.map((v) => v / 1e6),
  omsSteg: [oms[1] / oms[0] - 1, oms[2] / oms[1] - 1, oms[3] / oms[2] - 1].map((v) => v * 100),
  resSteg: [res[1] / res[0] - 1, res[2] / res[1] - 1, res[3] / res[2] - 1].map((v) => v * 100),
  nettoMargSerie: res.map((r, i) => (r / oms[i]) * 100),
  omsFallTotalt: (oms[2] / oms[0] - 1) * 100,   // 2022→2024 (botten)
  omsCagrEgen: cagr(oms[0], oms.at(-1), 3) * 100,
  resCagrEgen: cagr(res[0], res.at(-1), 3) * 100,
  // Scenarioruta 3×3 på 2025-basen (M€)
  bas: { oms: oms.at(-1) / 1e6, marginal: ebitM * 100 },
  rutor: (() => {
    const r = {};
    for (const [oi, o] of [-0.03, 0, 0.03].entries())
      for (const [mi, m] of [-0.01, 0, 0.01].entries())
        r[`o${oi}m${mi}`] = oms.at(-1) * (1 + o) * (ebitM + m) / 1e6;
    return r;
  })(),
  rader: [-0.03, 0, 0.03].map((o) => oms.at(-1) * (1 + o) / 1e6),
  enPpME: oms.at(-1) * 0.01 / 1e6,
  treProcentME: oms.at(-1) * 0.03 * ebitM / 1e6,
  marginalvikt: 1 / (3 * ebitM),
  // Multiplövning
  multPrognos: pe / (1 + prognos),
  // Medianer och positioner
  sektMed, uniMed, n,
  peOverSekt: (pe / sektMed.pe - 1) * 100,
  pbOverSekt: (pb / sektMed.pb - 1) * 100,
  roeOverSekt: (roe / sektMed.roe - 1) * 100,
  ebitOverSekt: (ebitM / sektMed.ebit - 1) * 100,
  nettoOverSekt: (nettoM / sektMed.netto - 1) * 100,
  T: { pris, mcap, pe, pb, roe: roe * 100, roic: roic * 100, brutto: bruttoM * 100, ebit: ebitM * 100, netto: nettoM * 100, fcfMarg: fcfMarg * 100, fcfY: fcfY * 100, skuldEk, peg: pegKalla, evEbit: evEbitKalla, omsCagr: omsCagrF * 100, resCagr: resCagrF * 100, ttm: ttm * 100, prognos: prognos * 100 },
  sektAntal: sekt.length, uniAntal: uni.length,
};

const sv = (v, d = 1) => v.toFixed(d).replace(".", ",");
const mkr = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

if (process.argv[2] === "tal") {
  console.log(JSON.stringify(tal, null, 1));
  process.exit(0);
}

// ── BYGG-LÄGE: tillverka paketet med tal ur källfilen ────────────────────────
const sgn = (v, d = 1) => (v > 0 ? "+" : "") + v.toFixed(d).replace(".", ",");
const F = {
  pe: sv(tal.T.pe, 1), pb: sv(tal.T.pb, 2), pb2: "2,54", roe: sv(tal.T.roe, 1), roic: sv(tal.T.roic, 1),
  brutto: sv(tal.T.brutto, 1), ebit: sv(tal.T.ebit, 2), netto: sv(tal.T.netto, 1),
  fcfMarg: sv(tal.T.fcfMarg, 1), fcfY: sv(tal.T.fcfY, 2), skuldEk: sv(tal.T.skuldEk, 4),
  peg: sv(tal.T.peg, 2), evEbit: sv(tal.T.evEbit, 1), pris: sv(tal.T.pris, 3).replace(".", ","),
  mcap: sv(tal.T.mcap, 1), omsCagr: sv(tal.T.omsCagr, 2), resCagr: sv(tal.T.resCagr, 2),
  ttm: sv(tal.T.ttm, 1), prognos: sv(tal.T.prognos, 2),
  identitet: sv(tal.identitet, 2), identAvv: sv(Math.abs(tal.identAvvPct), 1), omvand: sv(tal.omvand, 2),
  roeFrac: sv(roe, 4), enPlus: sv(1 + prognos, 4),
  implicitEPS: sv(tal.implicitEPS, 2), peGangerRes: sv(tal.peGangerRes, 1),
  peUnderlag: mkr(tal.peUnderlag), arsResultat: mkr(tal.arsResultatM), residualPct: sv(tal.residualPct, 1),
  peArs: sv(tal.pePaArsresultat, 2), pegArs: sv(tal.pegPaArsPE, 2), pegFalt: sv(tal.pegPaFaltPE, 2),
  implTillxFalt: sv(tal.implicitTillvaxtFalt, 2), implTillxArs: sv(tal.implicitTillvaxtArs, 1),
  ekKedja: sv(tal.ekKedja, 1), skuldKedja: sv(tal.skuldKedja, 1), evKedja: sv(tal.evKedja, 1),
  ebitBas: mkr(tal.ebitBas), evEbitKedja: sv(tal.evEbitKedja, 2), kedjeKvot: sv(tal.kedjeKvot, 2),
  evImplicit: sv(tal.evImplikit, 0), residualEv: sv(tal.residualEv, 0),
  fcfME: mkr(tal.fcfKronor), fcfYEgen: sv(tal.fcfYieldEgen, 2),
  oms0: mkr(tal.omsM[0]), oms1: mkr(tal.omsM[1]), oms2: mkr(tal.omsM[2]), oms3: mkr(tal.omsM[3]),
  res0: mkr(tal.resM[0]), res1: mkr(tal.resM[1]), res2: mkr(tal.resM[2]), res3: mkr(tal.resM[3]),
  omsSteg1: sv(tal.omsSteg[0], 1), omsSteg2: sv(tal.omsSteg[1], 1), omsSteg3: sgn(tal.omsSteg[2], 1),
  resSteg1: sv(tal.resSteg[0], 1), resSteg2: sv(tal.resSteg[1], 1), resSteg3: sv(tal.resSteg[2], 1),
  nm0: sv(tal.nettoMargSerie[0], 1), nm1: sv(tal.nettoMargSerie[1], 1), nm2: sv(tal.nettoMargSerie[2], 1), nm3: sv(tal.nettoMargSerie[3], 1),
  omsFall: sv(Math.abs(tal.omsFallTotalt), 1),
  basOms: mkr(tal.bas.oms), basMarg: sv(tal.bas.marginal, 2),
  margLag: sv(tal.bas.marginal - 1, 2), margHog: sv(tal.bas.marginal + 1, 2),
  radLag: mkr(tal.rader[0]), radHog: mkr(tal.rader[2]),
  c00: mkr(tal.rutor.o0m0), c01: mkr(tal.rutor.o0m1), c02: mkr(tal.rutor.o0m2),
  c10: mkr(tal.rutor.o1m0), c11: mkr(tal.rutor.o1m1), c12: mkr(tal.rutor.o1m2),
  c20: mkr(tal.rutor.o2m0), c21: mkr(tal.rutor.o2m1), c22: mkr(tal.rutor.o2m2),
  enPp: mkr(tal.enPpME), treProc: mkr(tal.treProcentME), margVikt: sv(tal.marginalvikt, 2),
  mult: sv(tal.multPrognos, 2),
  mPe: sv(tal.sektMed.pe, 1), mPb: sv(tal.sektMed.pb, 2), mRoe: sv(tal.sektMed.roe * 100, 1),
  mEbit: sv(tal.sektMed.ebit * 100, 1), mNetto: sv(tal.sektMed.netto * 100, 1),
  uPe: sv(tal.uniMed.pe, 1), uPb: sv(tal.uniMed.pb, 2), uRoe: sv(tal.uniMed.roe * 100, 1),
  uEbit: sv(tal.uniMed.ebit * 100, 1), uNetto: sv(tal.uniMed.netto * 100, 1),
  peOver: sv(tal.peOverSekt, 0), pbOver: sv(tal.pbOverSekt, 0), roeOver: sv(tal.roeOverSekt, 0),
  ebitOver: sv(tal.ebitOverSekt, 0), nettoOver: sv(tal.nettoOverSekt, 0),
  skuldMedSekt: sv(med(sekt.map((b) => b.stabilitet?.skuldEgenkapital ?? null)), 2),
};

const body = `Iberdrola, S.A. — ticker IBE på Bolsa de Madrid — publicerar sina resultaten för januari–september 2026 onsdagen den **21 oktober kl 09:30 spansk tid**, med presentation 09:30–11:00 i Madrid. Datumet står i bolagets egen finansiella kalender, hämtad live 2026-09-16: "El 21 de octubre de 2026 presentaremos los resultados de Iberdrola de los primeros nueve meses de 2026". Det här är utbildningspaket i AK1A:s kvartalsrapportserie — och seriens **första energipaket**. Efter bankernas balansräkningsläsart, industrierns marginalläsart, fastighetens NAV, NIKE:s brutna räkenskapsår, telekomens hävstång och försvarsindustrins orderbok är elkoncernen seriens åttonde läsart: ett bolag vars intäkter till stor del är kontrakterade och reglerade år i förväg — och vars läsart därför handlar om hur mycket kapital som binder avkastningen, inte om hur bred en enskild marginal är. Energi var en av seriens två återstående branscher utan enda levererat läspaket (material är den andra efter detta). Det hela är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför Iberdrola är nästa paket i serien

Fabriksomgångens tre paket delade upp sig med klaim-protokollet som raceskydd: syskon s4-u2 hävdade och levererade vågvalideringsuniversumets sista lucka Saab (23 oktober — tolvbolagsuniversumet därmed helt täckt), syskon s4-u1 bokade Castellum (22 oktober, fastighetstrilogins tredje halva), och detta paket öppnar energi. Bland kalenderns energibolag var tidigaste officiellt bekräftade rappdag 21 oktober, med två kandidater: Vår Energi kl 07:00 och Iberdrola kl 09:30. Sorteringen förtjänar att redovisas öppet, för den visar seriens regler. Vår Energi sorterades bort med datamotivering (Prologis-precedensen: officiellt datum räcker inte — datan måste bära): bolagets P/B-fält 57,9 mot P/E-fältet 10,2 ger en identitetskvot på sex (57,9 ÷ 0,94 = 61,6 mot 10,2 — en sexfaldig spänning), en effekt av en ekvitetsbas kring två procent av börsvärdet där varje ekvitetsbaserat fält blir ostabilt; bolaget rapporterar dessutom i euro på en norsk kronor-notering utan växelkurs i filen, och PEG- och räntetäckningsfälten är null med prognostillväxten minus 34 procent. Vår Energi är energispårets nästa kandidat — men på en friskare insamlingsvinda. Iberdrola kvarstår: officiellt bekräftat datum i bolagets egen kalender, fyra sammanhängande räkenskapsår 2022–2025 och fulla nyckeltalsfält — och ett identitetstest som stänger på ${F.identAvv} procent, seriens renaste utanför bankerna. En ärlighetsnot med Tele2-paketets presedens: IBE står utanför vågvalideringens tolvbolagsuniversum och saknar analysfil i biblioteket — ingen dom och ingen 25-cellersmatris redovisas; luckan är information, inget värde är gissat.

## Nyckeltalen att ha med sig — elbranschens egen uppsättning

Värdena nedan är senaste mätta tal ur bolagsuniversumets datainsamling (Iberdrolas post hämtad 2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom energibranschen. Elkoncernen mäter annorlunda än både banker och industrier — och just skillnaderna är paketets innehåll.

**Värdering — grenens högsta vinstmultipel, och vad den köper**

- Pris per vinst (P/E): **${F.pe}** — [P/E inom energi](/dataset/energi/pe). Energigrenens högsta av tolv bolag med ifyllt fält (median ${F.mPe}); ${F.peOver} procent över medianen och över universumets ${F.uPe} (n=${n.pe.uni}).
- Pris per bokfört eget kapital (P/B): **${F.pb}** — [P/B inom energi](/dataset/energi/pb). Strax över branschmedianen ${F.mPb} (${F.pbOver} procent) och under universumets ${F.uPb} (n=${n.pb.uni}).
- Läs de två tillsammans, aldrig var för sig: identiteten **P/E = P/B ÷ ROE** binder dem, och med ROE ${F.roe} procent blir P/E-premien utan motsvarande P/B-premie ett uttalande om stabilitet, inte om dagens avkastning. Elnätsinkomster är planerade och reglerade i förväg; råvaruintäkter är det inte. Marknaden betalar för förutsägbarheten — det är hypotesen om multipeln, prövad i rapporten.
- Enterprise value per rörelseresultat (EV/EBIT): **${F.evEbit}** — [EV/EBIT inom energi](/dataset/energi/ev-ebit). Fältet redovisas här som räknestorhet, inte mått — kedjekontrollen i källkritikavsnittet visar att fältet spänner mot övriga fält.
- Fri kassaflödesavkastning (FCF-yield): **${F.fcfY} procent** — [så räknas FCF-avkastningen](/dataset/energi/fcf-avkastning). En intern konsistenspärla: FCF-marginalen ${F.fcfMarg} procent gånger intäkterna ${F.oms3} miljoner euro ger ${F.fcfME} miljoner euro fria kassaflöden — delat med börsvärdet ${F.mcap} miljarder euro blir det ${F.fcfYEgen} procent, alltså fältets egen siffra inom två hundradelar. Kedjan spänner i EV-ledet men håller i kassaflödesledet (se källkritiken).
- PEG-talet: **${F.peg}** — [PEG inom energi](/dataset/energi/peg) — med prognostillväxten ${F.prognos} procent; fältets bas prövas i källkritikavsnittet, där det för första gången i serien nästan replikeras.
- Vid insamlingen var kursen **${F.pris} euro** och börsvärdet **cirka ${F.mcap} miljarder euro**. [Värderingsöversikten](/dataset/energi/vardering) sätter multiplarna i sitt sammanhang.

**Lönsamhet — marginalernas bolag, kapitalets broms**

- Räntabilitet på eget kapital (ROE): **${F.roe} procent** — [så räknas ROE](/dataset/energi/roe). UNDER energi-medianen ${F.mRoe} (${F.roeOver} procent) och under universumets ${F.uRoe} (n=${n.roe.uni}).
- Räntabilitet på investerat kapital (ROIC): **${F.roic} procent** — [så räknas ROIC](/dataset/energi/roic), med källans not att värdet är en approximerad proxy (rörelseresultat före skatt delat på skuld plus bokfört eget kapital). Gapet mot ROE är bara ${sv(tal.T.roe - tal.T.roic, 1)} procentenheter — och det är falskt smalt, för proxyn räknar före skatt medan ROE räknar efter: läs noterna innan gapet tolkas.
- Bruttomarginal: **${F.brutto} procent** — [bruttomarginal inom energi](/dataset/energi/brutto-marginal) — med källans not att ingen årlig bruttovinsthistorik finns; fältet är en punktmätning, inte en serie.
- Rörelsemarginal (EBIT): **${F.ebit} procent** — ${F.ebitOver} procent ÖVER branschmedianen ${F.mEbit}.
- Nettomarginal: **${F.netto} procent** — [så läses nettomarginalen](/dataset/energi/netto-marginal) — näst högst i energigrenen efter RWE, ${F.nettoOver} procent över medianen ${F.mNetto}. Notera att nettomarginalen ligger under rörelsemarginalen — det normala fallet (skatt och finansnetto), och Tele2-paketets spegelbild där nettot låg över.
- DuPont-läran i en mening: ROE är marginal gånger kapitalomsättning gånger hävstång — och Iberdrola är paketets levande exempel på att breda marginaler inte räcker: med EBIT-marginal 36 procent över medianen och nettomarginal 75 procent över ligger ROE ändå under. Förklaringen står inte i resultaträkningen utan i balansräkningen: nät och kraftverk binder kapital i årtionden. Kapitalomsättningen — intäkter per euro balansräkning — är elboläsarens mittental, och den finns inte som fält i universumsinsamlingen: den beräknas i rapporten.
- Fri kassaflödesmarginal: **${F.fcfMarg} procent** — nettomarginalen ${F.netto} mot FCF-marginalen ${F.fcfMarg} visar gapet mellan vinst och kassa som kapitalintensitetens fingerprint: underhåll och nyinvesteringar äter skillnaden. Datat konstaterar gapet; rapportens investeringsavsnitt specificerar.

**Tillväxt — två CAGR med olika tecken på samma bolag**

- Intäkter över senaste fyra räkenskapsåren: **minus ${sv(Math.abs(tal.T.omsCagr), 2)} procent per år** (${F.oms0} → ${F.oms1} → ${F.oms2} → ${F.oms3} miljoner euro, med årliga steg ${F.omsSteg1}/${F.omsSteg2}/${F.omsSteg3} procent) — [så räknas CAGR](/dataset/energi/omsattning-cagr-5ar). Ärlighetsnot: källan ger fyra år, inte fem. Intäktsfallet till botten 2024 var ${F.omsFall} procent — 2022 var europeiska energiprisers toppår, och serien efter det är en normalisering.
- Resultat samma period: **plus ${F.resCagr} procent per år** — och serien är MONOTONT STIGANDE: ${F.res0} → ${F.res1} → ${F.res2} → ${F.res3} miljoner euro, med årliga steg +${F.resSteg1}/+${F.resSteg2}/+${F.resSteg3} procent. [Resultat-CAGR förklarad](/dataset/energi/resultat-cagr-5ar). Här finns ingen vilseledande ändpunkt: fyra rakt upp.
- Samma bolag, samma fyra år, två CAGR med olika tecken — minus ${sv(Math.abs(tal.T.omsCagr), 1)} på intäkter, plus ${sv(tal.T.resCagr, 1)} på resultat. CAGR-kritikens regelverk har hittills visat fallet där en enda ändpunkt döljer en krasch (Tele2, Wallenstam, NP3); Iberdrola är spegelfallet där de två talen visar att vallen mellan intäkt och resultat är själva historien: priserna normaliserades, marginalen byggdes.
- Härledd nettomarginalserie (resultat delat med intäkter, egen beräkning med redovisad metod): **${F.nm0} → ${F.nm1} → ${F.nm2} → ${F.nm3} procent**. Monotont stigande, vartenda år.
- Intäktstillväxt senaste tolvmånadersperioden: **plus ${F.ttm} procent** — [så läses TTM-tillväxten](/dataset/energi/omsattningstillvaxt-ttm) — vändningen från 2024 års botten (${F.omsSteg3} procent 2025) fortsatte.
- Prognostillväxt: **plus ${F.prognos} procent** — [om prognostillväxt](/dataset/energi/prognos-tillvaxt) — samlad marknadsuppskattning är ett pedagogiskt begrepp, inte en sanning och inte vår prognos.

**Stabilitet — skuldkvoten på exakt ett, och räntan som saknas**

- Skulder per eget kapital: **${F.skuldEk}** — [om skuldsättning](/dataset/energi/skuldsattning). Varje euro eget kapital matchad av en euro skuld — mot branschmedianen ${F.skuldMedSekt}. Kontexten bär läsningen: energigrenens spann är universumets bredaste på detta mått (Vår Energi 3,1, Enel 1,5, Chevron och Exxon under 0,2), och elnätsfinansieringens logik — långsiktiga kontrakterade intäkter bär långsiktiga lån — är branschens signatur, inte bolagets avvikelse.
- Räntetäckning: **osatt** — källan saknar räntekostnad för senaste räkenskapsåret. Med skulder kring ${F.skuldKedja} miljarder euro (EV-kedjans steg två) är räntenettot en rapportpost av dignitet; hålet sägs som det är.
- Utdelning: universumets återköps- och utdelningsfält är null för bolaget — utdelningsbeskedet är något rapporten för med sig, och bolagets kalender nämner ett flexibelt utdelningsprogram (aktieutdelning eller kontant option) som kalenderfakta. Läs beskedet i rapporten när den kommer.

## Källkritik: identiteten stänger — och första gången en PEG-bas nästan replikeras

Kör identitetstestet **P/E = P/B ÷ ROE** på Iberdrolas källvärden: ta P/B ${F.pb}, dividera med ROE ${F.roeFrac} — resultatet blir **${F.identitet}**. Källans eget P/E-tal är ${F.pe}. Skillnaden är **${F.identAvv} procent** — seriens renaste utfall utanför bankerna (bankerna 0,3–0,9 procent, Alfa-zonen 4,7–5,7, Tele2 7,1). Omvänt: ${F.pe} multiplicerat med ${F.roeFrac} ger **${F.omvand}** mot källans P/B ${F.pb} — samma avstånd. Implicit vinst per aktie: ${F.pris} delat med ${F.pe} är **${F.implicitEPS} euro**. I ett monotont resultatbolag utan svängar är detta testets gynnsammaste läge: ROE och P/E mäter vinst i angränsande ögonblick av en jämn serie.

Sedan absolutkontrollen — och här gapar det: P/E-fältet ${F.pe} multiplicerat med årsresultatet ${F.arsResultat} miljoner euro ger ${F.peGangerRes} miljarder euro mot börsvärdesfältets ${F.mcap} — en residual på ${F.residualPct} procent. Omvänt räknat: börsvärdet delat med P/E-fältet ger ett underlag på ${F.peUnderlag} miljoner euro mot årets ${F.arsResultat}. Hypotes, redovisad som hypotes: minoritetsintressen i koncernbolag eller ett TTM-fönster snett mot räkenskapsåret — filen skiljer inte på dem. Poängen är större än fältet: multipelfälten stämmer inbördes (identiteten stänger på ${F.identAvv} procent) men inte mot absoluten — fältens värld är en familj av förhållanden, inte en punkt av sanningar. P/E på årsresultatet direkt är ${F.peArs}.

Sedan PEG-fältet — och i den långa raden av konventionsobservationer blir detta det första nästan-replicerade fältet. Källans PEG ${F.peg} med prognostillväxten ${F.prognos} procent: med P/E på årsresultatet (${F.peArs} ÷ ${F.prognos}) blir PEG **${F.pegArs}** — två procent ifrån fältets eget tal. Med multipelfältets P/E i stället (${F.pe} ÷ ${F.prognos}) blir det ${F.pegFalt}, sjutton procent bort. Volvo Group-paketet fann att den nya insamlingsvindan dokumenterar sin konvention i noten; Iberdrolas fönster (2026-09-03) hör till de äldre utan not — men här går fältet ändå att spåra nästan hela vägen. Lärdomen, fjärde formuleringen: ett fälts pålitlighet följer källan och fönstret, inte fältnamnet.

Sedan EV-kedjan — NIKE-paketets femstegskontroll, här med Tele2-paketets öppna utfall. Steg ett: börsvärdet ${F.mcap} delat med P/B ${F.pb} ger bokfört eget kapital på **${F.ekKedja} miljarder euro**. Steg två: skuldkvoten ${F.skuldEk} ger skulder på **${F.skuldKedja} miljarder**. Steg tre: EV = ${F.ekKedja} + ${F.skuldKedja} = **${F.evKedja} miljarder euro**. Steg fyra: rörelseresultatet i 2025-års bas = ${F.oms3} × ${tal.T.ebit.toFixed(2).replace(".", ",")} procent = **${F.ebitBas} miljoner euro**. Steg fem: EV/EBIT enligt kedjan = ${F.evKedja} ÷ ${sv(tal.ebitBas / 1000, 3)} = **${F.evEbitKedja}** — mot källans fält ${F.evEbit}, en kvot på ${F.kedjeKvot}. Kedjan kan inte stängas: fältets ${F.evEbit} implicerar ett EV på ${F.evImplicit} miljarder — en residual på ${F.residualEv} miljarder "annat kapital" som inte kan förklaras ur filen (hypoteser: annan EBIT-definition, EBITDA-förväxling, minoriteter och hybridskulder — alla utan grund i filen). Hierarkin för rapportläsaren oförändrad: fält vars beräkningsväg inte kan härledas redovisas som räknestorheter. FCF-kontrollen däremot håller, som redan visats: ${F.fcfMarg} procent × ${F.oms3} = ${F.fcfME} miljoner euro, delat med ${F.mcap} miljarder = ${F.fcfYEgen} procent mot fältets ${F.fcfY}. Kedjan spänner i EV-ledet men håller i kassaflödesledet — fält för fält, aldrig fältblock.

## Så står sig bolaget mot branschen

| Nyckeltal | Iberdrola | Median energi (${tal.sektAntal} bolag) | Median hela universumet |
|---|---|---|---|
| P/E | ${F.pe} | ${F.mPe} (n=${n.pe.sekt}) | ${F.uPe} (n=${n.pe.uni}) |
| P/B | ${F.pb} | ${F.mPb} | ${F.uPb} (n=${n.pb.uni}) |
| Räntabilitet på eget kapital (ROE) | ${F.roe} % | ${F.mRoe} % | ${F.uRoe} % (n=${n.roe.uni}) |
| Rörelsemarginal (EBIT) | ${F.ebit} % | ${F.mEbit} % | ${F.uEbit} % (n=${n.ebit.uni}) |
| Nettomarginal | ${F.netto} % | ${F.mNetto} % | ${F.uNetto} % (n=${n.netto.uni}) |

(Alla värden hämtade 2026-09-03 för Iberdrolas del; medianerna beräknade 2026-09-16 ur ${tal.uniAntal}-bolagsfilen — ${tal.sektAntal} bolag i energi, där P/E-medianen bygger på n=${n.pe.sekt} eftersom ett bolag saknar fältet; universumets n redovisat per mått. Vonovia-noten gäller: servade dataset-sidor visar äldre medianer tills nästa prod-bygge.)

Läsningen: Iberdrola är grenens dyraste vinst — P/E ${F.peOver} procent över medianen — utan att vara dess mest avkastande: ROE ligger ${sv(Math.abs(tal.roeOverSekt), 0)} procent under. Marginalerna bär premien (EBIT ${F.ebitOver} över, netto ${F.nettoOver} över) och bakom dem hypotesen om stabiliteten: reglerade och kontrakterade intäkter köps för förutsägbarhet, medan råvarubolagens vinster prissätts med cykelrisk. Profilens form är poängen — nivån är marknadens sak, inte paketets. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/energi/universumjamforelse), och bolagets sida i biblioteket finns [här](/bolag/ibe-mc).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för en elkoncern. Ingen är en bedömning av vad som kommer att hända den 21 oktober — de är träning i metod och ren aritmetik.

**Övning A — läs DuPont baklänges: vad bromsar ROE?** Triangeln: EBIT-marginal ${F.ebit} procent (${F.ebitOver} procent över medianen), nettomarginal ${F.netto} (näst högst i grenen), ROE ${F.roe} (${F.roeOver} procent UNDER medianen). DuPont-ekvationens svar: kapitalomsättningen. Träningsfrågorna till rapporten: hur mycket nytt kapital binds i nät och kraftverk under perioden (investeringsavsnittet), och hur utvecklas det bokförda egna kapitalet (${F.ekKedja} miljarder euro enligt kedjan)? Följdfrågan från källkritiken: hur stor del av koncernresultatet tillhör minoritetsägare — residualen på ${F.residualPct} procent mellan P/E-fältets underlag och årsresultatet pekar dit. Kontrasterna bär pedagogiken: Tele2:s hävstångsburna 47,6 procent, Volvo Groups marginalburna 20,9 — och Iberdrolas marginalbjudande 10,0 under kapitalets broms. Tre branscher, tre DuPont-vägar.

**Övning B — läs två CAGR med olika tecken: normalisering eller erosion?** Grundberättelsen: intäkterna föll ${sv(Math.abs(tal.T.omsCagr), 1)} procent per år (${F.omsFall} procent till botten 2024) medan resultatet steg ${sv(tal.T.resCagr, 1)} procent per år i fyra monotona steg — och den härledda nettomarginalserien ${F.nm0} → ${F.nm1} → ${F.nm2} → ${F.nm3} procent är historien i en rad. Träningsfrågorna: är intäktsfallet en normalisering från 2022 års pristopp (då blir 2024 års nivå den nya basen) eller en erosion (då är marginalbygget en engångsbekantskap)? Och vad bär marginalstegen — volym, mix, effektivitet, eller engångsposter? Nio-månadsrapportens intäktstal ger första indikationen: TTM-tillväxten ${F.ttm} procent och 2025 års ${F.omsSteg3} procent tyder på att fallet var över; rapporten avgör om vändningen håller. Detta är Tele2-paketets spegelbild: där kröp intäkterna medan resultatet kraschade och vände; här föll intäkterna medan resultatet aldrig vände ner.

**Övning C — scenariorutan i ren aritmetik, och nätingarnas gemensamma ekonomi.** Universumet saknar kvartalsserier, så rutan räknas på helåret 2025 som bas: intäkter ${F.oms3} miljoner euro och rörelsemarginal ${tal.T.ebit.toFixed(2).replace(".", ",")} procent ger ett rörelseresultat på ungefär ${F.ebitBas} miljoner euro. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner euro:

| Rörelseresultat, miljoner euro | Marginal ${F.margLag} % | Marginal ${tal.T.ebit.toFixed(2).replace(".", ",")} % | Marginal ${F.margHog} % |
|---|---|---|---|
| Intäkter ${F.radLag} | ${F.c00} | ${F.c01} | ${F.c02} |
| Intäkter ${F.oms3} | ${F.c10} | ${F.c11} | ${F.c12} |
| Intäkter ${F.radHog} | ${F.c20} | ${F.c21} | ${F.c22} |

Två räknesatser att öva på: en procentenhet marginal flyttar resultatet med cirka ${F.enPp} miljoner euro vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka ${F.treProc} miljoner — **marginalratten väger cirka ${F.margVikt} gånger tyngre** än intäktsratten. Essity-paketets formel (marginalens relativa vikt är ett delat med tre gånger marginalnivån) placerar Iberdrola i Tele2-fickan: Volvo Group 3,2 > NIKE/Essity 2,6 > Alfa Laval 2,1 ≈ ABB 2,0 > Sandvik/Atlas Copco 1,6–1,7 > Tele2 1,37 > **Iberdrola ${F.margVikt}** > banker/Wallenstam 0,5–0,6. Elbolaget och telecombolaget landar bredvid varandra — och det är ingen slump: båda är kapitaltäta nätingar med abonnerade eller reglerade intäkter, där marginalen väger mindre än i varubolagen men kapitalet väger mer. Nätingarnas gemensamma ekonomi är rutans biformulering. Alla nio celler ovan är aritmetik på 2025 års bas, inga prognoser. En sista räkneövning: P/E ${F.pe} delat med ${F.enPlus} (ett plus prognostillväxten ${F.prognos} procent, använd som räknestorhet, inte som prognos) blir **${F.mult}** — om vinsten växer i den takten och kursen står stilla sjunker P/E mot grenens median; multiplens dubbla natur (kursen eller vinsten) är övningens innehåll, inte en handssignal.

## Praktiskt inför 21 oktober

- Rappdagen onsdagen 21 oktober kl 09:30–11:00 spansk tid står i [Iberdrolas finansiella kalender](https://www.iberdrola.com/accionistas-inversores/accionistas/calendario-accionistas-inversores). Spansk ryttem: Q3 redovisas som NIO MÅNADER ("nueve meses") — jämför mot januari–september 2025, inte mot ett enskilt kvartal (samma läsart som Fortum, Enel, RWE och de nordiska delårsrapporterna; kontrast mot de amerikanska kvartalspaketen). Q1 2026 presenterades 29 april, Q2 22 juli och helåret 2025 den 25 februari — kvartalsschemat i bolagets kalender.
- Ingen tyst period: spansk värdepappersreglering kräver ingen förpublikationsrestriktion vid kvartalsrapporter — bolagets kalender säger det uttryckligen. Kontrasten är kalenderpedagogik: SCA stänger 30 kalenderdagar före rapporten och Yara från 25 september; den spanska rapporten kan föregås av offentliga uttalanden ända in på rappdagen.
- EUR mot EUR: bolaget rapporterar och handlas i euro — ingen valutatermin gömmer sig i multiplarna (kontrast mot Nordea-, ABB- och NIKE-paketen).
- Håll koll på: Capital Markets Day hölls 24 september 2026 med uppdaterad strategiplan (kalenderfakta) — nio-månadersrapporten är de första resultaten efter CMD, och läses med planens mål i bakhuvudet. Vår Energi publicerar samma morgon kl 07:00 (energigrenens första dag med två bolag — och en trading update redan 12 oktober enligt kalendern), och med Iberdrola är seriens tätaste rappfönster fullt: 13 läspaket över fyra dagar (20–23 oktober) — ABB och Tele2 den 20:e, SKF, Handelsbanken och Iberdrola den 21:a, Sandvik, Atlas Copco, Essity, Swedbank och Castellum den 22:a, Volvo Car, Volvo Group och Saab den 23:e.
- Ordlista för alla begrepp finns i [kurserna](/kurser). Metodtransparensen finns på [transparenssidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling — Iberdrolas post står på 2026-09-03-vindan, och PEG- och EV/EBIT-fältens öde i omtagningen är en öppen fråga, inte en prognos. Material är efter detta seriens sista gren utan läspaket (Yara, Billerud och Holmen tidigast, 22 oktober). Oavsett utfall blir det en ny rad i det öppna kvittot.

## Källor

- Rappdag 2026-10-21 kl 09:30–11:00 spansk tid, presentation "resultados Nueve meses 2026", kvartalsschema 2026 (Q1 29/4, Q2 22/7, helår 2025 den 25/2 2026), CMD 24/9 2026, utländsk not om ingen tyst period — officiell: Iberdrolas finansiella kalender (accionistas-inversores), hämtad live 2026-09-16 (IR-landningssidan svarar 403 mot automatiska hämtare — bot-skydd, hämtningen gick via kalendersidans egna svar) — internt: data/blogg-utkast/kvartal/2026-q3/kalender-energi.json.
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets datainsamling för IBE.MC 2026-09-03 (Yahoo Finance, quoteSummary-moduler; andra källan MarketStack saknade färsk kurs — ingen dubbelkoll av pris; ROIC = approximerad proxy enligt källans not; räntetäckning osatt, räntekostnad saknas; ingen årlig bruttovinsthistorik hos källan) — internt: data/portfolj-system/bolagsunivers.json. Bransch- och universumsmedianer beräknade 2026-09-16 ur samma fil (${tal.uniAntal} bolag, varav ${tal.sektAntal} i energi; P/E-medianen n=${n.pe.sekt}, universumets n redovisat per mått: P/E ${n.pe.uni}, P/B ${n.pb.uni}, ROE ${n.roe.uni}, EBIT ${n.ebit.uni}, netto ${n.netto.uni}).
- Identitetstest: egen beräkning enligt P/E = P/B ÷ ROE (${F.pb} ÷ ${F.roeFrac} = ${F.identitet} mot källans P/E ${F.pe}; differens ${F.identAvv} procent; omvänt ${F.pe} × ${F.roeFrac} = ${F.omvand} mot ${F.pb}; implicit vinst per aktie ${F.pris} ÷ ${F.pe} = ${F.implicitEPS} euro) — redovisad steg för steg. Absolutkontroll: ${F.pe} × ${F.arsResultat} M€ = ${F.peGangerRes} mdr € mot mcap-fältet ${F.mcap} mdr; residual ${F.residualPct} procent; hypotes minoriter/TTM redovisas som hypotes.
- PEG-analys: källans ${F.peg} med prognostillväxt ${F.prognos} procent; replikering på årsresultats-PE ${F.peArs} ÷ ${F.prognos} = ${F.pegArs} (två procent ifrån); på multipelfältets PE ${F.pegFalt}; implicit tillväxt ur fältet ${F.pe} ÷ ${F.peg} = ${F.implTillxFalt} procent.
- EV-kedja: egen beräkning i fem steg (EK ${F.mcap} ÷ ${F.pb} = ${F.ekKedja} mdr €; skuld × ${F.skuldEk} = ${F.skuldKedja} mdr; EV ${F.evKedja} mdr; EBIT ${F.oms3} × ${tal.T.ebit.toFixed(2).replace(".", ",")} % = ${F.ebitBas} M€; EV/EBIT-kedja ${F.evEbitKedja} mot källans fält ${F.evEbit}, kvot ${F.kedjeKvot}, residual ${F.residualEv} mdr € — kedjan går ej att stänga; Tele2-paketets metod och utfall). FCF-kontroll: ${F.fcfMarg} % × ${F.oms3} = ${F.fcfME} M€ ÷ ${F.mcap} mdr = ${F.fcfYEgen} % mot fältets ${F.fcfY}.
- Scenarioruta, räknesatser och marginalvikt: aritmetik på 2025 års bas ur universumsserierna (${F.oms3} M€; ${tal.T.ebit.toFixed(2).replace(".", ",")} %; intäktsserie ${F.oms0} → ${F.oms3} M€; resultatserie ${F.res0} → ${F.res3} M€; härledd nettomarginalserie ${F.nm0}/${F.nm1}/${F.nm2}/${F.nm3} %); samtliga nio celler och båda räknesatserna maskinellt dubbeltkontrollerade vid tillverkningen 2026-09-16.
- Vågvalideringsnot: IBE står utanför vågvalideringens tolvbolagsuniversum och saknar analysfil i data/analyses/ — paketet bygger på kalender och universumsdata, ingen dom och ingen 25-cellersmatris redovisas (Tele2-paketets presedens; luckan är information, inget värde är gissat).

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const ord = body.split(/\s+/).filter((w) => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const paket = {
  slug: "sa-laser-du-iberdrola-q3-2026",
  title: `Iberdrolas nio-månadersrapport 2026: så läser du den — seriens första energipaket: P/E ${F.pe} är grenens högsta medan ROE ${F.roe} ligger under medianen, resultatserien har stigit fyra år i rad medan intäkterna föll, och skuldkvoten står på exakt 1,00`,
  description: `Iberdrola presenterar resultaten för januari–september onsdagen den 21 oktober kl 09:30 spansk tid. Här är seriens första energiläspaket: vinstens kvalitet mot kapitalets vikt — P/E ${F.pe} som energigrenens högsta mot ROE ${F.roe} procent under medianen, med marginalerna över medianen (rörelsemarginal ${F.ebit} mot ${F.mEbit}), resultatserien ${F.res0} → ${F.res3} miljoner euro som stigit vartenda år medan intäkterna fallit ${sv(Math.abs(tal.T.omsCagr), 1)} procent per år — två CAGR med olika tecken på samma bolag — identitetstestet P/E = P/B ÷ ROE som stänger på ${F.identAvv} procent (seriens renaste utanför bankerna), och skuld/EK på ${F.skuldEk}. Scenariorutan räknas på 2025 års bas och varje siffra har sin källa.`,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-19",
  readingMinutes: Math.max(2, Math.round(ord / 600)),
  tags: ["kvartalsrapport", "Iberdrola", "energi", "nyckeltal", "läspaket", "elbolag"],
  body,
};

if (process.argv[2] === "bygg") {
  const sökväg = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json`;
  writeFileSync(sökväg, JSON.stringify(paket, null, 1) + "\n");
  console.log(`SKREV ${sökväg}`);
  console.log(`ord=${ord} readingMinutes=${paket.readingMinutes} title=${paket.title.length} tkn description=${paket.description.length} tkn`);
  process.exit(0);
}

// ── KVD-LÄGE: kontrollera levererad fil ──────────────────────────────────────
const fil = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json`;
const fel = [], varning = [], gron = [];
const ok = (villkor, namn) => (villkor ? gron.push(namn) : fel.push(namn));
if (!existsSync(fil)) { console.error("FEL: filen finns inte — kör bygg-läget först"); process.exit(1); }
const leverad = JSON.parse(readFileSync(fil, "utf8"));
const b = leverad.body;

// A. Kanontal som texten SKALL innehålla
const kontroller = [
  ["identitet " + F.identitet, b.includes(F.identitet)],
  ["avvikelse " + F.identAvv + " procent", b.includes(`${F.identAvv} procent`)],
  ["omvänd identitet " + F.omvand, b.includes(F.omvand)],
  ["implicit EPS " + F.implicitEPS, b.includes(F.implicitEPS)],
  ["P/E-fält × årsresultat " + F.peGangerRes, b.includes(F.peGangerRes)],
  ["PE-underlag " + F.peUnderlag, b.includes(F.peUnderlag)],
  ["residual " + F.residualPct + " procent", b.includes(`${F.residualPct} procent`)],
  ["PE på årsresultat " + F.peArs, b.includes(F.peArs)],
  ["PEG replik " + F.pegArs, b.includes(F.pegArs)],
  ["PEG fält-PE " + F.pegFalt, b.includes(F.pegFalt)],
  ["implicit tillväxt " + F.implTillxFalt, b.includes(F.implTillxFalt)],
  ["EK-kedja " + F.ekKedja, b.includes(`${F.ekKedja} miljarder`)],
  ["skuld-kedja " + F.skuldKedja, b.includes(`${F.skuldKedja} miljarder`)],
  ["EV-kedja " + F.evKedja, b.includes(`${F.evKedja} miljarder`)],
  ["EBIT-bas " + F.ebitBas, b.includes(F.ebitBas)],
  ["EV/EBIT-kedja " + F.evEbitKedja, b.includes(F.evEbitKedja)],
  ["kedjekvot " + F.kedjeKvot, b.includes(F.kedjeKvot)],
  ["residual EV " + F.residualEv, b.includes(F.residualEv)],
  ["FCF M€ " + F.fcfME, b.includes(F.fcfME)],
  ["FCF-yield egen " + F.fcfYEgen, b.includes(F.fcfYEgen)],
  ["oms-serie 0 " + F.oms0, b.includes(F.oms0)],
  ["oms-serie 3 " + F.oms3, b.includes(F.oms3)],
  ["res-serie 0 " + F.res0, b.includes(F.res0)],
  ["res-serie 3 " + F.res3, b.includes(F.res3)],
  ["oms-steg " + [F.omsSteg1, F.omsSteg2, F.omsSteg3].join("/"), [F.omsSteg1, F.omsSteg2, F.omsSteg3].every((v) => b.includes(v))],
  ["res-steg " + ["+" + F.resSteg1, "+" + F.resSteg2, "+" + F.resSteg3].join("/"), ["+" + F.resSteg1, "+" + F.resSteg2, "+" + F.resSteg3].every((v) => b.includes(v))],
  ["nettomarginalserie", [F.nm0, F.nm1, F.nm2, F.nm3].every((v) => b.includes(v))],
  ["intäktsfall totalt " + F.omsFall, b.includes(F.omsFall)],
  ["scenarioceller 9 st", [F.c00, F.c01, F.c02, F.c10, F.c11, F.c12, F.c20, F.c21, F.c22].every((v) => b.includes(v))],
  ["rutceller unika", new Set([F.c00, F.c01, F.c02, F.c10, F.c11, F.c12, F.c20, F.c21, F.c22]).size === 9],
  ["1 pp = " + F.enPp, b.includes(F.enPp)],
  ["3 % = " + F.treProc, b.includes(F.treProc)],
  ["marginalvikt " + F.margVikt, b.includes(F.margVikt)],
  ["multiplövning " + F.mult, b.includes(F.mult)],
  ["median PE energi " + F.mPe, b.includes(F.mPe)],
  ["median PB energi " + F.mPb, b.includes(F.mPb)],
  ["median ROE energi " + F.mRoe, b.includes(F.mRoe)],
  ["median EBIT energi " + F.mEbit, b.includes(F.mEbit)],
  ["median netto energi " + F.mNetto, b.includes(F.mNetto)],
  ["median PE universum " + F.uPe, b.includes(F.uPe)],
  ["median PB universum " + F.uPb, b.includes(F.uPb)],
  ["median ROE universum " + F.uRoe, b.includes(F.uRoe)],
  ["median EBIT universum " + F.uEbit, b.includes(F.uEbit)],
  ["median netto universum " + F.uNetto, b.includes(F.uNetto)],
  ["skuld/EK " + F.skuldEk, b.includes(F.skuldEk)],
  ["energi-median skuld " + F.skuldMedSekt, b.includes(F.skuldMedSekt)],
  ["pris " + F.pris, b.includes(F.pris)],
  ["mcap " + F.mcap, b.includes(`${F.mcap} miljarder`)],
  ["rappdag 21 oktober", b.includes("21 oktober")],
  ["ninemånader-rytm", b.includes("nueve meses")],
  ["kalenderlänk", b.includes("calendario-accionistas-inversores")],
  ["disclaimer 2007:528", b.includes("2007:528")],
];
for (const [namn, v] of kontroller) ok(v, namn);

// B. Länkar: alla interna sökvägar 200 mot localhost + extern kalenderlänk närvarande
const sökvägar = [...new Set([...b.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]))];
const externa = [...b.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
ok(sökvägar.length >= 15, `interna länkar ≥ 15 (fann ${sökvägar.length})`);
gron.push(`interna länkar: ${sökvägar.join(", ")}`);
ok(externa.every((u) => u.includes("iberdrola.com")), "externa länkar endast iberdrola.com");
for (const p of sökvägar) {
  try {
    const r = await fetch(`http://localhost:3000${p}`, { redirect: "follow" });
    ok(r.status === 200, `länk 200 ${p}`);
  } catch { fel.push(`länk fel ${p}`); }
}

// C. Juridikgrind: inga rådfraser; köp/sälj endast i disclaimerns nekningskontext
const rådverb = /\b(köp|sälj|acquírate|avråder|råder dig|rekommenderar att du köper|rekommenderar att du säljer|bör köpa|bör sälja|bör undvika att)\b/gi;
const utanDisclaimer = b.slice(0, b.indexOf("*Detta är pedagogisk"));
ok(!rådverb.test(utanDisclaimer), "juridikgrind: 0 rådfraser utanför disclaimern");
ok(/inte en rekommendation att köpa, sälja eller behålla/.test(b), "intro-rådfriskrivning på plats");
ok(/inte investeringsrådgivning/.test(b) && /2007:528/.test(b), "slutdisclaimer på plats");

// D. Hygien: 911 = 0, mjuka bindestreck = 0, dubbla mellanslag = 0, bråkartefakter = 0
ok(!b.includes("911"), "911 = 0");
ok(!/[\u00AD\u2011]/.test(b), "mjuka bindestreck = 0");
ok(!/ {2}/.test(b.replace(/\n/g, "")), "dubbla mellanslag = 0");
ok(b.includes("0,1002") && !b.includes("0,10,02"), "ROE-bråket 0,1002 utan artefakt");
ok(b.includes("1,0705") && !b.includes("1,705"), "multiplören 1,0705 utan artefakt");
ok(!b.includes("++"), "dubbeltecken = 0");

// E. Metadata
const ordL = b.split(/\s+/).filter((w) => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
ok(ordL >= 1100 && ordL <= 3300, `ordantal ${ordL} i spannet 1 100–3 300 (seriepraxis 1 197–3 093)`);
ok(leverad.readingMinutes === Math.max(2, Math.round(ordL / 600)), `readingMinutes ${leverad.readingMinutes} = round(${ordL}/600)`);
ok(leverad.title.length >= 77 && leverad.title.length <= 260, `title ${leverad.title.length} tkn (seriepraxis 77–244+)`);
ok(leverad.description.length >= 200 && leverad.description.length <= 700, `description ${leverad.description.length} tkn (seriepraxis 204–660)`);
ok(leverad.publishedAt === "2026-10-19", "publishedAt 2026-10-19 (två dagar före rappdagen, NP3/Volvo Group-precedensen)");
ok(leverad.slug === "sa-laser-du-iberdrola-q3-2026", "slug korrekt");
ok(leverad.pillar === "Institutionell metodik", "pillar korrekt");
ok(leverad.tags.includes("energi") && leverad.tags.includes("kvartalsrapport"), "taggar innehåller energi + kvartalsrapport");

// F. Struktur: samtliga sex serieavsnitt närvarande
for (const sektion of ["## Urvalet", "## Nyckeltalen", "## Källkritik", "## Så står sig bolaget mot branschen", "## Tre sätt att läsa utfallet", "## Praktiskt inför", "## Källor"])
  ok(b.includes(sektion), `sektion: ${sektion}`);

console.log(`GRÖN: ${gron.length} kontroller`);
for (const g of gron.filter((x) => !x.startsWith("interna länkar:"))) console.log(`  ✓ ${g}`);
if (varning.length) { console.log(`VARNING: ${varning.length}`); varning.forEach((v) => console.log(`  ! ${v}`)); }
if (fel.length) {
  console.log(`FEL: ${fel.length}`);
  fel.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`KVD GRÖN — 0 FEL 0 VARNING (${gron.length} kontroller, ${ordL} ord, ${sökvägar.length} interna länkar + ${externa.length} extern(a))`);
