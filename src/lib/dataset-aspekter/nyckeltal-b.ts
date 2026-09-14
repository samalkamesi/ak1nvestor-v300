/**
 * DATASET-ASPEKTER B — nyckeltalsdjup, del B (VÅG 150 u2, TEMA 1+6)
 * =================================================================
 * Sex aspektmoduler för /dataset/[bransch]/[aspekt]: fcf-avkastning,
 * egenkapitalmultipl, skuldsattning, omsattning-cagr-5ar, prognos-tillvaxt,
 * resultat-cagr-5ar — statistik ur 100-bolagsuniversumets publika fält.
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, samma som kontraktet och
 * dataset-medianer): PUBLIKT = median/kvartiler/min/max av publika
 * marknadsnyckeltal med n-redovisning. ALDRIG i utdata: bolagsnamn,
 * tickers, AKM-poäng, vågklasser, status, golv, portV19. Källfil är
 * ENBAST data/portfolj-system/bolagsunivers.json via kontraktets egen
 * läsare (lasAspektUniversum); data/stocks/** är osynlig och förblir den.
 *
 * Gränsregeln fattas av SLUTLED-registret via matta + MIN_MATTA (se
 * kontraktet) — dessa moduler räknar alltid ärligt och gissar aldrig.
 * Gränslägen vid leverans (2026-09-14, 10 branscher × 10 bolag):
 *  - fcf-avkastning:        finans 3 mätta  ⇒ opublicerad
 *  - skuldsattning:         finans 0 mätta  ⇒ opublicerad
 *  - resultat-cagr-5ar:     finans 4, tillväxt 4 mätta ⇒ opublicerade
 *    (kommunikation 5 mätta = exakt på gränsen ⇒ publiceras)
 *
 * Texternas ton (bransch-teman §6): Du-form, juridiksäker utbildning —
 * "så fungerar metoden", aldrig råd. Siffror i ingressen läses ur
 * statistiken vid anrop, aldrig hårdkodade. Prognos-tillvaxt redovisar
 * källans natur (analyserad konsensus) i varje läsriktning.
 */
import {
  hittaKurslankar,
  lasAspektUniversum,
  sammanfatta,
  type AspektModule,
  type AspektSida,
  type AspektStat,
  type AspektUniversumRad,
} from "../dataset-aspekter-kontrakt";
import { branschNamn } from "../dataset-medianer";

// ── Formatering (svenska decimaler; null är "osatt", aldrig noll) ────────────

function svTal(v: number | null): string {
  return v === null ? "—" : String(v).replace(".", ",");
}

function svProcent(v: number | null): string {
  return v === null ? "—" : svTal(v) + " %";
}

function svMultipl(v: number | null): string {
  return v === null ? "—" : svTal(v) + "x";
}

/** Ingress då branschen saknar mättal (sidan publiceras aldrig — texten är ändå ärlig). */
function ingressUtanData(lensNamn: string, namn: string, matta: number, antal: number): string {
  return `Inom ${namn} finns just nu för få mätta bolag för ${lensNamn} (n = ${matta} av ${antal}). Metoden nedan är densamma som för övriga branscher — sidan publiceras aldrig med gissade tal, utan väntar på mer data.`;
}

// ── Modulfabrik — en gemensam generator, sex konfigurationer ─────────────────

type AspektKonfig = {
  slug: string;
  /** [X] i titelmönstret "[X] inom [Bransch] — median, spridning och hur du läser det". */
  kortNamn: string;
  /** Nyckeltalet i löptext ("kassaflödesavkastningen") för ingressens no-data-fall. */
  lensNamn: string;
  las: (r: AspektUniversumRad) => number | null | undefined;
  enhet: "procent" | "multipl";
  beskrivning: (namn: string) => string;
  ingress: (namn: string, s: AspektStat, antal: number) => string;
  saRaknas: string[];
  saLaserDu: string[];
  fellerAttUndvika: string[];
  sokord: string[];
};

function skapaAspekt(k: AspektKonfig): AspektModule {
  return {
    slug: k.slug,
    titel: (visningsNamn) =>
      `${k.kortNamn} inom ${visningsNamn} — median, spridning och hur du läser det`,
    generera: (branschSlug) => {
      const { rader } = lasAspektUniversum();
      const bolag = rader.filter((r) => r.bransch === branschSlug);
      if (bolag.length === 0) return null;
      const namn = branschNamn("sv", branschSlug);
      const stat = sammanfatta(bolag.map((r) => k.las(r)), k.enhet === "procent");
      const sida: AspektSida = {
        aspekt: k.slug,
        bransch: branschSlug,
        titel: `${k.kortNamn} inom ${namn} — median, spridning och hur du läser det`,
        beskrivning: k.beskrivning(namn),
        ingress: k.ingress(namn, stat, bolag.length),
        matta: stat.matta,
        median: stat.median,
        p25: stat.p25,
        p75: stat.p75,
        min: stat.min,
        max: stat.max,
        enhet: k.enhet,
        saRaknas: k.saRaknas,
        saLaserDu: k.saLaserDu,
        fellerAttUndvika: k.fellerAttUndvika,
        kurslankar: hittaKurslankar(k.sokord),
      };
      return sida;
    },
  };
}

// ── 1. fcf-avkastning — tema 6: "utdelningstemat, rätt gjort" ────────────────

const fcfAvkastning = skapaAspekt({
  slug: "fcf-avkastning",
  kortNamn: "FCF-avkastning",
  lensNamn: "kassaflödesavkastningen",
  las: (r) => r.vardering?.fcfYield,
  enhet: "procent",
  beskrivning: (namn) =>
    `FCF-avkastning inom ${namn}: median och spridning i 100-bolagsuniversumet — kassaflödets råmaterial för utdelningsanalys, med redovisad metod.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("kassaflödesavkastningen", namn, s.matta, antal);
    return `Kassaflödesavkastningen visar hur mycket fritt kassaflöde ett bolag genererar per krona börsvärde. Inom ${namn} är medianen ${svProcent(s.median)} och spridningen går från ${svProcent(s.min)} till ${svProcent(s.max)}. Plattformen saknar utdelningsdata helt (0 av 100 bolag i universumet), så du får kassaflödesavkastningen som råmaterial: utdelningar betalas ur det fria kassaflödet, men beslutet om utdelning är styrelsens.`;
  },
  saRaknas: [
    "Ta bolagets fria kassaflöde (FCF): kassaflödet från den löpande verksamheten minus investeringar i verksamheten, ur den senaste räkenskapsperioden.",
    "Dividera det fria kassaflödet med bolagets börsvärde — marknadsvärdet på alla aktier.",
    "Resultatet är en andel (0,05 = 5 %) och redovisas här som procent med en decimal.",
    "Sortera branschens tal och läs av medianen (mittpunkten), kvartilerna P25/P75 (spridningens kärna) samt min och max.",
    "n = antalet bolag med mätt värde — saknad data räknas aldrig som noll, den exkluderas ur beräkningen.",
  ],
  saLaserDu: [
    "Högre kassaflödesavkastning betyder mer genererade kontanter per prissatt krona — ett mått på kassaflödesförmåga, inte ett köp- eller säljbeslut.",
    "Negativ kassaflödesavkastning är ett giltigt utfall: bolaget förbrukar kontanter (investeringar större än kassaflödet), vilket är vanligt i tillväxtskeden.",
    "Plattformen saknar direkt utdelningsdata (0 av 100 bolag) — därför visas kassaflödesavkastningen som råmaterial. Utdelning betalas ur fritt kassaflöde, men utdelningsbeslutet är styrelsens och kan ligga långt under (eller över) kassaflödet.",
    "Jämför inom branschen, inte mellan branscher: kapitalintensitet och investeringscykler gör talen olika jämförbara.",
    "Läs n: färre mätta bolag ger en skörare median, och spridningen P25–P75 talar om hur sammanhållen branschens kärna är.",
  ],
  fellerAttUndvika: [
    "Att tolka hög kassaflödesavkastning som en rekommendation — nyckeltalet är ett analysunderlag; slutsatserna drar du själv i helheten.",
    "Att förväxla kassaflödesavkastning med utdelningsavkastning: FCF visar utrymmet, medan utdelningsbeslutet kan ligga på en helt annan nivå.",
    "Att jämföra ett kapitalintensivt bolag med ett tjänste- eller mjukvarubolag på samma siffra — investeringsbehoven gör talen olika jämförbara.",
  ],
  sokord: ["utdelning", "kassaflöde"],
});

// ── 2. egenkapitalmultipl — Grahams varning per bransch ─────────────────────

const egenkapitalmultipl = skapaAspekt({
  slug: "egenkapitalmultipl",
  kortNamn: "Egenkapitalmultipl",
  lensNamn: "egenkapitalmultiplen",
  las: (r) => r.vardering?.egenKapitalMultipl,
  enhet: "multipl",
  beskrivning: (namn) =>
    `Egenkapitalmultipl inom ${namn}: median, kvartiler och spridning — vad marknaden betalar per bokförd krona, med Grahams varning förklarad.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("egenkapitalmultiplen", namn, s.matta, antal);
    return `Egenkapitalmultiplen visar vad marknaden betalar per bokförd krona i eget kapital. Inom ${namn} är medianen ${svMultipl(s.median)} och spridningen går från ${svMultipl(s.min)} till ${svMultipl(s.max)}. Benjamin Graham varnade för just höga multiplar: ju mer marknaden betalar per bokförd krona, desto mindre skydd ligger kvar i balansräkningen om förväntningarna svalnar.`;
  },
  saRaknas: [
    "Ta bolagets börsvärde (kurs gånger antal aktier) och dess bokförda eget kapital ur den senaste balansräkningen.",
    "Dividera börsvärdet med det egna kapitalet — svaret är en multipel i kronor per bokförd krona.",
    "Redovisa multiplarna med en decimal och gruppera dem per bransch.",
    "Sortera talen och läs av median, kvartiler (P25/P75) samt min och max — n = antalet bolag med mätt multipel.",
  ],
  saLaserDu: [
    "Multiplen talar om vad marknaden betalar för en bokförd krona i eget kapital — begreppsmässigt släkt med substansvärdering (P/B-familjen).",
    "Graham-varningen: hög multipel betyder att marknaden betalar mycket per bokförd krona — skyddet i balansräkningen tunnas ut och värdet vilar tungt på framtida förväntningar.",
    "Låg multipel är inte automatiskt billigt: det egna kapitalet kan vara nedskrivet, föråldrat eller svagt förväntat avkastat — priset söker sig mot bokfört värde när avkastningen är svag.",
    "Eget kapital fungerar olika mellan bolagsformer: investmentbolag värderas mot substans och banker har annan balansräkningslogik — jämför inom samma bolagstyp.",
    "Multipel under 1x betyder att marknaden prissätter bolaget under bokfört eget kapital — ett utfall att förstå (skepsis mot bokförda värden), inte en köpsignal.",
  ],
  fellerAttUndvika: [
    "Att läsa hög multipel som kvalitet — talet är pris per bokförd krona, inte ett mått på bolagets skick.",
    "Att jämföra branscher rakt av — tjänstebolagets och fastighetsbolagets balansräkningar består av olika slags tillgångar.",
    "Att glömma att eget kapital är en bokförd storhet — vilken multipel som är rimlig styrs av vilken avkastning kapitalet förväntas ge.",
  ],
  sokord: ["substans", "multipel", "eget kapital"],
});

// ── 3. skuldsattning — balansräkningens riskmått (visas som x) ───────────────

const skuldsattning = skapaAspekt({
  slug: "skuldsattning",
  kortNamn: "Skuldsättning",
  lensNamn: "skuldsättningsgraden",
  las: (r) => r.stabilitet?.skuldEgenkapital,
  enhet: "multipl",
  beskrivning: (namn) =>
    `Skuldsättning inom ${namn}: median och spridning i skuld per krona eget kapital (x) — så läser du balansräkningens riskmått utan att blanda bolagsformer.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("skuldsättningsgraden", namn, s.matta, antal);
    return `Skuldsättningsgraden mäter bolagets skuld per krona eget kapital. Inom ${namn} är medianen ${svMultipl(s.median)} och spridningen går från ${svMultipl(s.min)} till ${svMultipl(s.max)}. Du läser talet som balansräkningens riskmått — och jämför det bara inom branschen, eftersom banker och investmentbolag mäter skuld på ett helt annat sätt.`;
  },
  saRaknas: [
    "Ta bolagets skulder och dividera dem med dess bokförda eget kapital — båda storheterna ur den senaste balansräkningen.",
    "Resultatet är en multipel som visas med x: 0,5x betyder femtio öre skuld per krona eget kapital.",
    "Sortera branschens tal och läs av median, kvartiler (P25/P75) samt min och max.",
    "n = antalet bolag med mätt tal — saknad data räknas aldrig som noll, och branscher utan mättal publiceras aldrig.",
  ],
  saLaserDu: [
    "Högre skuldsättning gör resultatet känsligare: räntekostnaderna äter marginalen i motvind och svängningarna i eget kapital förstärks.",
    "Branschens normalnivå skiljer sig åt: fastighets- och infrastrukturbolag lånar mot fysiska tillgångar med långsamma kassaflöden, medan tjänstebolag ofta klarar sig med mindre skuld — jämför mot branschens median.",
    "Banker och bolag med finansiell balansräkning hör inte hemma i jämförelsen — skuld är deras råvara, inte deras riskmått (i detta universum saknas mättal helt för finansgruppen).",
    "Multipel över 1x betyder mer skuld än eget kapital — i sig varken bra eller dåligt; läs den mot branschens kapitalstruktur och bolagets övriga kassaflödesdata.",
    "Tal nära 0x betyder i praktiken skuldfritt — vanligast bland bolag som finansierar sin tillväxt internt.",
  ],
  fellerAttUndvika: [
    "Att döma skuldsättning utan branschsammanhang — samma multipl är normal i en bransch och ansträngd i en annan.",
    "Att förväxla låg skuld med säkert — obegagnad lånekraft kan också vara outnyttjad finansiell ryggrad eller svag tillgång till kredit.",
    "Att blanda bolagsformer: banker, investmentbolag och driftsbolag mäter skuld olika — och för finansgruppen finns inga mättal i universumet.",
  ],
  sokord: ["skuld", "soliditet", "stabilitet"],
});

// ── 4. omsattning-cagr-5ar — femårs tillväxttakt ─────────────────────────────

const omsattningCagr = skapaAspekt({
  slug: "omsattning-cagr-5ar",
  kortNamn: "Omsättningstillväxt (CAGR 5 år)",
  lensNamn: "femårs-CAGR:n för omsättningen",
  las: (r) => r.tillvaxt?.omsattningCAGR5ar,
  enhet: "procent",
  beskrivning: (namn) =>
    `Omsättningstillväxt (CAGR 5 år) inom ${namn}: median och spridning — så räknas den årliga genomsnittliga intäktstillväxten och vad den inte säger.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("femårs-CAGR:n för omsättningen", namn, s.matta, antal);
    return `CAGR är den genomsnittliga årliga omsättningstillväxten under fem år — den jämnar ut enskilda års toppar och dalar. Inom ${namn} är medianen ${svProcent(s.median)} och spridningen går från ${svProcent(s.min)} till ${svProcent(s.max)}. Obs: många bolag i universumet har bara fyra räkenskapsår i datan, vilket gör deras tal känsligare för startåret.`;
  },
  saRaknas: [
    "Samla omsättningen (intäkterna) för de senaste fem räkenskapsåren per bolag.",
    "Räkna CAGR: sista årets omsättning dividerat med första årets, upphöjt till 1 dividerat med antalet år, minus 1 — den genomsnittliga årliga tillväxttakten.",
    "Omvandla andelen till procent med en decimal.",
    "Gruppera per bransch, sortera och läs av median, kvartiler och min/max — n = antalet mätta bolag.",
    "Bolag med kortare historik (många i universumet har bara fyra räkenskapsår) får tal som grundar sig på färre år — läs n och källan innan du jämför.",
  ],
  saLaserDu: [
    "CAGR jämnar ut: två bolag kan ha samma femårs-CAGR med helt olika årsförlopp — jämn tillväxt respektive kris och upphämtning ger samma tal.",
    "Negativ CAGR är ett giltigt utfall: omsättningen har krympt i genomsnitt per år, vilket förekommer i omstruktureringar och cykliskt svaga perioder.",
    "Många bolag i universumet har bara fyra räkenskapsår — deras CAGR vilar på kortare historia och blir känsligare för vilket år serien börjar.",
    "Jämför gärna femårs-CAGR med senaste årets tillväxt: en stadig CAGR men avmattad senaste år kan betyda att momentumet håller på att ändras.",
    "Spridningen P25–P75 visar hur olika branschens bolag har vuxit — medianen ensam döljer både snabbväxare och krympande bolag.",
  ],
  fellerAttUndvika: [
    "Att extrapolera fem år rakt fram i framtiden — historisk tillväxt har ingen garanterad fortsättning.",
    "Att jämföra CAGR mellan branscher utan att väga in mognad: några procent i en mogen bransch kan vara friskare tillväxt än dubbla siffran i en mycket ung.",
  ],
  sokord: ["tillväxt", "omsättning", "intäkt"],
});

// ── 5. prognos-tillvaxt — konsensusens förväntan, aldrig faktum ──────────────

const prognosTillvaxt = skapaAspekt({
  slug: "prognos-tillvaxt",
  kortNamn: "Prognostiserad tillväxt",
  lensNamn: "den prognostiserade tillväxten",
  las: (r) => r.tillvaxt?.prognosTillvaxt,
  enhet: "procent",
  beskrivning: (namn) =>
    `Prognostiserad tillväxt inom ${namn}: median och spridning i analyskonsensusens förväntningar — källans natur redovisas: prognos, inte utfall.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("den prognostiserade tillväxten", namn, s.matta, antal);
    return `Prognostiserad tillväxt är analyskonsensusens samlade förväntan — en prognos, aldrig ett redovisat faktum. Inom ${namn} är medianen ${svProcent(s.median)} och spridningen går från ${svProcent(s.min)} till ${svProcent(s.max)}. Talet speglar analytikers antaganden om framtiden, inte framtiden själv — du använder det för att förstå var förväntningarna står, inte som en kursprognos.`;
  },
  saRaknas: [
    "Ta analyskonsensusens aggregerade tillväxtförväntan per bolag: datakällan samlar prognoser från flera analytiker och redovisar ett sammanvägt tal.",
    "Talet är en förväntad framtida tillväxttakt i procent per år — inte ett redovisat utfall.",
    "Omvandla till procent med en decimal och gruppera talen per bransch.",
    "Sortera och läs av median, kvartiler, min och max — n = antalet bolag med prognos i datan.",
  ],
  saLaserDu: [
    "Källans natur: konsensusprognos betyder analytikers samlade antaganden om framtiden — de kan vara rätt, fel eller föråldrade, men de är aldrig ett faktum.",
    "Hög prognostiserad tillväxt är en förväntan med osäkerhet: ju längre horisont talet sträcker sig över, desto större blir felmarginalen.",
    "Prognoser förändras med rapporter, konjunktur och ränta — leta alltid reda på när prognosen gjordes innan du väger den tungt.",
    "Jämför prognosen med den faktiska historiken (till exempel omsättningstillväxten): växer förväntningarna snabbare än historien har levererat?",
    "Branschmedianen visar var marknadens samlade förväntningar står — använd den som utgångspunkt för dina egna frågor, inte som en kursprognos.",
  ],
  fellerAttUndvika: [
    "Att presentera konsensustalet som sant eller säkert — det är en aggregerad förväntan med föränderlig osäkerhet.",
    "Att blanda prognostiserad tillväxt med realiserad historisk tillväxt — olika begrepp, olika källor, olika säkerhet.",
    "Att tro att hög förväntad tillväxt automatiskt är positiv — höga förväntningar kan vara svåra att infria och redan prissatta.",
  ],
  sokord: ["tillväxt", "diskonterade"],
});

// ── 6. resultat-cagr-5ar — universumets lägsta datatäckning ──────────────────

const resultatCagr = skapaAspekt({
  slug: "resultat-cagr-5ar",
  kortNamn: "Resultattillväxt (CAGR 5 år)",
  lensNamn: "femårs-CAGR:n för resultatet",
  las: (r) => r.tillvaxt?.resultatCAGR5ar,
  enhet: "procent",
  beskrivning: (namn) =>
    `Resultattillväxt (CAGR 5 år) inom ${namn}: median och spridning — med fällorna vid negativa basår och universumets lägsta datatäckning.`,
  ingress: (namn, s, antal) => {
    if (s.median === null) return ingressUtanData("femårs-CAGR:n för resultatet", namn, s.matta, antal);
    return `Resultat-CAGR är den genomsnittliga årliga resultattillväxten under fem år. Inom ${namn} är medianen ${svProcent(s.median)} och spridningen går från ${svProcent(s.min)} till ${svProcent(s.max)}. Datatäckningen är universumets lägsta — läs alltid n (${s.matta} mätta bolag av ${antal} här) innan du jämför branscher.`;
  },
  saRaknas: [
    "Samla resultatet per räkenskapsår för de senaste fem åren — samma resultatmått hela perioden, enligt datakällans konvention.",
    "Räkna CAGR: sista årets resultat dividerat med första årets, upphöjt till 1 dividerat med antalet år, minus 1.",
    "Negativt eller noll resultat i basåret gör CAGR svårberäknad eller meningslös — sådana serier exkluderas ur beräkningen i stället för att förvrida talet.",
    "Omvandla andelen till procent med en decimal, gruppera per bransch och sortera — median, kvartiler, min/max och n.",
  ],
  saLaserDu: [
    "Resultattillväxten väger tyngre än omsättningstillväxten för ägandet: omsättning som inte blir resultat skapar sällan värde.",
    "Detta nyckeltal har universumets lägsta datatäckning — läs alltid n för branschen innan du jämför, och branscher under gränsen publiceras aldrig.",
    "Negativa basår: ett bolag som gått från förlust till vinst saknar ofta meningsfull CAGR — gruppen blir därför snedvriden mot stabilt lönsamma bolag.",
    "Resultat-CAGR kan måla om stora svängningar till en enda siffra — komplettera med marginaler och kassaflöde för en hel bild.",
    "Läs resultat-CAGR tillsammans med omsättning-CAGR: växer resultatet snabbare än omsättningen har marginalerna förbättrats under perioden.",
  ],
  fellerAttUndvika: [
    "Att läsa hög CAGR som uthållig — fem år räcker sällan som bevis på en strukturell trend.",
    "Att jämföra branscher utan att kolla n — en median på få mätta bolag är skörare än en på många.",
    "Att glömma basårets nivå: från en mycket låg utgångsnivå blir tillväxten spektakulär i procent utan att betyda detsamma.",
  ],
  sokord: ["resultat", "tillväxt", "lönsamhet"],
});

// ── Export — EXAKT sex slugs i kontraktets ordning ───────────────────────────

export const aspekter: AspektModule[] = [
  fcfAvkastning,
  egenkapitalmultipl,
  skuldsattning,
  omsattningCagr,
  prognosTillvaxt,
  resultatCagr,
];
