import Link from "next/link";
import type { Metadata } from "next";
import { lasAnalyser, HORIZONTER } from "@/lib/analysfabrik";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/forskningsbiblioteket",
  title: "Forskningsbiblioteket — automatiska bolagsanalyser, AKM1 | AK1A",
  description:
    "Automatiskt genererade forskningsöversikter av hela AK1A-universet: urval enligt kandidatregeln (grön/gul, täckning, AKM1-andel), vågläge, risker och mätbara falsifieringsvillkor. Forskningsunderlag — ej rådgivning.",
  keywords: [
    "forskningsbibliotek aktieanalys",
    "automatisk aktieanalys",
    "AKM1 screening",
    "bolagsanalys svenska aktier",
    "fundamental forskning",
  ],
});

/** Status-chip — grön/gul med varningsvariant för låg täckning. */
function StatusChip({ etikett }: { etikett: string }) {
  const gron = etikett.startsWith("grön");
  const varning = etikett.includes("låg täckning");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        gron
          ? "border-emerald-700/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-amber-600/40 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
      }`}
    >
      {gron ? "●" : "◐"} {etikett}
      {varning && <span aria-hidden>⚠</span>}
    </span>
  );
}

/** Svensk procenttext: 0.688 → "68,8 %". */
function pct(x: number, decimaler = 1) {
  return (x * 100).toFixed(decimaler).replace(".", ",") + " %";
}

export default function ForskningsbiblioteketPage() {
  const analyser = lasAnalyser();
  const svenska = analyser.filter((a) => a.land === "Sverige").length;

  return (
    <SeoPageShell breadcrumb={[{ name: "Forskningsbiblioteket" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Forskningsbiblioteket</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Detta är det automatiska forskningsbiblioteket: hela bolagsuniverset körs
        genom kandidatregeln — hård port mot kassatäckning (V19), krav på
        datatackning samt grön status eller gul med AKM1-poäng över 65 % av
        max — och de som passerar får en en-sidig översikt av 20
        fundamentalvariabler. Detta är ett <strong>automatiskt underlag</strong>,
        aldrig grundarens manuella analyser: de 99-sidorsrapporterna med Monte
        Carlo, scenarier och vågräkning finns i{" "}
        <Link href="/analyser" className="underline hover:text-foreground">
          rapportbanken
        </Link>
        . Forskningsunderlag — ej rådgivning.
      </p>

      {/* VÅG 3 CTA-lucka (m7 §3c): diskret rad under rubriken — berättar vad
          prenumerationen INNEHÅLLER (A9:s tillåtna form), låser aldrig det
          öppna innehållet på denna sida. */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/prenumeration"
          className="btn-marin inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm"
        >
          Forskning Plus låser AKM2-poängbasen
        </Link>
        <span className="text-xs text-muted-foreground">
          Alla översikter ovan förblir kostnadsfria — prenumerationen lägger
          till, den tar aldrig bort.
        </span>
      </div>

      <div className="mt-6 rounded-lg border border-gold/30 bg-card p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Urvalsregeln (rå, som den körs)</p>
        <code className="mt-2 block font-mono text-xs leading-relaxed">
          portV19 = false OCH (grön OCH täckning ≥ 0,60 ELLER gul OCH täckning ≥
          0,70 OCH AKM1/max ≥ 0,65)
        </code>
        <p className="mt-2">
          Gröna rader under 70 % täckning etiketteras öppet &quot;grön (låg
          täckning)&quot; — ärligheten är poängen, inte fasaden.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {analyser.length} bolag i biblioteket ({svenska} svenska), rangordnade
        efter relativ AKM1, vågdynamik och datatäckning. Varje kort länkar till
        den fullständiga översikten med motiveringar ordagrant ur bedömningen.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {analyser.map((a) => {
          const klassadeHz = HORIZONTER.filter(
            (h) => a.vaglage?.perHorisont?.[h] && a.vaglage.perHorisont[h] !== "osatt",
          ).length;
          const DYN: Record<string, string> = {
            forbattras: "förbättras",
            stabilt: "stabilt",
            forsvamras: "försvagas",
            osatt: "osatt",
          };
          return (
            <Link
              key={a.ticker}
              href={`/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`}
              className="block rounded-lg border border-gold/20 bg-card p-6 hover:border-gold/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold">
                    {a.land || "—"} · {a.bransch}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold">{a.namn}</h2>
                  <p className="text-sm text-muted-foreground">{a.ticker}</p>
                </div>
                <StatusChip etikett={a.urval?.statusEtikett || a.urval?.status || "osatt"} />
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded border border-gold/10 bg-background/50 p-2">
                  <dt className="text-xs text-muted-foreground">AKM1</dt>
                  <dd className="font-semibold">
                    {a.akm1?.totalt?.toString().replace(".", ",")}/
                    {a.akm1?.maxMojligt?.toString().replace(".", ",")}
                  </dd>
                </div>
                <div className="rounded border border-gold/10 bg-background/50 p-2">
                  <dt className="text-xs text-muted-foreground">AV MAX</dt>
                  <dd className="font-semibold">{pct(a.akm1?.relativ ?? 0)}</dd>
                </div>
                <div className="rounded border border-gold/10 bg-background/50 p-2">
                  <dt className="text-xs text-muted-foreground">TÄCKNING</dt>
                  <dd className="font-semibold">{pct(a.urval?.datatackning ?? 0)}</dd>
                </div>
              </dl>

              <p className="mt-3 text-sm text-muted-foreground">
                Vågläge: {DYN[a.vaglage?.fvagDynamik] || a.vaglage?.fvagDynamik || "osatt"}
                {klassadeHz === 0
                  ? " · inga horisonter klassade (osatt är osatt)"
                  : ` · ${klassadeHz}/5 horisonter klassade`}
              </p>

              {a.urval?.varning && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  ⚠ {a.urval.varning}
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Version {a.versionsdatum} · {a.akm1?.antalOsatta ?? 20} av 20
                variabler osatta ·{" "}
                {a.lasMer?.bloggSlug ? (
                  <>
                    <Link
                      href={`/blogg/${a.lasMer.bloggSlug}`}
                      className="underline hover:text-foreground"
                    >
                      bloggpost finns
                    </Link>{" "}
                    ·{" "}
                  </>
                ) : null}
                Läs översikten →
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Biblioteket omgenereras när korstabellen levereras om. Saknar du ett
        bolag? Då föll det antingen på porten (kassatäckning), täckningen eller
        AKM1-tröskeln — regeln är deterministisk och redovisad ovan.{" "}
        <em>Automatiskt forskningsunderlag — pedagogisk forskning, aldrig
        investeringsrådgivning (lagen 2007:528).</em>
      </p>
    </SeoPageShell>
  );
}
