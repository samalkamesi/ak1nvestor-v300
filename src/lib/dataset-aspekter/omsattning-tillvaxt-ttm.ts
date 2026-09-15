/**
 * DATASET-ASPEKTER — omsättningstillväxt TTM (SPÅR 2 s2-u1, TEMA 1)
 * =====================================================================
 * En aspektmodul för /dataset/[bransch]/omsattningstillvaxt-ttm: den
 * FAKTISKA omsättningstillväxten senaste tolv månaderna (trailing twelve
 * months) — det redovisade utfallet, till skillnad från prognos-tillvaxt
 * (konsensusförväntan) och omsattning-cagr-5ar (femårsmedel). Tillsammans
 * bildar de tre sidorna spegeln faktum ↔ medel ↔ förväntan per bransch.
 *
 * Universumjämförelsen (spårets postmall): sidan bär universum-fältet
 * (s2-u2:s kontraktsmönster) — samma mått, samma sammanfatta, men över
 * ALLA universumets rader — och ingressen väver in universumets median i
 * texten. Kvartilerna P25/P75 redovisas av statistikblocket som för alla
 * nyckeltalssidor.
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, oföränderlig princip): PUBLIKT =
 * median/kvartiler/min/max av publika marknadsnyckeltal med n-redovisning.
 * ALDRIG i utdata: bolagsnamn, tickers, AKM-poäng, vågklasser, status,
 * golv, portV19. Källfil är ENBAST data/portfolj-system/bolagsunivers.json
 * via kontraktets egen läsare (lasAspektUniversum).
 *
 * Dubbelgrind (u5:s vit-test-mönster): null när huvudmåttets matta <
 * MIN_MATTA. Vid leverans (2026-09-15) har alla branscher full mättäckning
 * (energi 13 bolag efter spårsyskonets utökning, övriga 10) — ingen sida
 * faller mot gränsregeln; växer universumet räknar modulen om från filen.
 *
 * Texternas ton (bransch-teman §6): Du-form, juridiksäker utbildning —
 * "så fungerar måttet", aldrig råd. Siffror läses ur statistiken vid
 * anrop, aldrig hårdkodade.
 */
import {
  hittaKurslankar,
  lasAspektUniversum,
  MIN_MATTA,
  sammanfatta,
  sammanfattaUniversum,
  type AspektModule,
  type AspektSida,
} from "../dataset-aspekter-kontrakt";
import { branschNamn } from "../dataset-medianer";

// ── Formatering (svenska decimaler; null är "osatt", aldrig noll) ────────────

function svProcent(v: number | null): string {
  return v === null ? "—" : String(v).replace(".", ",") + " %";
}

// ── Modulen — en slug, tio branschsidor (alla över gränsregeln) ─────────────

export const omsattningTillvaxtTtm: AspektModule = {
  slug: "omsattningstillvaxt-ttm",
  titel: (visningsNamn) =>
    `Omsättningstillväxt (TTM) inom ${visningsNamn} — median, spridning och hur du läser det`,
  generera: (branschSlug) => {
    const { rader } = lasAspektUniversum();
    const bolag = rader.filter((r) => r.bransch === branschSlug);
    if (bolag.length === 0) return null;
    const namn = branschNamn("sv", branschSlug);
    const stat = sammanfatta(bolag.map((r) => r.tillvaxt?.omsattningTillvaxtTTM), true);
    // Dubbelgrind: under MIN_MATTA mätta returneras ingen sida — slutledet
    // publicerar den heller inte, och få-observations-medianer kan aldrig
    // nå utdata från denna modul.
    if (stat.matta < MIN_MATTA) return null;
    const uni = sammanfattaUniversum((r) => r.tillvaxt?.omsattningTillvaxtTTM, true);
    const jamforelse =
      stat.median !== null && uni.median !== null && uni.median !== 0
        ? stat.median > uni.median
          ? `högre än universumets median på ${svProcent(uni.median)}`
          : stat.median < uni.median
            ? `lägre än universumets median på ${svProcent(uni.median)}`
            : `samma som universumets median (${svProcent(uni.median)})`
        : "universumets median är osatt";
    const sida: AspektSida = {
      aspekt: "omsattningstillvaxt-ttm",
      bransch: branschSlug,
      titel: `Omsättningstillväxt (TTM) inom ${namn} — median, spridning och hur du läser det`,
      beskrivning: `Omsättningstillväxt (TTM) inom ${namn}: median, kvartiler och universumjämförelse — den faktiska tillväxten senaste 12 månaderna, steg för steg.`,
      ingress:
        stat.median === null
          ? `Inom ${namn} finns just nu för få mätta bolag för omsättningstillväxten (n = ${stat.matta} av ${bolag.length}). Metoden nedan är densamma som för övriga branscher — sidan publiceras aldrig med gissade tal.`
          : `Omsättningstillväxten TTM är det redovisade utfallet: hur mycket intäkterna växte de senaste tolv månaderna, rullande. Inom ${namn} är medianen ${svProcent(stat.median)} — ${jamforelse} — och spridningen går från ${svProcent(stat.min)} till ${svProcent(stat.max)}. Talet är ett faktum ur rapporterna, i motsats till prognostiserad tillväxt som är en förväntan.`,
      matta: stat.matta,
      median: stat.median,
      p25: stat.p25,
      p75: stat.p75,
      min: stat.min,
      max: stat.max,
      enhet: "procent",
      // Universumjämförelse (s2-u2:s kontraktsfält): samma extractor och
      // enhet över alla universumets rader — vyn renderar blocket.
      universum: uni,
      saRaknas: [
        "Summera intäkterna (omsättningen) för de fyra senaste kvartalsrapporterna — eller läs rullande tolvmånadersersättningen direkt ur den senaste års- eller kvartalsrapporten.",
        "Gör samma övning för de fyra kvartalen ett år tidigare, så att båda perioderna är tolv månader långa och jämförbara.",
        "Dividera senaste tolv månaderna med de föregående tolv och dra ifrån 1 — resultatet är den faktiska tillväxttakten som andel.",
        "Omvandla andelen till procent med en decimal (0,068 blir 6,8 %).",
        "Sortera branschens tal och läs av medianen, kvartilerna P25/P75 samt min och max — n = antalet bolag med mätt värde; saknad data räknas aldrig som noll.",
        "Räkna samma median över alla universumets bolag för jämförelseraden — samma hjälpare, samma metod, ingen annan källa.",
      ],
      saLaserDu: [
        "TTM är ett redovisat faktum: talen kommer ur publicerade rapporter, inte ur prognoser — men ett faktum om gårdagen säger inget garanterat om morgondagen.",
        "Jämför med branschens egna tal: medianen visar nivån, kvartilerna P25–P75 visar hur sammanhållen kärnan är, och min–max visar ytterligheterna.",
        "Använd universumjämförelsen som riktmärke: ligger branschmedianen över universumets median växer branschens bolag i snabbare takt än marknaden i genomsnitt — en iakttagelse, inte en värdering.",
        "Ställ TTM mot femårs-CAGR (omsattning-cagr-5ar): hög TTM men låg CAGR kan vara ett uppsving efter svaga år; låg TTM men hög CAGR en avmattning efter stark period.",
        "Ställ TTM mot prognostiserad tillväxt (prognos-tillvaxt): växer förväntningarna snabbare än det faktiska utfallet vilar framtiden på hopp — och tvärtom.",
        "Valuta och förvärv snedvrider: ett bolag som köpt sig till tillväxt eller växer i svag valuta kan visa hög TTM utan organisk tillväxt.",
      ],
      fellerAttUndvika: [
        "Att tolka hög tillväxt som en rekommendation — nyckeltalet är analysunderlag; slutsatserna drar du själv i helheten av värdering, lönsamhet och risk.",
        "Att blanda ihop TTM (faktiskt utfall) med prognostiserad tillväxt (konsensusförväntan) — olika begrepp, olika källor, olika säkerhet.",
        "Att jämföra branscher rakt av utan valutakontext — universumet mäter bolag i flera valutor, och tolv månaders valutavrörelser sitter i talen.",
        "Att glömma att tolv månader är en kort period: engångsposter, stora kontrakt och räkenskapsårsskiften kan lyfta eller sänka talet kraftigt.",
      ],
      kurslankar: hittaKurslankar(["tillväxt", "omsättning", "intäkt"]),
    };
    return sida;
  },
};
