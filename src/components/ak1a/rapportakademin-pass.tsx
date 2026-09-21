"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MedlemInloggning } from "@/components/ak1a/medlem-inloggning";

/**
 * RAPPORTAKADEMIN-PASS — det vertikala snittets A-Ö-flöde (styrelse-
 * muacmgtw-qizth0): eleven bedömer FÖRST, expertläsningen exponeras först
 * efter att servern lagrat bedömningen. Facit och experttext hämtas ALDRIG
 * före inlåmning — de lever bara i POST-svaret.
 *
 * Vyor: laddar → inloggning (401) | fas2-inbjudan (403) | art 13-kvittering
 * → sektion för sektion (bedöm → resultat + expertläsning) → rubrik.
 *
 * Pedagogik (forskning-2026-09-20): produktivt misslyckande + kognitivt
 * lärlingsskap + deliberate practice. Copy: så läser man en rapport —
 * ALDRIG råd (2007:528).
 */

type Lage = "laddar" | "fel" | "inloggning" | "fas2" | "art13" | "pass" | "rubrik";

type OffentligSektion = {
  index: number;
  rubrik: string;
  akm: { variabel: string; namn: string; kursSlug: string };
  kalla: string[];
  fraga: string;
  enhet: string;
};

type OffentligtPass = {
  slug: string;
  titel: string;
  bolag: string;
  ticker: string;
  bransch: string;
  verifierad: string;
  intro: string[];
  sektioner: OffentligSektion[];
};

type Art13Avsnitt = { rubrik: string; text: string };

type SvarsRad = {
  elevensSvar: number;
  ratt: boolean;
  rattSvar: number;
  poang: number;
  felMarginal: number;
  expertlasning: string[];
};

const PASS_SLUG = "abb-ar-2025";

function lasSvar(res: Response): Promise<Record<string, unknown> | null> {
  return res
    .json()
    .then((kropp) =>
      kropp && typeof kropp === "object" && !Array.isArray(kropp)
        ? (kropp as Record<string, unknown>)
        : null
    )
    .catch(() => null);
}

export function RapportakademinPass() {
  const [lage, setLage] = useState<Lage>("laddar");
  const [skal, setSkal] = useState<OffentligtPass | null>(null);
  const [maxPoang, setMaxPoang] = useState<number>(0);
  const [art13Info, setArt13Info] = useState<Art13Avsnitt[]>([]);
  const [sektionIndex, setSektionIndex] = useState<number>(0);
  const [svar, setSvar] = useState<Record<number, SvarsRad>>({});
  const [inmatning, setInmatning] = useState<string>("");
  const [skickar, setSkickar] = useState<boolean>(false);
  const [felText, setFelText] = useState<string>("");

  const hamtaPass = useCallback(async () => {
    setFelText("");
    try {
      const res = await fetch(`/api/rapportakademin/pass?slug=${encodeURIComponent(PASS_SLUG)}`, {
        cache: "no-store",
      });
      const data = await lasSvar(res);
      if (res.status === 401) {
        setLage("inloggning");
        return;
      }
      if (res.status === 403) {
        setLage("fas2");
        return;
      }
      if (!res.ok || data === null) {
        setLage("fel");
        return;
      }
      const pass = (data.pass ?? null) as OffentligtPass | null;
      if (pass === null) {
        setLage("fel");
        return;
      }
      setSkal(pass);
      setMaxPoang(typeof data.maxPoang === "number" ? data.maxPoang : pass.sektioner.length * 5);
      if (data.art13Kvitto === true) {
        setLage("pass");
      } else {
        const info = Array.isArray(data.art13Info) ? (data.art13Info as Art13Avsnitt[]) : [];
        setArt13Info(info);
        setLage("art13");
      }
    } catch {
      setLage("fel");
    }
  }, []);

  useEffect(() => {
    hamtaPass();
  }, [hamtaPass]);

  const kvitteraArt13 = async () => {
    setSkickar(true);
    setFelText("");
    try {
      const res = await fetch("/api/rapportakademin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "art13" }),
      });
      if (res.ok) {
        setLage("pass");
      } else {
        setFelText("Kvittot kunde inte sparas — försök igen om en stund.");
      }
    } catch {
      setFelText("Nätverksfel — försök igen om en stund.");
    } finally {
      setSkickar(false);
    }
  };

  const lamnaBedomning = async () => {
    if (skal === null) return;
    const talet = Number(inmatning.replace(",", "."));
    if (!Number.isFinite(talet)) {
      setFelText("Skriv din bedömning som ett tal (punkt eller komma som decimaltecken).");
      return;
    }
    setSkickar(true);
    setFelText("");
    try {
      const res = await fetch("/api/rapportakademin/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: skal.slug, sektionIndex, elevensSvar: talet }),
      });
      const data = await lasSvar(res);
      if (!res.ok || data === null) {
        setFelText(
          typeof data?.fel === "string" ? data.fel : "Bedömningen kunde inte hanteras — försök igen."
        );
        return;
      }
      const rad: SvarsRad = {
        elevensSvar: talet,
        ratt: data.ratt === true,
        rattSvar: typeof data.rattSvar === "number" ? data.rattSvar : 0,
        poang: typeof data.poang === "number" ? data.poang : 0,
        felMarginal: typeof data.felMarginal === "number" ? data.felMarginal : 0,
        expertlasning: Array.isArray(data.expertlasning) ? (data.expertlasning as string[]) : [],
      };
      setSvar((forra) => ({ ...forra, [sektionIndex]: rad }));
    } catch {
      setFelText("Nätverksfel — bedömningen sparades inte. Försök igen.");
    } finally {
      setSkickar(false);
    }
  };

  const gaVidare = () => {
    if (skal === null) return;
    setInmatning("");
    setFelText("");
    if (sektionIndex + 1 < skal.sektioner.length) {
      setSektionIndex(sektionIndex + 1);
    } else {
      setLage("rubrik");
    }
  };

  const totalPoang: number = Object.values(svar).reduce(
    (summa, rad) => summa + rad.poang,
    0
  );

  // ── Vyor ────────────────────────────────────────────────────────────────

  if (lage === "laddar") {
    return (
      <p className="mt-6 text-muted-foreground" role="status">
        Hämtar passet…
      </p>
    );
  }

  if (lage === "fel") {
    return (
      <div className="mt-6">
        <p className="text-muted-foreground">
          Passet kunde inte hämtas just nu. Ladda om sidan om en liten stund.
        </p>
        <Button className="mt-4" onClick={() => { setLage("laddar"); hamtaPass(); }}>
          Försök igen
        </Button>
      </div>
    );
  }

  if (lage === "inloggning") {
    return (
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-bold">Logga in för att öva</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Rapportakademin är en medlemsövning: dina bedömningar sparas på ditt
            konto så att repetitionen kan anpassas till just dina fel. Logga in
            eller skapa ett gratiskonto här — passet självt är en Fas 2-övning.
          </p>
        </div>
        <MedlemInloggning />
      </div>
    );
  }

  if (lage === "fas2") {
    return (
      <div className="mt-6 max-w-2xl">
        <h2 className="font-serif text-2xl font-bold">En del av Fas 2</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Rapportakademin hör hemma i Fas 2 — den snabba fundamentala vägen till
          oberoende analytiker. Här övar du på riktiga årsredovisningar, sektion
          för sektion, med expertens läsning som följeslagare. Välkommen vidare
          när du är redo.
        </p>
        <Link
          href="/fas2-ansok"
          className="mt-5 inline-flex h-11 items-center rounded-md bg-gold px-6 font-medium text-background hover:bg-gold/90"
        >
          Läs mer om Fas 2
        </Link>
      </div>
    );
  }

  if (lage === "art13") {
    return (
      <div className="mt-6 max-w-3xl">
        <h2 className="font-serif text-2xl font-bold">Innan du börjar — om dina data</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Din första övning i Rapportakademin. Läs igenom informationen nedan —
          den visas här eftersom vi kommer att spara dina övningsresultat.
        </p>
        <div className="mt-6 space-y-4">
          {art13Info.map((avsnitt) => (
            <div key={avsnitt.rubrik} className="rounded-lg border bg-card p-5">
              <h3 className="font-semibold">{avsnitt.rubrik}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{avsnitt.text}</p>
            </div>
          ))}
        </div>
        {felText !== "" && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {felText}
          </p>
        )}
        <Button className="mt-6" onClick={kvitteraArt13} disabled={skickar}>
          {skickar ? "Sparar…" : "Jag förstår — börja övningen"}
        </Button>
      </div>
    );
  }

  if (lage === "rubrik" && skal !== null) {
    const antalRatta = Object.values(svar).filter((rad) => rad.ratt).length;
    return (
      <div className="mt-6 max-w-3xl">
        <h2 className="font-serif text-3xl font-bold">Din rubrik — {skal.titel}</h2>
        <div className="mt-6 rounded-lg border bg-card p-6">
          <p className="text-4xl font-bold">
            {totalPoang} <span className="text-xl text-muted-foreground">/ {maxPoang} poäng</span>
          </p>
          <p className="mt-2 text-muted-foreground">
            {antalRatta} av {skal.sektioner.length} sektioner inom tolerans.
          </p>
          <ul className="mt-5 space-y-2">
            {skal.sektioner.map((s) => {
              const rad = svar[s.index];
              return (
                <li key={s.index} className="flex items-baseline justify-between gap-4 border-t pt-2">
                  <span className="text-muted-foreground">{s.rubrik}</span>
                  <span className="font-semibold">
                    {rad ? `${rad.poang}/5` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Sektioner du missade kommer tillbaka som repetitionsövningar med några
          dagars mellanrum — mellanrum är själva mekanismen som bygger det
          långsiktiga minnet. Din bedöm-först-ordning är nu bevisad: varje
          expertläsning du läste släpptes fram först efter din egen låsta
          bedömning.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Pedagogisk utbildning i att läsa årsredovisningar — aldrig
          investeringsråd eller en uppmaning att köpa eller sälja något.
        </p>
      </div>
    );
  }

  if (skal === null) {
    return null;
  }

  const sektion = skal.sektioner[sektionIndex];
  const rad = svar[sektionIndex] ?? null;

  return (
    <div className="mt-6 max-w-3xl">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Sektion {sektionIndex + 1} av {skal.sektioner.length} · {skal.bolag} ({skal.ticker})
        </p>
        <p className="text-sm text-muted-foreground">{totalPoang} poäng hittills</p>
      </div>

      {sektionIndex === 0 && Object.keys(svar).length === 0 && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-5">
          {skal.intro.map((stycke) => (
            <p key={stycke.slice(0, 40)} className="leading-relaxed text-muted-foreground">
              {stycke}
            </p>
          ))}
        </div>
      )}

      <h2 className="mt-6 font-serif text-2xl font-bold">{sektion.rubrik}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        AKM1 {sektion.akm.variabel} · {sektion.akm.namn} —{" "}
        <Link href={`/kurser/${sektion.akm.kursSlug}`} className="underline">
          gå motsvarande mikro-lektion
        </Link>
      </p>

      <div className="mt-5 rounded-lg border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ur rapporten
        </h3>
        <ul className="mt-3 space-y-2">
          {sektion.kalla.map((kallrad) => (
            <li key={kallrad.slice(0, 40)} className="leading-relaxed">
              {kallrad}
            </li>
          ))}
        </ul>
      </div>

      {rad === null ? (
        <div className="mt-6">
          <label htmlFor="bedomning" className="block font-medium">
            {sektion.fraga}
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Input
              id="bedomning"
              type="text"
              inputMode="decimal"
              className="w-40 text-lg"
              placeholder="Din bedömning"
              value={inmatning}
              onChange={(e) => setInmatning(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !skickar) lamnaBedomning();
              }}
            />
            <span className="text-muted-foreground">{sektion.enhet}</span>
            <Button onClick={lamnaBedomning} disabled={skickar}>
              {skickar ? "Låser…" : "Lås din bedömning"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Din bedömning sparas först — expertläsningen släpps fram först
            därefter. Att gissa fel är en del av metoden.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-lg border bg-card p-5">
            <p className="font-semibold">
              {rad.ratt
                ? "Inom tolerans — 5 poäng"
                : rad.poang > 0
                  ? "Nära — 3 poäng"
                  : "Utanför tolerans — 0 poäng"}
            </p>
            <p className="mt-2 text-muted-foreground">
              Du bedömde {rad.elevensSvar.toLocaleString("sv-SE")} {sektion.enhet} — expertens
              svar: {rad.rattSvar.toLocaleString("sv-SE")} {sektion.enhet}.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-gold bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Expertens läsning
            </h3>
            <div className="mt-3 space-y-3">
              {rad.expertlasning.map((stycke) => (
                <p key={stycke.slice(0, 40)} className="leading-relaxed">
                  {stycke}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {felText !== "" && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {felText}
        </p>
      )}

      {rad !== null && (
        <Button className="mt-6" onClick={gaVidare}>
          {sektionIndex + 1 < skal.sektioner.length ? "Nästa sektion" : "Se din rubrik"}
        </Button>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Pedagogisk utbildning i att läsa årsredovisningar — aldrig
        investeringsråd eller en uppmaning att köpa eller sälja något.
      </p>
    </div>
  );
}
