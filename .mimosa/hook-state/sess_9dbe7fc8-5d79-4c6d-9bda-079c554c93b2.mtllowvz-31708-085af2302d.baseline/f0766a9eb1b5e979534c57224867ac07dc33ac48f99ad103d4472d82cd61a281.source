"use client";

// ═══════════════════════════════════════════════════════════════
// SÄSONGS-GRID (VIL-3 · forskning-visualisering §1.3 + §5:3)
// Tolv månader (jan–dec) mot varje månads eget medel: över medel →
// marin-blå (mörkare = högre över medlet), under → vermillion-röd
// (Okabe-Ito, färgblindsäker) med ▲▼◼-redundans. n-räknare + osatt-
// hederskod: utan underlag visas "–", aldrig en gissning.
// Ren HTML-grid + React — inga externa bibliotek. SSR-säker.
// ═══════════════════════════════════════════════════════════════

export type ManadsPost = { manad: string; varde: number; medel: number };

const MANADER = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

const MARIN_RGB = [14, 27, 46];      // #0E1B2E — --djup-marin (över medel)
const VERMILLION_RGB = [213, 94, 0]; // #D55E00 — Okabe-Ito vermillion (under medel)
const GULD_RGB = [201, 168, 76];     // #C9A84C — neutral (precis vid medlet)

const talSv = (v: number) =>
  v.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

/** Blanda färgen mot pappret (≈ #fffdf7) och välj textfärg efter luminans —
      kontrasten ska hålla oavsett hur mörk cellen blir. */
function cellTextfarg(rgb: number[], alpha: number): string {
  const blandad = rgb.map((c) => Math.round(c * alpha + 255 * (1 - alpha)));
  const luminans =
    0.2126 * blandad[0] + 0.7152 * blandad[1] + 0.0722 * blandad[2];
  return luminans < 140 ? "#EDE6D6" : "#081120";
}

export function SasongsGrid({
  manadsData,
  ar,
  enhet = "%",
}: {
  manadsData: Array<ManadsPost>;
  /** Årtal för raden (årtal-radens-etikett); utelämnas → innevarande år */
  ar?: number;
  /** Värdets enhet i tooltip/etiketter (standard: procent, månadsavkastning) */
  enhet?: string;
}) {
  const poster = manadsData.slice(0, 12);

  // n-räknare: bara månader med både värde och medel lämnar spår i underlaget
  const giltiga = poster.filter(
    (m) => Number.isFinite(m.varde) && Number.isFinite(m.medel)
  );
  const n = giltiga.length;
  const maxAvvikelse = Math.max(
    ...giltiga.map((m) => Math.abs(m.varde - m.medel)),
    0
  );

  const arTal = ar ?? new Date().getFullYear();

  const celler = MANADER.map((kort, i) => {
    const post = poster[i];
    if (!post || !Number.isFinite(post.varde) || !Number.isFinite(post.medel)) {
      return { kort, manad: post?.manad ?? kort, osatt: true as const };
    }
    const diff = post.varde - post.medel;
    // Intensitet ∝ avvikelsen från medlet: mörkare = högre över (eller lägre under)
    const intensitet =
      maxAvvikelse > 0 ? 0.35 + 0.6 * (Math.abs(diff) / maxAvvikelse) : 0.5;
    const rgb =
      diff > 0 ? MARIN_RGB : diff < 0 ? VERMILLION_RGB : GULD_RGB;
    return {
      kort,
      manad: post.manad,
      osatt: false as const,
      diff,
      varde: post.varde,
      medel: post.medel,
      bg: `rgba(${rgb.join(",")}, ${intensitet.toFixed(3)})`,
      textFarg: cellTextfarg(rgb, intensitet),
    };
  });

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🗓️ Säsongsmönster — tolv månader mot varje månads medel
      </p>
      <div className="hjarlinje mt-3" aria-hidden="true" />

      {/* Årtal-rad + 12 månadsceller (jan–dec) */}
      <div className="mt-3 overflow-x-auto">
        <div
          className="min-w-[320px]"
          style={{
            display: "grid",
            gridTemplateColumns: "1.7rem repeat(12, minmax(0, 1fr))",
            gap: "3px",
          }}
        >
          {/* Header: månadsförkortningar */}
          <div aria-hidden="true" />
          {MANADER.map((m) => (
            <div
              key={m}
              className="text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {m}
            </div>
          ))}

          {/* Raden: årtal + celler med ▲▼◼-redundans (färg får aldrig bära ensam) */}
          <div
            className="flex items-center justify-center text-[9px] font-bold tabular-nums text-gold"
            title={`Årtal: ${arTal}`}
          >
            <span suppressHydrationWarning>{arTal}</span>
          </div>
          {celler.map((c) =>
            c.osatt ? (
              <div
                key={c.kort}
                title={`${c.manad}: osatt — underlaget räcker inte (motorn gissar aldrig)`}
                className="flex min-h-[44px] items-center justify-center rounded border border-dashed border-gold/30 bg-paper text-[9px] italic text-muted-foreground"
              >
                –
              </div>
            ) : (
              <div
                key={c.kort}
                style={{ background: c.bg }}
                title={`${c.manad}: ${talSv(c.varde)} ${enhet} mot medel ${talSv(c.medel)} ${enhet} → ${c.diff > 0 ? "▲" : c.diff < 0 ? "▼" : "◼"} ${talSv(Math.abs(c.diff))} ${enhet} ${c.diff > 0 ? "över" : c.diff < 0 ? "under" : "vid"} medlet`}
                className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded text-[9px] font-semibold"
              >
                <span aria-hidden="true" style={{ color: c.textFarg, lineHeight: 1 }}>
                  {c.diff > 0 ? "▲" : c.diff < 0 ? "▼" : "◼"}
                </span>
                <span className="tabular-nums" style={{ color: c.textFarg, lineHeight: 1 }}>
                  {talSv(c.varde)}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Teckenförklaring */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `rgba(${MARIN_RGB.join(",")}, 0.75)` }} />
          ▲ över medlet
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `rgba(${VERMILLION_RGB.join(",")}, 0.75)` }} />
          ▼ under medlet
        </span>
        <span>mörkare = större avvikelse</span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-gold/40 bg-paper" />
          – osatt
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Uppgift baserad på <span className="font-semibold text-foreground">{n} månaders data</span>{" "}
        — varje cell jämför månaden mot samma månads medel (långtidsgenomsnitt).
      </p>
      <p className="mt-1 text-[10px] italic leading-snug text-muted-foreground/70">
        Säsongsmönster är beskrivande historik med små urval — ”Sell in May” är litteraturens
        varningsexempel: mönster som kan försvinna när man handlar på dem. Griden förklarar
        rytmen, den är aldrig en kalenderhandel. Pedagogiskt verktyg, inte investeringsråd.
      </p>
    </div>
  );
}
