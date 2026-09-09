"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSprak } from "@/components/ak1a/sprak-leverantor";
import { harLokalProgress, importeraLokalProgress, lasMedlemProgressKlient } from "@/lib/medlem-progress-klient";

/**
 * MIGRERA-PROGRESS-BANNER (våg 87 §A.3 — mjuk migrering av gamla lokala
 * medlemmar). Syns på /logga-in + /min-sida när enheten bär lokal progress:
 *
 *  · Gäst: "Registrera dig för att spara framsteg i molnet + importera
 *    lokal progress" (+ länk till inloggningen — på /logga-in sitter
 *    formuläret redan på sidan, därför lankTillLoggaIn={false} där).
 *  · Inloggad + import ej gjord: IMPORT-KNAPP → POST typ:"import" (ENDAST
 *    aggregat sänds — GDPR-minimering; knapptrycket är samtycket).
 *  · Inloggad + redan importerat: bannern försvinner (engångs-kontraktet).
 *
 * Utan lokal progress renderas inget (status quo bevaras — datan lämnar
 * ALDRIG enheten utan samtycke).
 */
export function MigreraProgressBanner({ lankTillLoggaIn = true }: { lankTillLoggaIn?: boolean }) {
  const { t } = useSprak();
  // "dold" tills både lokal-progress och session är kända — bannern blinkar
  // aldrig framför en gäst utan lokal data.
  const [lage, setLage] = useState<"okand" | "gast" | "inloggad">("okand");
  const [lokal, setLokal] = useState(false);
  const [importerad, setImporterad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fel, setFel] = useState("");

  useEffect(() => {
    if (!harLokalProgress()) return; // inget att migrera — bannern förblir borta
    setLokal(true);
    let aktiv = true;
    lasMedlemProgressKlient()
      .then((svar) => {
        if (!aktiv) return;
        if (!svar.inloggad) {
          setLage("gast");
          return;
        }
        setLage("inloggad");
        setImporterad(svar.progress.importGjord);
      })
      .catch(() => {
        if (aktiv) setLage("gast"); // tyst — gäst-vyn är säkret
      });
    return () => {
      aktiv = false;
    };
  }, []);

  if (!lokal || lage === "okand") return null;
  if (lage === "inloggad" && importerad) return null;

  const importera = async () => {
    if (busy) return;
    setBusy(true);
    setFel("");
    const resultat = await importeraLokalProgress();
    setBusy(false);
    if (resultat.ok || resultat.redan) {
      setImporterad(true);
      setFel("");
    } else {
      setFel(resultat.fel ?? t("migrer.importFel"));
    }
  };

  return (
    <div className="rounded-xl border-2 border-gold bg-gold/[0.06] p-5">
      <p className="font-serif text-lg font-bold text-gold">☁️ {t("migrer.rubrik")}</p>
      {lage === "gast" ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("migrer.textGast")}</p>
          {lankTillLoggaIn && (
            <Link
              href="/logga-in"
              className="mt-3 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {t("migrer.loggaInLank")}
            </Link>
          )}
        </>
      ) : importerad ? (
        <p className="mt-2 text-sm font-semibold text-gold" role="status">
          {t("migrer.importerad")}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("migrer.textMedlem")}</p>
          <button
            type="button"
            onClick={importera}
            disabled={busy}
            className="mt-3 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {busy ? t("gate.laserUpp") : t("migrer.importera")}
          </button>
          {fel && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {fel}
            </p>
          )}
        </>
      )}
    </div>
  );
}
