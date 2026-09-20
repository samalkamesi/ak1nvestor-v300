"use client";

import { useSprak } from "@/components/ak1a/sprak-leverantor";
import { SidfooterVy } from "@/components/ak1a/sidfooter-vy";

/**
 * SIDFOOTER — KLIENT-BINDNING (sv-rötter).
 *
 * Rik sitemap-footer i AK1A-DNA (paper, guld, serif); fyra kolumner läses
 * UR meny-registret (src/lib/meny-register.ts — EN källa för all navigation)
 * + bottenrad med disclaimer och policylänkar. Layouten lever i
 * sidfooter-vy.tsx (o105) — EN källa, två bindningar.
 *
 * VÅG 51 (2026-09-01): KLIENTKOMPONENT — etiketterna översätts via registrets
 * `nyckel` + useSprak().t. SSR/SSG renderar svenska (sv-raden = registrets
 * text); hydreringen byter till en/ar direkt vid språkval (samma mönster som
 * huvudmenyn/mobilmenyn). Gast-utbudet gäller fortfarande (publik-filter).
 *
 * o105 (spår 7): på SPEGLAR (/en|/ar via SeoPageShell lang) används i stället
 * sidfooter-server.tsx (skapaT(lang), ingen hydratisering) — denna bindning
 * betjänar originalsidorna med oförändrat MGTM-beteende och identisk DOM.
 */
export function Sidfooter() {
  const { t } = useSprak();
  return <SidfooterVy t={t} />;
}
