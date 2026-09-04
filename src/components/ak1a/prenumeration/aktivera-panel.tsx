"use client";

/**
 * AKTIVERA-PANEL — köpflödes-stomme för /prenumeration.
 *
 * Betallösningen är inte på plats ännu (moderagenten kopplar betalpartner
 * senare). Därför:
 *  1. Eleven väljer nivå + period, ser prisberäkningen (med eventuell
 *     Fas 2/Fas 3-rabatt ur priser.json, känns igen automatiskt via
 *     member-local) och lägger namn/e-post (förifyllt från medlemskapet).
 *  2. "Begär aktivering" sparar intentionen i localStorage under
 *     "ak1a-prenumeration-intention-v1" (se src/lib/prenumeration.ts).
 *  3. Bekräftelsen visar nästa steg: ett färdigifyllt e-postflöde till
 *     info@ak1nvestor.com (mailto med nivå, period och pris) — mänsklig
 *     aktivering tills betalflödet finns.
 *
 * ADMIN-NOTIFIERING: sker INTE via signal-bussen — publiceraSignal är
 * server-side och admin-signaler kräver ADMIN_PASSWORD i /api/signal, ett
 * lösenord som aldrig får ligga i klientkod. LocalStorage + e-postflöde är
 * det ärliga stommen (dokumenterat i src/lib/prenumeration.ts).
 *
 * KONVERTERINGS-INTENTION (MARKNADS-BESLUT VÅG 1b, korrigering av m7 rek 2):
 * varje aktiveringsbegäran postar ALLTID — även utan nyhetsbrevscheck — ett
 * ANONYMISERAT event till POST /api/konvertering/intention med endast
 * {nivaNamn, period, pris}: ingen e-post, inget namn, ingen persondata.
 * Eventet räknas aggregerat i adminens konverteringsvy (system_events
 * type=konvertering_intention, dokumenterat i /transparens). Fire-and-forget
 * — ett misslyckat anrop påverkar ALDRIG aktiveringsbegäran. Med
 * nyhetsbrevschecken ikryssad är /api/email-flödet orört (mejl kräver
 * mottagare; kön postas aldrig utan e-post).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lasMedlem } from "@/lib/member-local";
import {
  useFasRabatt,
  formateraKr,
  rabatteratPris,
  manaderGratis,
  lasPrenumerationIntention,
  sparaPrenumerationIntention,
  type PrenusbrevStatus,
  type PrenumerationIntention,
  type PrenumerationNiva,
  type RabattFasInfo,
} from "@/lib/prenumeration";

const EPOST = "info@ak1nvestor.com";

type Period = "manad" | "ar";

/**
 * Skicka nyhetsbrevs-intentionen till /api/email (typ=prenumeration-intention).
 * Köas i system_events tills en mejl-leverantör konfigureras (VÅG 50) —
 * misslyckas anropet påverkar det ALDRIG själva aktiveringsbegäran.
 */
/**
 * Posta ALLTID ett anonymiserat intention-event till /api/konvertering/intention
 * — endast {nivaNamn, period, pris}, ingen persondata (A4-korrigeringen).
 * Fire-and-forget: felet sväljs tyst, begäran påverkas aldrig.
 */
function postaAnonymIntention(arg: { nivaNamn: string; period: Period; pris: string }): void {
  void fetch("/api/konvertering/intention", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nivaNamn: arg.nivaNamn,
      period: arg.period,
      pris: arg.pris,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => {
    /* tyst — konverteringsräkningen får leva utan denna rad */
  });
}

async function skickaNyhetsbrevsIntention(arg: {
  epost: string;
  namn: string;
  nivaNamn: string;
  period: Period;
  pris: string;
}): Promise<PrenusbrevStatus> {
  try {
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: arg.epost,
        typ: "prenumeration-intention",
        data: {
          namn: arg.namn,
          nivaNamn: arg.nivaNamn,
          period: arg.period,
          pris: arg.pris,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "fel";
    const body = (await res.json()) as { ok?: boolean; skickat?: boolean; status?: string };
    if (body.ok !== true) return "fel";
    return body.skickat ? "skickad" : "köad";
  } catch {
    return "fel";
  }
}

export function AktiveraPanel({
  nivaer,
  rabattFas,
}: {
  nivaer: PrenumerationNiva[];
  rabattFas: RabattFasInfo;
}) {
  const mittId = nivaer[1]?.id ?? nivaer[0]?.id ?? "";
  const [nivaId, setNivaId] = useState(mittId);
  const [period, setPeriod] = useState<Period>("manad");
  const [namn, setNamn] = useState("");
  const [epost, setEpost] = useState("");
  const [fel, setFel] = useState("");
  const [sparad, setSparad] = useState<PrenumerationIntention | null>(null);
  const [tidigare, setTidigare] = useState<PrenumerationIntention | null>(null);
  // Frivillig nyhetsbrevscheck (VÅG 50) — köas via /api/email tills leverantör finns.
  const [nyhetsbrev, setNyhetsbrev] = useState(false);
  const [brevStatus, setBrevStatus] = useState<PrenusbrevStatus>("");

  const { hydrerad, fasStatus, harRabatt, rabatt, rabattProcent } = useFasRabatt(rabattFas);

  // Förifyll namn/e-post från medlemskapet + påminn om tidigare begäran.
  useEffect(() => {
    const m = lasMedlem();
    if (m) {
      setNamn((n) => n || m.namn || "");
      setEpost((e) => e || m.email);
    }
    setTidigare(lasPrenumerationIntention());
  }, []);

  // Nivå-kortens "Aktivera den här nivån →" väljer här + scrollar till panelen.
  useEffect(() => {
    const lyssna = (e: Event) => {
      const id = (e as CustomEvent<{ nivaId?: string }>).detail?.nivaId;
      if (id && nivaer.some((n) => n.id === id)) setNivaId(id);
    };
    window.addEventListener("ak1a:valj-prenumeration", lyssna);
    return () => window.removeEventListener("ak1a:valj-prenumeration", lyssna);
  }, [nivaer]);

  const vald = useMemo(
    () => nivaer.find((n) => n.id === nivaId) ?? nivaer[0],
    [nivaer, nivaId]
  );

  const ordinarie = vald ? (period === "manad" ? vald.prisManad : vald.prisAr) : 0;
  const rabatterat = rabatteratPris(ordinarie, harRabatt ? rabatt : 0);
  const periodText = period === "manad" ? "per månad" : "per år";

  const begar = async () => {
    setFel("");
    if (!vald) {
      setFel("Välj en nivå först.");
      return;
    }
    if (epost.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.trim())) {
      setFel("E-postadressen ser inte giltig ut — kontrollera den.");
      return;
    }
    if (nyhetsbrev && !epost.trim()) {
      setFel("Nyhetsbrevet behöver en e-postadress — fyll i raden ovan.");
      return;
    }
    const intention: PrenumerationIntention = {
      version: 1,
      nivaId: vald.id,
      nivaNamn: vald.namn,
      period,
      prisOrdinarie: ordinarie,
      prisRabatterat: harRabatt ? rabatterat : null,
      rabattAndel: harRabatt ? rabatt : 0,
      fasStatus,
      ...(namn.trim() ? { namn: namn.trim() } : {}),
      ...(epost.trim() ? { epost: epost.trim() } : {}),
      ...(nyhetsbrev ? { nyhetsbrev: true } : {}),
      skapad: new Date().toISOString(),
    };
    const ok = sparaPrenumerationIntention(intention);
    if (!ok) {
      setFel(
        "Kunde inte spara begäran i din webbläsare (privat läge?). Skicka ett mejl till " +
          EPOST +
          " i stället."
      );
      return;
    }

    // Konverterings-intention (ALLTID, VÅG 1b): anonymiserat event — endast
    // nivå/period/pris, ingen persondata — för den aggregerade tratten.
    postaAnonymIntention({
      nivaNamn: vald.namn,
      period,
      pris: `${harRabatt ? rabatterat : ordinarie} kr ${period === "manad" ? "per månad" : "per år"}`,
    });

    // Frivillig nyhetsbrevscheck: intentionen till kön via /api/email —
    // ett misslyckat anrop påverkar ALDRIG aktiveringsbegäran ovan.
      if (nyhetsbrev && epost.trim()) {
      setBrevStatus("köad"); // optimistisk interim-status medan anropet går
      const status = await skickaNyhetsbrevsIntention({
        epost: epost.trim(),
        namn: namn.trim(),
        nivaNamn: vald.namn,
        period,
        pris: `${harRabatt ? rabatterat : ordinarie} kr ${period === "manad" ? "per månad" : "per år"}`,
      });
      setBrevStatus(status);
    } else {
      setBrevStatus("");
    }

    setSparad(intention);
  };

  const mailto = useMemo(() => {
    if (!sparad) return "";
    const prisrad = sparad.prisRabatterat !== null
      ? `${sparad.prisRabatterat} kr ${sparad.period === "manad" ? "per månad" : "per år"} (ordinarie ${sparad.prisOrdinarie} kr, Fas ${sparad.fasStatus === "fas3" ? "3" : "2"}-rabatt)`
      : `${sparad.prisOrdinarie} kr ${sparad.period === "manad" ? "per månad" : "per år"}`;
    const kropp = [
      "Hej AK1A,",
      "",
      `Jag vill aktivera: ${sparad.nivaNamn} (${sparad.period === "manad" ? "månadsvis" : "årsvis"})`,
      `Pris: ${prisrad}`,
      namn.trim() ? `Namn: ${namn.trim()}` : "",
      epost.trim() ? `E-post: ${epost.trim()}` : "",
      "",
      "(Begäran sparad i min webbläsare " + sparad.skapad.slice(0, 10) + ".)",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${EPOST}?subject=${encodeURIComponent("Aktiveringsbegäran — " + sparad.nivaNamn)}&body=${encodeURIComponent(kropp)}`;
  }, [sparad, namn, epost]);

  // ── Bekräftelseläge: intentionen sparad, nästa steg visas ─────────────────
  if (sparad) {
    return (
      <div className="rounded-2xl border-2 border-gold bg-card p-8 text-center shadow-lg sm:p-10">
        <p className="text-4xl" aria-hidden="true">
          ✅
        </p>
        <h3 className="mt-3 font-serif text-2xl font-bold">Aktiveringsbegäran sparad</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Tack{namn.trim() ? `, ${namn.trim()}` : ""}! Din begäran på{" "}
          <strong className="text-foreground">{sparad.nivaNamn}</strong>{" "}
          ({sparad.period === "manad" ? "månadsvis" : "årsvis"}) är sparad i din webbläsare
          {sparad.prisRabatterat !== null
            ? ` med ditt Fas ${sparad.fasStatus === "fas3" ? "3" : "2"}-pris (${sparad.prisRabatterat} kr ${sparad.period === "manad" ? "per månad" : "per år"})`
            : ""}
          . Betalflödet är inte öppet ännu — aktivering sker via e-post.
        </p>

        <div className="mx-auto mt-6 max-w-lg space-y-3 text-left">
          {sparad.nyhetsbrev && (
            <div className="rounded-lg border border-gold/40 bg-paper p-4 text-sm">
              <p className="font-semibold text-foreground">Nyhetsbrevet:</p>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">
                {brevStatus === "skickad"
                  ? "Din plats i morgon-briefingen är registrerad och en bekräftelse är på väg till din inkorg."
                  : brevStatus === "fel"
                    ? "Din nyhetsbrevsönskan kunde inte registreras just nu — mejla oss så lägger vi till dig manuellt."
                    : "Din plats i morgon-briefingen är sparad i utskickskön — första brevet kommer så snart utskicken är igång (ingen leverantör är kopplad ännu)."}
              </p>
            </div>
          )}
          <div className="rounded-lg border border-gold/30 bg-paper p-4 text-sm">
            <p className="font-semibold text-foreground">Nästa steg:</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                Mejla oss — knappen nedan öppnar ditt e-postprogram med allt ifyllt.
              </li>
              <li>
                Vi återkommer med aktivering, aktuella betalningsuppgifter och start.
              </li>
              <li>
                Läs gärna{" "}
                <Link href="/villkor#sektion-6" className="underline hover:text-foreground">
                  villkorens ångerrätts-sektion
                </Link>{" "}
                innan du börjar — digitalt innehåll levereras direkt.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={mailto}
            className="rounded-md bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Mejla {EPOST} med begäran
          </a>
          <button
            type="button"
            onClick={() => setSparad(null)}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Ändra min begäran
          </button>
        </div>
      </div>
    );
  }

  // ── Formulärläge ───────────────────────────────────────────────────────────
  return (
    <div id="aktivera" className="scroll-mt-24 rounded-2xl border-2 border-gold/60 bg-card p-7 shadow-lg sm:p-9">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold">AKTIVERING · STEG 1 AV 2</p>
      <h3 className="mt-3 font-serif text-2xl font-bold">Begär aktivering</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Välj nivå och period — sedan skickar du begäran. Ingen betalning sker här:
        vi återkommer per e-post med aktivering och betalningsuppgifter.
      </p>

      {tidigare && (
        <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Sparad begäran hittad.</strong> Vi har en
          tidigare aktiveringsbegäran i den här webbläsaren ({tidigare.nivaNamn},{" "}
          {tidigare.period === "manad" ? "månadsvis" : "årsvis"}, sparat{" "}
          {tidigare.skapad.slice(0, 10)}) — du kan skriva över den nedan.
        </div>
      )}

      {/* Nivå-val */}
      <fieldset className="mt-6">
        <legend className="mb-2 text-xs font-semibold text-foreground">Välj nivå</legend>
        <div className="space-y-2">
          {nivaer.map((n) => {
            const aktivtVal = n.id === nivaId;
            const pris = period === "manad" ? n.prisManad : n.prisAr;
            const efterRabatt = rabatteratPris(pris, harRabatt ? rabatt : 0);
            return (
              <label
                key={n.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ${
                  aktivtVal
                    ? "border-gold bg-gold/10"
                    : "border-gold/25 bg-paper hover:border-gold/50"
                }`}
              >
                <input
                  type="radio"
                  name="prenumeration-niva"
                  value={n.id}
                  checked={aktivtVal}
                  onChange={() => setNivaId(n.id)}
                  className="h-4 w-4 accent-gold"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">{n.namn}</span>
                  <span className="block text-xs text-muted-foreground">
                    {hydrerad && harRabatt ? (
                      <>
                        <span className="line-through">{formateraKr(pris)}</span>{" "}
                        <strong className="text-foreground">{formateraKr(efterRabatt)}</strong>{" "}
                        {periodText}
                      </>
                    ) : (
                      <>
                        {formateraKr(pris)} {periodText}
                      </>
                    )}
                  </span>
                </span>
                {hydrerad && harRabatt && (
                  <span className="shrink-0 rounded-full border border-bull/40 bg-bull/10 px-2 py-0.5 text-[10px] font-semibold text-bull">
                    −{rabattProcent} %
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Period-val */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold text-foreground">Betalningsperiod</p>
        <div className="inline-flex rounded-lg border border-gold/30 bg-paper p-1" role="group" aria-label="Betalningsperiod">
          {(
            [
              { id: "manad", label: "Månadsvis" },
              { id: "ar", label: "Årsvis" },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              aria-pressed={period === p.id}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                period === p.id
                  ? "bg-gold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "ar" && vald && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {manaderGratis(vald.prisManad, vald.prisAr) !== null
              ? `Årspriset motsvarar ${12 - (manaderGratis(vald.prisManad, vald.prisAr) ?? 0)} månader — ${manaderGratis(vald.prisManad, vald.prisAr)} gratis. `
              : "Årspriset är rabatterat mot månadspriset. "}
            Du binder dig inte: förnyelse sker bara efter ditt aktiva val (
            <Link href="/villkor#sektion-5" className="underline hover:text-foreground">
              villkoren, sektion 5
            </Link>
            ).
          </p>
        )}
      </div>

      {/* Kontakt — förifylls från medlemskapet när det finns */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pren-namn" className="mb-1.5 block text-xs font-semibold text-foreground">
            Namn
          </label>
          <Input
            id="pren-namn"
            value={namn}
            onChange={(e) => setNamn(e.target.value)}
            placeholder="Ditt namn"
            maxLength={80}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="pren-epost" className="mb-1.5 block text-xs font-semibold text-foreground">
            E-post
          </label>
          <Input
            id="pren-epost"
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="din@epost.se"
            maxLength={160}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Frivillig nyhetsbrevscheck (VÅG 50) — morgon-briefingen + forskning */}
      <label
        htmlFor="pren-nyhetsbrev"
        className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gold/25 bg-paper p-3.5 transition-colors hover:border-gold/50"
      >
        <input
          id="pren-nyhetsbrev"
          type="checkbox"
          checked={nyhetsbrev}
          onChange={(e) => setNyhetsbrev(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-gold"
        />
        <span className="text-sm leading-relaxed">
          <span className="font-semibold text-foreground">
            Få morgon-briefingen + forskningsuppdateringar per mejl
          </span>
          <span className="block text-xs text-muted-foreground">
            Frivilligt och kostnadsfritt — en kort, saklig morgonhälsning (vågkartan,
            dagens aktie, ett femminuterspass) och större forskningsuppdateringar.
            Avsluta när du vill genom att svara på ett brev. Pedagogisk analys —
            aldrig investeringsråd.
          </span>
        </span>
      </label>

      {/* Pris-sammanfattning */}
      <div className="mt-6 rounded-lg border border-gold/30 bg-paper p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {vald?.namn} · {period === "manad" ? "månadsvis" : "årsvis"}
          </span>
          <span className="flex items-baseline gap-2">
            {hydrerad && harRabatt && (
              <>
                <span className="text-muted-foreground line-through">
                  {formateraKr(ordinarie)}
                </span>
                <span className="rounded-full border border-bull/40 bg-bull/10 px-2 py-0.5 text-[10px] font-semibold text-bull">
                  Fas {fasStatus === "fas3" ? "3" : "2"} −{rabattProcent} %
                </span>
              </>
            )}
            <span className="font-serif text-2xl font-black text-gold">
              {formateraKr(harRabatt ? rabatterat : ordinarie)}
            </span>
            <span className="text-xs text-muted-foreground">{periodText}</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {hydrerad && harRabatt
            ? "Din Fas-status känns igen automatiskt — rabatten gäller för alltid, på alla nivåer."
            : `Ingen Fas-status hittades i den här webbläsaren. Är du Fas 2- eller Fas 3-elev? Rabatten (${rabattProcent} %) syns automatiskt när du är inloggad med din elevstatus.`}
        </p>
      </div>

      <Button
        className="mt-5 w-full bg-gold font-bold text-primary-foreground hover:bg-gold/90"
        onClick={() => void begar()}
      >
        Begär aktivering
      </Button>
      {fel && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {fel}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Begäran sparas lokalt i din webbläsare och blir ett färdigifyllt mejl till{" "}
        {EPOST} — inga kortuppgifter efterfrågas här. Samtidigt räknas en
        anonymiserad intention (endast nivå, period och pris — inget om dig) för
        vår konverteringsstatistik, se{" "}
        <Link href="/transparens" className="underline hover:text-foreground">
          transparensregistret
        </Link>
        . Aktivering, pris och eventuellt
        samtycke till omedelbar digital leverans (ångerrätten, se{" "}
        <Link href="/villkor#sektion-6" className="underline hover:text-foreground">
          villkoren sektion 6
        </Link>
        ) bekräftas i mejlväxlingen. AK1A lämnar aldrig investeringsråd — se{" "}
        <Link href="/finansiell-policy" className="underline hover:text-foreground">
          finansiell policy
        </Link>
        .
      </p>
    </div>
  );
}
