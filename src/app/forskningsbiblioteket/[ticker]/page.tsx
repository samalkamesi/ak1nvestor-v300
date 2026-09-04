import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { lasAnalyser, getAnalys, HORIZONTER } from "@/lib/analysfabrik";
import { hamtaAkm2ForAnalys } from "@/lib/akm2-onsdemand";
import { modulKortNamn } from "@/lib/akm2-visningsdata";
import { pageMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Akm2Dashboard } from "@/components/ak1a/akm2-dashboard";

export const dynamic = "force-static";

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

  return (
    <SeoPageShell
      breadcrumb={[
        { name: "Forskningsbiblioteket", href: "/forskningsbiblioteket" },
        { name: a.namn },
      ]}
      wide
    >
      <JsonLd data={jsonLd} />

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
            />
          </div>
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
          <Link href="/konfluens" className="underline hover:text-foreground">
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
            <Link href="/kalkylator" className="underline hover:text-foreground">
              Räkna själv i AKM1-kalkylatorn (V01–V20)
            </Link>
          </li>
          <li>
            <Link href="/vagfundament" className="underline hover:text-foreground">
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
