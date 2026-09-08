"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { raknaKurstips, type KursTips } from "@/lib/kurstips";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * TIPS FÖR JUST DIG — kurstips-motorn synliggjord.
 * Visar 2–3 personliga tips som tryckbara kort (ikon + titel + varför-rad +
 * "→ Öppna"). Diskret, elegant, AK1A-DNA. Hydration-säker: tomt första passt,
 * beräkning sker i useEffect på klienten — aldrig ett tips om sidan eleven
 * redan står på. Rubriken är överridbar per yta (t.ex. "Dina nästa kurser i
 * läroplanen" på /laroplan) — default "Tips för just dig".
 *
 * V86: "→ Öppna" via ordlistan, och på speglarna (/en|/ar) länkar korten till
 * spegelns egna kurssidor (samma mönster som prenumLank i prenum-cta). Tipsens
 * titlar/varför-rader är motor-data (kurstips.ts) och förblir svenska tills
 * tipsmotorn får sin egen språkvåg — dokumenterat i worklog.
 */

export function KurstipsKort({ antal = 3, rubrik = "Tips för just dig" }: { antal?: number; rubrik?: string }) {
  const pathname = usePathname();
  const { t, sprak } = useSprak();
  const [tips, setTips] = useState<KursTips[]>([]);
  const lankPrefix = sprak === "en" || sprak === "ar" ? `/${sprak}` : "";

  useEffect(() => {
    // Spegel-prefix (/en, /ar) klipps bort innan slug-matchningen — aktuell
    // kurs utesluts även när eleven står på /en/kurser/<slug>.
    const basPath = pathname?.replace(/^\/(en|ar)(?=\/|$)/, "") ?? "";
    const aktuellSlug = basPath.startsWith("/kurser/")
      ? decodeURIComponent(basPath.replace("/kurser/", "").replace(/\/$/, ""))
      : undefined;
    setTips(raknaKurstips({ antal, exkluderaSlug: aktuellSlug }));
  }, [pathname, antal]);

  if (tips.length === 0) return null;

  return (
    <section className="rounded-xl border border-gold/30 bg-card p-4">
      <h2 className="font-serif text-sm font-bold tracking-wide text-gold">{rubrik}</h2>
      <ul className="mt-2 space-y-1.5">
        {tips.map((tipsItem) => (
          <li key={tipsItem.slug}>
            <Link
              href={`${lankPrefix}/kurser/${tipsItem.slug}`}
              className="flex items-center gap-3 rounded-lg border border-gold/10 px-3 py-2.5 hover:bg-gold/10"
            >
              <span className="text-xl" aria-hidden>
                {tipsItem.ikon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{tipsItem.titel}</span>
                <span className="block text-xs text-muted-foreground">{tipsItem.varför}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-gold">{t("tips.oppna")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
