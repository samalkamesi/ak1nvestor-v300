/**
 * B2B-AKTIVERINGSFLAGGAN (våg 77, STYRELSE-B2B-VARIABLER.md beslut B1).
 *
 * AK1A PRO är under uppbyggnad och ska INTE synas publikt förrän kunden
 * slår på den: sätt `NEXT_PUBLIC_B2B_AKTIV=1` i Vercel-env och deploya —
 * noll kodändring. (NEXT_PUBLIC-prefixet gör att värdet inlines i klient-
 * bunten vid build — toppväxeln och övriga klientkomponenter kan läsa det.)
 *
 * AV-läge (default): toppväxeln visar bara "Privatperson", "AK1A PRO"-
 * länkar döljs (sidfot + ⌘K + chat-menyn), /pro-rutterna renderar en
 * neutral "Under uppbyggnad"-vy (noindex) och robots.ts stänger /pro.
 * PÅ-läge: allt återställs som före grinden — alla PRO-komponenter finns
 * kvar oskadda hela vägen.
 */
export function b2bAktiv(): boolean {
  return process.env.NEXT_PUBLIC_B2B_AKTIV === "1";
}
