import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { lasAnalyser, getAnalys, HORIZONTER } from "@/lib/analysfabrik";
import { hamtaAkm2ForAnalys, hamtaAkm3ForAnalys } from "@/lib/akm2-onsdemand";
import { modulKortNamn } from "@/lib/akm2-visningsdata";
import { VARIABEL_META } from "@/lib/akm2/karna";
import {
  raknaIntervall,
  raknaFullviktsIntervall,
  intervallText,
  intervallPlusText,
} from "@/lib/akm3/osakerhet";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { peerDragText, peerRankText, PEER_HALLNING_TEXT } from "@/lib/portfolj-forskning/peer";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";
import { DelRad } from "@/components/ak1a/del-rad";
import { DelaKort } from "@/components/ak1a/dela-kort";
import { Akm2Dashboard, ProfilEnsembleVy } from "@/components/ak1a/akm2-dashboard";

export const dynamic = "force-static";
// Okända params ⇒ 404 FÖRE render (force-static ensam serverar annars
// layout-skalet med 200 = soft-404; samma rad som blogg/[slug] och kurserna).
export const dynamicParams = false;

export function generateStaticParams() {
  return lasAnalyser().map((a) => ({ ticker: encodeURIComponent(a.ticker) }));
}

const SITE_URL = "https://lab.ak1nvestor.com";

const KATEGORI_ETIKETT: Record<string, string> = {
  tillvaxt: "Tillväxt",
  vardering: "Värdering",
  lonsamhet: "Lönsamhet",
  stabilitet: "Stabilitet",
  moat: "Moat",
  katalysator: "Katalysator",
  risk: "Risk",
};

const DYN_ETIKETT: Record<string, string> = {
  forbattras: "förbättras",
  stabilt: "stabilt",
  forsvamras: "försvagas",
  osatt: "osatt",
};

/** AKM2-bandens pedagogiska etiketter (kärnans BAND_TEXT — aldrig köp/sälj). */
const AKM2_BAND_ETIKETT: Record<string, string> = {
  aktor: "Aktör att följa",
  studera: "Studera vidare",
  skjut: "Skjut inte",
  osatt: "Osatt",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const a = getAnalys(ticker);
  if (!a) return {};
  const kort = a.namn.replace(/\s*\(publ\)\s*$/, "");
  return pageMetadata({
    path: `/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`,
    title: `${kort} analys — AKM1-forskning | AK1A`,
    description: `Automatisk forskningsöversikt: ${kort} (${a.ticker}) — AKM1 ${String(a.akm1.totalt).replace(".", ",")}/${String(a.akm1.maxMojligt).replace(".", ",")} p, status ${a.urval.statusEtikett}, vågläge, risker och mätbara falsifieringsvillkor. Forskningsunderlag — ej rådgivning.`,
    keywords: [
      `${kort} analys`,
      `${kort} AKM1`,
      `${a.ticker} fundamental analys`,
      "svensk aktieanalys",
      "forskningsunderlag",
    ],
    type: "article",
    publishedTime: a.versionsdatum,
  });
}

/** Svensk procenttext: 0.688 → "68,8 %". */
function pct(x: number, decimaler = 1) {
  return (x * 100).toFixed(decimaler).replace(".", ",") + " %";
}

function sv(x: number | null | undefined) {
  return (x ?? 0).toString().replace(".", ",");
}

export default async function AnalysfabrikDetaljPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const a = getAnalys(ticker);
  if (!a) notFound();

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Forskningsbiblioteket", path: "/forskningsbiblioteket" },
      { name: a.namn, path: `/forskningsbiblioteket/${encodeURIComponent(a.ticker)}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${a.namn} (${a.ticker}) — automatisk AKM1-forskningsöversikt`,
      description: a.disclaimer,
      inLanguage: "sv-SE",
      datePublished: a.versionsdatum,
      dateModified: a.versionsdatum,
      author: { "@type": "Organization", name: "AK1A Research Lab" },
      publisher: { "@type": "Organization", name: "AK1A", url: SITE_URL },
      mainEntityOfPage: `${SITE_URL}/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`,
      about: { "@type": "Corporation", name: a.namn, tickerSymbol: a.ticker },
    },
  ];

  const kategorier = Object.entries(a.akm1?.perKategori || {});

  // AKM2-dashboard (våg 57 D3): D2:s akm2-cache om den finns, annars
  // on-demand med raknaAKM2 ur nyckeltalscachen — null ⇒ sektionen renderas ej.
  const akm2 = hamtaAkm2ForAnalys(a.ticker);

  // AKM3-ensemble (våg 59 bygg-1, BESLUT §4): data/cache/akm3-{ticker}.json i
  // första hand (skrivs av portfolj-uppfoljning-cronen), annars on-demand med
  // raknaEnsemble ur samma nyckeltalscache — null ⇒ ensemble-vyn renderas ej.
  // Visas ALLTID sida vid sida med AKM2/AKM1 — ersätter ALDRIG (P4).
  const akm3 = hamtaAkm3ForAnalys(a.ticker);

  // VÅG 59 (AKM3 steg 3 — r4 §3.2): osäkerhetsintervall ur (poäng, täckning,
  // port). Deterministiskt presentationslager — läser poängen, ändrar ALDRIG.
  const intervallAkm1 = raknaIntervall(a.akm1.totalt, a.urval.datatackning, a.urval.portV19);
  const intervallAkm2 =
    a.akm2 && a.akm2.totalt !== null
      ? raknaIntervall(a.akm2.totalt, a.urval.datatackning, a.akm2.portAktiv)
      : null;
  // Strängare fullviktsrad för AKM2-kompositen (BESLUT §5): [K·t, K·t+100(1−t)]
  // — "med profilen behållen vid full data". Extra rad, aldrig primär.
  const fullviktAkm2 =
    a.akm2 && a.akm2.totalt !== null
      ? raknaFullviktsIntervall(a.akm2.totalt, a.urval.datatackning)
      : null;

  // VÅG 59 (AKM3 steg 4 — r3 §4.2): peer-spegeln ur korstabellens rader
  // (peer-berikade i lasKorstabellGrund). Saknas bolaget i universum visas
  // blocket ej — bakåtkompatibelt. Läslager: påverkar ALDRIG poängen.
  const korstabell = lasKorstabellGrund();
  const peerRad = korstabell.rader.find((r) => r.ticker === a.ticker) ?? null;
  const peer = peerRad?.peer ?? null;

  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Forskningsbiblioteket", href: "/forskningsbiblioteket" },
        { name: a.namn },
      ]}
      wide
    >
      <StrukturData data={jsonLd} />

      <p className="text-xs uppercase tracking-widest text-gold">
        {a.land || "—"} · {a.bransch} · {a.valuta || ""}
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold">{a.namn}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {a.ticker} · version {a.versionsdatum} · underlag senast kontrollerat{" "}
        {a.underlagSenastKontrollerad || "—"}
      </p>

      <div className="mt-4 rounded-lg border border-gold/40 bg-gold/5 p-4">
        <p className="text-sm font-semibold">{a.etikett}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {a.disclaimer}
        </p>
      </div>

      {/* ── Urvalet — regeln rå + utfallet (transparens = kundkultur) ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Urvalet — regeln och utfallet</h2>
        <code className="mt-3 block rounded border border-gold/20 bg-card p-3 font-mono text-xs leading-relaxed">
          {a.urval.regel}
        </code>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded border border-gold/10 bg-card p-3">
            <dt className="text-xs text-muted-foreground">STATUS</dt>
            <dd className="mt-1 font-semibold">
              {a.urval.statusEtikett}
              {a.urval.varning ? " ⚠" : ""}
            </dd>
          </div>
          <div className="rounded border border-gold/10 bg-card p-3">
            <dt className="text-xs text-muted-foreground">AKM1 / MAX</dt>
            <dd className="mt-1 font-semibold">
              {sv(a.akm1.totalt)} / {sv(a.akm1.maxMojligt)} ({pct(a.akm1.relativ)})
            </dd>
          </div>
          <div className="rounded border border-gold/10 bg-card p-3">
            <dt className="text-xs text-muted-foreground">DATATÄCKNING</dt>
            <dd className="mt-1 font-semibold">{pct(a.urval.datatackning)}</dd>
          </div>
          <div className="rounded border border-gold/10 bg-card p-3">
            <dt className="text-xs text-muted-foreground">PORT V19</dt>
            <dd className="mt-1 font-semibold">
              {a.urval.portV19 ? "TRIGGAD (röd)" : "ej triggad"}
            </dd>
          </div>
        </dl>
        {a.urval.varning && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">⚠ {a.urval.varning}</p>
        )}
      </section>

      {/* ── Osäkerhet (VÅG 59, AKM3 steg 3) — spannet vid full data ── */}
      {intervallAkm1 && (
        <section className="mt-10" aria-label="Osäkerhetsintervall">
          <h2 className="font-serif text-2xl font-bold">Osäkerhet — var totalen hamnar vid full data</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gold/20 bg-card p-4">
              <h3 className="font-semibold">AKM1-totalen</h3>
              <p className="mt-2 font-serif text-2xl font-bold text-gold tabular">
                {intervallText(intervallAkm1)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Kompakt: {intervallPlusText(intervallAkm1)} — ± är halva spannet.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {a.akm1.antalOsatta} av 20 variabler är osatta — spannet visar vad de är värda:
                0 p (värsta) till 5 p (bästa) på den osatta vikten.
                {a.urval.portV19 && " Hård port (V19) aktiv: övre gräns takad till 45."}
              </p>
            </div>
            {intervallAkm2 && fullviktAkm2 && (
              <div className="rounded-lg border border-gold/20 bg-card p-4">
                <h3 className="font-semibold">AKM2-kompositen</h3>
                <p className="mt-2 font-serif text-2xl font-bold text-gold tabular">
                  {intervallText(intervallAkm2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Kompakt: {intervallPlusText(intervallAkm2)}.
                </p>
                <p className="mt-2 border-t border-gold/15 pt-2 text-xs leading-relaxed text-muted-foreground">
                  Strängare fullviktsrad (med profilen behållen vid full data): [
                  {String(Math.round(fullviktAkm2.nedre)).replace(".", ",")}–
                  {String(Math.round(fullviktAkm2.ovre)).replace(".", ",")}] — [K·t, K·t+100·(1−t)].
                </p>
                {intervallAkm2.portTakad && (
                  <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-400">
                    Hård port aktiv — kompositens övre gräns takad till 45.
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Spannet visar var totalen hamnar när den osatta vikten poängsätts — 0 p (värsta)
            till 5 p (bästa). Modellen gissar aldrig: nedre gräns är poängen själv, bredden
            beror enbart på datatäckningen, och strukturellt saknad data rapporteras som
            saknad (aldrig imputerad). Nya data som sätter en variabel kan behålla eller höja
            totalen — modellen straffar aldrig saknad data.
          </p>
        </section>
      )}

      {/* ── AKM1-profilen ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">AKM1-profilen</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {sv(a.akm1.totalt)} av {sv(a.akm1.maxMojligt)} möjliga poäng ({pct(a.akm1.relativ)}).
          Starkaste kategorin är{" "}
          <strong>{KATEGORI_ETIKETT[a.akm1.starkast] || a.akm1.starkast}</strong>, svagaste{" "}
          <strong>{KATEGORI_ETIKETT[a.akm1.svagast] || a.akm1.svagast}</strong>.{" "}
          {a.akm1.antalOsatta} av 20 variabler är osatta ({a.akm1.osattaVariabler.join(", ")}) —
          analysen vilar på {20 - a.akm1.antalOsatta} mätta variabler.
        </p>

        <div className="mt-4 space-y-2">
          {kategorier.map(([kat, varde]) => (
            <div key={kat} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">
                {KATEGORI_ETIKETT[kat] || kat}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded bg-gold"
                  style={{ width: `${Math.min(100, ((varde ?? 0) / 5) * 100)}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono">
                {sv(varde)}/5
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-700/25 bg-card p-4">
            <h3 className="font-semibold">Topp 3 — starkaste variablerna (motivering ordagrant)</h3>
            <ul className="mt-2 space-y-3 text-sm">
              {a.akm1.topp3Motiveringar.map((m) => (
                <li key={m.variabel}>
                  <span className="font-mono text-xs text-gold">
                    {m.variabel} · {m.namn} · {m.poang}/5 p
                  </span>
                  <p className="mt-0.5 leading-relaxed text-muted-foreground">
                    &ldquo;{m.motivering}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-700/25 bg-card p-4">
            <h3 className="font-semibold">Botten 3 — svagaste mätta variabler (motivering ordagrant)</h3>
            <ul className="mt-2 space-y-3 text-sm">
              {a.akm1.botten3Motiveringar.map((m) => (
                <li key={m.variabel}>
                  <span className="font-mono text-xs text-gold">
                    {m.variabel} · {m.namn} · {m.poang}/5 p
                  </span>
                  <p className="mt-0.5 leading-relaxed text-muted-foreground">
                    &ldquo;{m.motivering}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── AKM2-profilen (våg 57 D2) ── */}
      {a.akm2 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">AKM2-profilen</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Kompositen ur <strong>AKM2</strong> — kärnans V01–V20 med automatiskt
            aktiverade branschmoduler (V21+) och viktprofilen{" "}
            <code className="rounded bg-muted px-1">{a.akm2.viktprofil}</code> — där
            osattas vikt omfördelas istället för att straffa saknad data.
            {a.akm2.totalt !== null && (
              <>
                {" "}
                Total: <strong>{sv(a.akm2.totalt)}/100</strong>{" "}
                {a.akm2.skillnad !== null && (
                  <span
                    className={`ml-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${
                      a.akm2.skillnad > 0
                        ? "border-emerald-700/30 bg-emerald-700/10 text-emerald-700 dark:text-emerald-400"
                        : a.akm2.skillnad < 0
                          ? "border-red-900/30 bg-red-900/10 text-red-700 dark:text-red-400"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }`}
                    title="AKM2-kompositen minus korstabellens publicerade AKM1-total — hur modulerna, omfördelningen och viktprofilen flyttar bolagets total."
                  >
                    {a.akm2.skillnad > 0 ? "+" : a.akm2.skillnad < 0 ? "−" : "±"}
                    {sv(Math.abs(a.akm2.skillnad))} mot AKM1
                  </span>
                )}
                {a.akm2.band && (
                  <>
                    {" "}
                    Pedagogiskt band:{" "}
                    <strong>{AKM2_BAND_ETIKETT[a.akm2.band] ?? a.akm2.band}</strong>
                  </>
                )}
                {a.akm2.portAktiv && (
                  <span className="ml-2 rounded-full border border-red-900/40 bg-red-900/10 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                    HÅRD PORT aktiv — komposit takad
                  </span>
                )}
              </>
            )}
          </p>

          {/* Aktiva moduler — vilka, varför och deras variabelpoäng */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-gold/20 bg-card p-4">
              <h3 className="font-semibold">Aktiva moduler ({a.akm2.aktivaModuler.length})</h3>
              {a.akm2.aktivaModuler.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Inga branschmoduler lämnade poäng — modulblockets vikt har
                  omfördelats till kärnans mätta variabler.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {a.akm2.aktivaModuler.map((m) => (
                    <li key={m.modulId}>
                      <span className="font-mono text-xs text-gold">
                        {modulKortNamn(m.modulId)}
                        {m.variabler.length > 0 &&
                          ` · ${m.variabler
                            .map((v) => `${v} ${sv(m.poang[v] ?? 0)}/5`)
                            .join(" · ")}`}
                      </span>
                      <p className="mt-0.5 leading-relaxed text-muted-foreground">
                        {m.orsak}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Satta modulvariabler: {a.akm2.modulVariablerSatta.length > 0 ? a.akm2.modulVariablerSatta.join(", ") : "inga"}.
                Osatta (vikt omfördelad, aldrig straffad):{" "}
                {a.akm2.modulVariablerOsatta.length > 0 ? a.akm2.modulVariablerOsatta.join(", ") : "inga"}.
              </p>
            </div>

            {/* Dynamikpåverkan — kort och ärligt */}
            <div className="rounded-lg border border-gold/20 bg-card p-4">
              <h3 className="font-semibold">Dynamikpåverkan</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.akm2.dynamikPaverkan ??
                  "Dynamiklagret lämnade ingen notering — kompositen är en ren fundamental syntes."}
              </p>
              {a.akm2.omfordelningText && (
                <p className="mt-3 border-t border-gold/15 pt-2 text-xs leading-relaxed text-muted-foreground">
                  {a.akm2.omfordelningText}
                </p>
              )}
              {a.akm2.modellVersion && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Modellversion {a.akm2.modellVersion}.
                </p>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
            Källa: {a.akm2.kalla}. Kompositen är ett pedagogiskt research-mått —
            aldrig en köp- eller säljsignal.
          </p>
        </section>
      )}

      {/* ── AKM2-dashboarden — visuella grafer (våg 57 D3) ── */}
      {akm2 && (
        <section className="mt-10" aria-label="AKM2-dashboard med visuella grafer">
          <h2 className="font-serif text-2xl font-bold">AKM2-dashboarden — se helheten visuellt</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {akm2.kalla === "beraknad-ur-cache"
              ? "Beräknad on-demand med AKM2-kärnan (raknaAKM2) ur nyckeltalscachen: moduler aktiva per bransch, viktprofilen akm2-2026, utan dynamik (neutral degradering). Kärnans ärlighetsregler gör att osatta variabler väger om i stället för att straffa — därför kan kärnans AKM1-skugga här skilja sig från P1-summan ovan; osatt är osatt."
              : "Samma beräkning som ovan, nu som grafer: spindelnätet visar kärnans V01–V20 (efter dynamik), den streckade ringen aktiva modulvariabler (V21–V29, guldprickade), och totalen står i mitten. Hovra över en punkt för namn och poäng — klicka för att koppla markeringen mellan graf och modulstaplar. Jämförelsen AKM1 → AKM2 sker inom kärnan: dess AKM1-skugga (lager 1) kan ligga lägre än P1-summan ovan, eftersom kärnan lämnar proxy-härledda variabler osatta i stället för att gissa."}
          </p>
          <div className="mt-4">
            <Akm2Dashboard
              resultat={akm2.resultat}
              notis={
                akm2.kalla === "akm2-cache"
                  ? "Källa: data/cache/akm2-{ticker}.json (verktyg/kor-akm2-berika.mjs, våg 57 D2)."
                  : undefined
              }
              ensemble={akm3?.ensemble}
              ensembleKalla={
                akm3?.kalla === "akm3-cache"
                  ? "data/cache/akm3-{ticker}.json (portfolj-uppfoljning-cronen)"
                  : akm3
                    ? "on-demand ur nyckeltalscachen (raknaEnsemble, tre profiler)"
                    : undefined
              }
            />
          </div>
        </section>
      )}

      {/* ── Profil-ensemblen (VÅG 59 bygg-1, AKM3 steg 1) — fristående när
           AKM2-dashboarden saknas men ensemblen kan beräknas ── */}
      {!akm2 && akm3 && (
        <section className="mt-10" aria-label="AKM3 profil-ensemble">
          <h2 className="font-serif text-2xl font-bold">Profil-ensemblen — tre viktvärldar, ett band</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            AKM3 läser de tre viktprofilernas AKM2-kompositer och redovisar det
            likaviktade medlet med band och spridning — ett presentationslager
            som aldrig ersätter AKM2-kompositen eller AKM1-projektionen.
          </p>
          <div className="mt-4">
            <ProfilEnsembleVy
              ensemble={akm3.ensemble}
              kalla={
                akm3.kalla === "akm3-cache"
                  ? "data/cache/akm3-{ticker}.json (portfolj-uppfoljning-cronen)"
                  : "on-demand ur nyckeltalscachen (raknaEnsemble, tre profiler)"
              }
            />
          </div>
        </section>
      )}

      {/* ── Peer-spegeln (VÅG 59, AKM3 steg 4) — bolaget mot sitt sällskap ── */}
      {peer && (
        <section className="mt-10" aria-label="Peer-spegeln — bolaget mot sin branschgrupp">
          <h2 className="font-serif text-2xl font-bold">Peer-spegeln — bolaget mot sitt sällskap</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Den absoluta poängen säger inte vem som slår sin bransch: AAPL kan ligga under
            teknikmedianen medan Öresund bär finans. Peer-läsningen rankar bolagets AKM2-komposit
            inom sin branschgrupp — midrank-percentil, rank och avstånd till branschmedianen,
            beräknat ur korstabellens {peer.antalIGruppen === 1 ? "1 bolag" : `${peer.antalIGruppen} bolag`} per bransch.
            Ett läslager: peer påverkar aldrig poängen, portföljbygget eller banden.
          </p>

          {peer.osatt ? (
            <p className="mt-4 rounded-lg border border-dashed border-gold/40 bg-paper p-4 text-sm italic leading-relaxed text-muted-foreground">
              Peer jämförelse är osatt —{" "}
              {peer.osattOrsak === "liten-grupp"
                ? `branschgruppen har ${peer.antalIGruppen} bolag (under gränsen 5)`
                : "bolagets AKM2-komposit saknas i underlaget"}
              . Motorn gissar aldrig; osatt är ett hedervärt svar.
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-semibold">Position i {a.bransch}-gruppen</h3>
                  <p className="mt-2 font-serif text-3xl font-bold text-gold tabular">
                    {peer.peerPercentil}
                    <span className="text-base text-muted-foreground"> / 100</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Peer-percentil (midrank) · rank {peerRankText(peer)} ·{" "}
                    {peer.antalIGruppen} bolag i gruppen
                  </p>
                  {/* Stapel: bolagets komposit och branschmedianen på 0–100-skalan */}
                  <div className="relative mt-3 h-2.5 w-full rounded bg-muted" title="Bolagets AKM2-komposit (guldmärket) mot branschmedianen (grå streck) på 0–100-skalan">
                    <span
                      className="absolute inset-y-0 w-[2px] bg-muted-foreground/70"
                      style={{ left: `${Math.max(0, Math.min(100, peer.branschMedian ?? 0))}%` }}
                      title={`Branschmedian ${peer.branschMedian}`}
                    />
                    <span
                      className="absolute top-[-3px] w-[3px] rounded bg-gold"
                      style={{
                        left: `${Math.max(0, Math.min(100, peerRad?.akm2 ?? 0))}%`,
                        height: "1.125rem",
                      }}
                      title={`Bolagets AKM2 ${peerRad?.akm2 ?? "—"}`}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    AKM2 {peerRad?.akm2 ?? "—"} mot branschmedian{" "}
                    {(peer.branschMedian ?? 0).toString().replace(".", ",")} · drag{" "}
                    {peerDragText(peer.peerDrag)} poäng
                  </p>
                </div>
                <div className="rounded-lg border border-gold/20 bg-card p-4">
                  <h3 className="font-semibold">Branschdraget</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    {(peer.peerDrag ?? 0) > 0.5 &&
                      `${a.namn} ligger ${peerDragText(peer.peerDrag)} poäng över ${a.bransch}-branschens median (${(peer.branschMedian ?? 0).toString().replace(".", ",")}) — bolaget bär sitt sällskap.`}
                    {Math.abs(peer.peerDrag ?? 0) <= 0.5 &&
                      `${a.namn} ligger i nivå med ${a.bransch}-branschens median (${(peer.branschMedian ?? 0).toString().replace(".", ",")}) — varken över eller under sitt sällskap.`}
                    {(peer.peerDrag ?? 0) < -0.5 &&
                      `${a.namn} ligger ${peerDragText(peer.peerDrag)} poäng under ${a.bransch}-branschens median (${(peer.branschMedian ?? 0).toString().replace(".", ",")}) — sällskapet bär bolaget.`}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Per variabel: {peer.overMedian} över · {peer.iNiva} i nivå ·{" "}
                    {peer.underMedian} under branschmedianen
                    {peer.variabler.filter((v) => v.hallning === "osatt").length > 0
                      ? ` · ${peer.variabler.filter((v) => v.hallning === "osatt").length} osatta (jämförs aldrig)`
                      : ""}
                    .
                  </p>
                  {(peerRad?.akm2Moduler?.length ?? 0) > 0 && (
                    <p className="mt-2 border-t border-gold/15 pt-2 text-xs leading-relaxed text-muted-foreground">
                      Aktiva branschmoduler (medianerna speglar deras viktningar):{" "}
                      {(peerRad?.akm2Moduler ?? []).join(" · ")}.
                    </p>
                  )}
                </div>
              </div>

              {/* Variabeltabellen — V07 först som pedagogiskt exemplar (r3 §3.3) */}
              <div className="mt-4 overflow-x-auto rounded-lg border border-gold/20">
                <table className="w-full text-sm">
                  <thead className="bg-gold/10 text-left">
                    <tr>
                      <th className="p-3">Variabel</th>
                      <th className="p-3 text-right">Bolagets poäng</th>
                      <th className="p-3 text-right">Branschmedian</th>
                      <th className="p-3 text-center">Hållning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peer.variabler
                      .filter((v) => v.hallning !== "osatt")
                      .sort((x, y) => (x.id === "V07" ? -1 : y.id === "V07" ? 1 : x.id.localeCompare(y.id)))
                      .map((v) => (
                        <tr key={v.id} className="border-t border-gold/10">
                          <td className="p-3 font-medium">
                            <span className="font-mono text-xs text-gold">{v.id}</span>{" "}
                            {VARIABEL_META[v.id]?.namn ?? v.id}
                          </td>
                          <td className="p-3 text-right font-mono tabular">
                            {v.poang?.toString().replace(".", ",") ?? "—"}/5
                          </td>
                          <td className="p-3 text-right font-mono tabular text-muted-foreground">
                            {v.branschmedian?.toString().replace(".", ",") ?? "—"}/5
                          </td>
                          <td
                            className={`p-3 text-center font-semibold ${
                              v.hallning === "over"
                                ? "text-emerald-700 dark:text-emerald-400"
                                : v.hallning === "under"
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {PEER_HALLNING_TEXT[v.hallning]}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs italic leading-relaxed text-muted-foreground">
                V07 Bruttomarginal är raden att börja i: samma absoluta marginal ger olika
                poäng i olika branscher — det är peer-radens poäng mot branschens medianpoäng
                som förklarar varför. Trösklarna (V01–V20) är absoluta; branschmedianerna
                speglar både sällskapet och modulernas viktningar. Referens: {peer.referens} —
                ändras universet ändras peer-värdena.
              </p>
            </>
          )}
        </section>
      )}

      {/* ── Vågläget ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Vågläget — fem horisonter</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {HORIZONTER.map((h) => {
            const klass = a.vaglage?.perHorisont?.[h] || "osatt";
            const osatt = klass === "osatt";
            return (
              <span
                key={h}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  osatt
                    ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                    : "border-gold/40 bg-gold/10 text-foreground"
                }`}
              >
                {h}: {osatt ? "osatt" : klass}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a.vaglage.tolkning}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          FVag-dynamik:{" "}
          <strong>{DYN_ETIKETT[a.vaglage.fvagDynamik] || a.vaglage.fvagDynamik}</strong>
        </p>
      </section>

      {/* ── Konfluens (dolt/''ej mätt'' i MVP) ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Konfluens</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ej mätt i denna version. Konfluensradarn beräknas live (max 10 tickers
          per anrop) och lagras inte — därför är den inte del av det
          reproducerbara underlaget.{" "}
          <Link href="/konfluens" prefetch={false} className="underline hover:text-foreground">
            Mät den själv i konfluensradarn
          </Link>
          .
        </p>
      </section>

      {/* ── Värdegolvet ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Värdegolvet</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {a.golv.typ === "osatt"
            ? "Osatt. "
            : `${a.golv.typ}: marginal ${pct(a.golv.marginal ?? 0)}. `}
          {a.golv.not}
        </p>
      </section>

      {/* ── Risker ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Risker</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {a.risker.map((r, i) => (
            <li key={i} className="rounded border border-red-900/15 bg-card p-3 leading-relaxed">
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* ── FALSKIFIERING — kundkulturens signatursektion ── */}
      <section className="mt-10">
        <div className="rounded-lg border-2 border-gold/60 bg-gold/5 p-5">
          <h2 className="font-serif text-2xl font-bold">
            Vad som skulle falsifiera bilden
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Minst tre mätbara villkor med variabel-ID och tröskel — om något
            slår in är tesen förkastad, inte &quot;omförhandlad&quot;.
          </p>
          <ol className="mt-4 space-y-2 text-sm">
            {a.falsifiering.map((v, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="font-mono text-xs font-bold text-gold">{i + 1}.</span>
                <span>{v}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Fördjupa dig — interna länkar ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Fördjupa dig</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {a.lasMer.kurser.map((slug) => (
            <li key={slug}>
              <Link href={`/kurser/${slug}`} className="underline hover:text-foreground">
                Kursen {slug} — variabeln bakom profilen
              </Link>
            </li>
          ))}
          <li>
            <Link href="/kalkylator" prefetch={false} className="underline hover:text-foreground">
              Räkna själv i AKM1-kalkylatorn (V01–V20)
            </Link>
          </li>
          <li>
            <Link href="/vagfundament" prefetch={false} className="underline hover:text-foreground">
              Vågfundamentet — 20×5-matrisen bakom vågläget
            </Link>
          </li>
          {a.lasMer.bloggSlug && (
            <li>
              <Link href={`/blogg/${a.lasMer.bloggSlug}`} className="underline hover:text-foreground">
                Bloggposten om {a.namn}
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* ── Del-raden + analyskortet (VÅG 3, m8 §3b) — öppen delning, ingen
           vägg. QR:n pekar på analys-URL:en (ALDRIG startsidan). Del-raden
           ovanpå, kortet under — samma ordning som m8:s skiss. ── */}
      <DelRad
        titel={`${a.namn} (${a.ticker}) — AKM1-forskning`}
        text={`Automatisk forskningsöversikt: AKM1 ${sv(a.akm1.totalt)} av ${sv(a.akm1.maxMojligt)} p, status ${a.urval.statusEtikett}.`}
        path={`/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`}
        disclaimer
        className="mt-10"
      />
      <DelaKort
        titel={a.namn}
        rubrikrader={[
          `${a.ticker} · ${a.urval.statusEtikett}`,
          `AKM1 ${sv(a.akm1.totalt)} av ${sv(a.akm1.maxMojligt)} p (${pct(a.akm1.relativ)})`,
        ]}
        qrUrl={`${SITE_URL}/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`}
        className="mt-6"
      />

      <p className="mt-10 border-t border-gold/20 pt-4 text-xs italic text-muted-foreground">
        {a.etikett}. {a.disclaimer} Genererad av {a.genereradAv || "analysfabriken"} —
        motiveringar citeras ordagrant ur AKM1-bedömningen; &quot;osatt&quot; är
        osatt. Se också{" "}
        <Link href="/analyser" className="underline hover:text-foreground">
          grundarens fullständiga analyser
        </Link>{" "}
        och{" "}
        <Link
          href="/forskningsbiblioteket"
          className="underline hover:text-foreground"
        >
          hela biblioteket
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
