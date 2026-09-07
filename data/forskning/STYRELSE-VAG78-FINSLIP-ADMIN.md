# STYRELSE — VÅG 78: Telefon-refresh (P0) · Finslipningsrond · Admin-Mega (2026-09-07)

**Kundens nya permanenta lagar (registrerade i minnet):** (1) ALLTID max
parallella agenter; (2) AI-styrelsen konsulteras/sanker ALLT bygge — saknas
organ-infrastruktur byggs den först; (3) kunduppgifter påminns löpande.

**Kundrapporterat P0 — TELEFONEN REFRESHAR VAR ~10:E SEKUND** ("började
nyligen, connectar om var 10 sek — kan det vara för att datorn är trött?").
Misstänkta i kodbasen: sw.js uppdateringsloop, PWA-registrerarens
reload-beteende, NotisCenter-pollning (o1 #6), eviga intervall tracer-härta
+ trafikpuls (o1 #10 — batteri/CPU), ev. dev-server-HMR om kunden surfar
dev-instansen. UTREDNING = högsta prioritet (användarupplevelse).

## Beslut

### P0 — TELEFON-REFRESH-UTREDNING (bygg direkt)
En agent läser: public/sw.js (update/skipWaiting/reload-logik),
pwa-registrerare, notis-center.tsx (polling), trafikpuls/tracer-härta-
intervall, alla location.reload()-anrop. Fix-regler: (a) Service Worker
får ALDRIG trigga sidomladdning i loop — uppdatering appliceras vid nästa
naturliga navigering; (b) intervall PAUSAR when document.hidden
(batteri); (c) notiser pollar endast vid fokus + minst 60 s mellan.
Verifiering: kodgranskning + dev-test + ingen regress i svit/vakten.

### P1 — FINSLIPNINGRONDER (3 läsar-agenter parallellt, read-only)
Kundens "vi behöver läsa många problem… fokusera på finslipning och hitta
problem och lös dem": (A) publika sidor (start/kurser/blogg/manifest/
medlemskap/prenumeration — copy-konsistens, döda länkar, tal ur registret,
mobil), (B) kurs-+verktygssidor (kalkylator/vagfundament/portfölj —
interaktionsfel, konsistens), (C) speglar /en + /ar (läckor av svensk text,
trasiga länkar, RTL). Output: strukturerad problemlista (fil/rad/allvar/
fixförslag) — MAIN sankar fixlistan och dispatchar byggagenter.

### P2 — ADMIN-MEGA (WordPress-liknande) — FORSKNING FÖRST
Kundens "mega system för admin precis som WordPress för att hantera allt
på långt håll". Redan finns: /admin (paneler: översättning, trafik,
konvertering, utvecklingsradar, medlemmar, bokningar…). SAKNAS enligt
kundkänslan: enhetligt innehålls-CMS (kurser/blogg/guider redigerbara),
variabelpanel (ändra pris/tal i UI → skriv guldkällorna), media-bibliotek.
Agent producerar design + stegplan (STYRELSE-ADMIN-MEGA.md); bygg startar
efter ordförandegodkännande av steg 1 i nästa rond — INGET storskaligt
byggande före beslut (lagen).

### P3 — VARIABELREGISTER STEG 2 (kö)
Kanoniska strängar (mejladresser, org.namn, sociala URL:er) in i
registret när admin-panelen designas (P2 äger GUI:et).

## KÖ efter våg 78
Prestanda våg 3 (o1 #6-#10 — intervall-fixen i P0 överlappar #10) ·
m9-fabriksaktivering · 8 guider till · m10 steg 2 (väntar J1-J2) ·
bokmaster-nyckelord SD-runna när SQL-tabellen landar.

## PÅMINNELSER TILL KUND (upprepas tills lösta)
1. data/sql/oversattningar.sql + ALTER-composite (139 745 rader!)
2. CRON_SECRET · 3. Jurist G2 · 4. DeepL + MYMEMORY_EMAIL · 5. K1-K5
6. När B2B klart: NEXT_PUBLIC_B2B_AKTIV=1 i Vercel.

## TILLÄGG VÅG 80a — DJUP SPRÅKKONTROLL (kundrapport 2026-09-07: "får problem")

Kunden upplever språkproblem. Senaste ändringar som RÖRDE språkytor:
(våg 78 B) fas2-gate-omskrivning + kurs-spegel-sida + /api/kurs-spegel
(smakprov/låsvy på speglar); (våg 78 S) lang/dir-inline-skript +
sprak-leverantor usePathname-deps; (våg 78 A) home-section/ordlista-
parametrar (t() med params i tre språk); (våg 79) fas2-ansok props.

BESLUT: 4 granskningsagenter parallellt — (1) prod-svep UI-språk alla
nyckelsidor ×3, (2) språkväxlare+närliggande kod, (3) kursspeglar+gating,
(4) bloggspeglar+chatbot+ordlista-konsistens. Agenter FIXAR endast
otvetydiga P0-buggar (trasig rendering, fel språk-läckor) och rapporterar
resten; ordföranden sankar fixrond efter listorna.
