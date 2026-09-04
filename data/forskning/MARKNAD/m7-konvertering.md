# M7 — Konverteringstratten + kampanjkalendern integrerad med hemmaekosystemet

> Datum: 2026-09-04 · Forskningsleverans i MEGA-PROJEKT MARKNAD (m7).
> Metod: kodgenomgång av repo + webbforskning (källor i sektion 2).
> Regler: BYGG EJ — detta är design/skiss. Konverteringsvyn bygger ENBART på
> befintliga datapunkter (INGA nya spår). Pedagogisk forskning — inte rådgivning.

---

## 1. Tratten IDAG — kartläggning i koden

Tratt: **besökare → gratismedlem → aktiv (XP) → Fas 2-ansökan →
prenumerationsintention → betalande.**

| # | Steg | Var data landar (kod) | Mäts? | Notering |
|---|---|---|---|---|
| 1 | Besökare | `system_events type=trafik` — TrafikRapportören (`src/components/ak1a/trafik-rapportor.tsx`, monterad i `layout.tsx`) beacon:ar `POST /api/trafik`. GDPR: path+UA-klass+ref-host+hashad session; urval "forsta" alltid + 30 % stickprov; puls räknas ej. Aggregat: `GET /api/trafik` (publik minimal / admin fullt, bounded 3 000 rader) | ✅ MÄTT | Unika sessioner, visningar, top-sidor/källor 24h/7d/30d. Panel: admin-tab "Trafik & Säkerhet" (`trafik-sakerhet-panel.tsx`) |
| 1b | Sidvisningar (aktivitetsspår) | `user_activities` via `POST /api/track` (också i `layout.tsx`) → admin/stats + beteende-panelen | ✅ MÄTT | Separat spår från trafik-events; kopplar inte till medlem-individ |
| 2 | Gratismedlem | `members`-tabellen via `POST /api/member/register` (member_type="free", last_login_at). Vbout-lead `kalla="medlem"` (endast nya, test-prefix filtreras) | ✅ MÄTT | `/api/admin/stats` räknar free/premium/pro |
| 3 | Aktiv (XP) | XP/nivå/streak/klara kurser lever **ENDAST i localStorage** (`src/lib/member-local.ts`: ak1a-xp, ak1a-streak, ak1a-klara-kurser; +10 XP/rätt quiz-svar, 100 XP/nivå, Fas 2-lås = nivå 25 = 2 500 XP) | ⚠️ DELVIS | Servern ser bara **proxy-XP** ur `user_activities` (`/api/admin/beteende`, viktade actions). Ingen sanning server-side → nivå 25 kan INTE detekteras → fas2nudge kan inte triggas |
| 4 | Fas 2-ansökan | `system_events type=fas2_ansokan` via `POST /api/fas2-ansok` (details: namn, email, niva, xp, kurserKlara, varfor) + Vbout `kalla="fas2-ansok"`. GET = antal (content-range) | ✅ MÄTT | Läses i admin "Systemevents"; godkännande manuellt via `/api/admin/fas2-access` |
| 5 | Prenumerationsintention | localStorage `ak1a-prenumeration-intention-v1` (ALLTID, `aktivera-panel.tsx`) + `system_events type=email_kö typ=prenumeration-intention` + Vbout `kalla="prenumeration"` — men **ENDAST om nyhetsbrevsrutan är ikryssad OCH e-post ifylld** | ⚠️ DELVIS | Intentioner utan nyhetsbrev syns ALDRIG på servern — admin är blind för dem |
| 6 | Betalande | **Inget betalflöde.** Fas 2 = 9 999 kr, Fas 3 = 13 999 kr (manuellt); prenumeration 249/449/799 kr/mån (priser.json) aktiveras via mejlväxling. `member_type` premium/pro finns i schema men sätts manuellt | ❌ SAKNAS | Kan inte mätas automatiskt; endast härledning ur member_type + fas2-access |

**Mejl-kön** (`system_events type=email_kö`, `src/lib/email-sandare.ts` + `/api/cron/email` 06:30 UTC):
- `morgon` — daglig rond till alla members (max 100/rond). ✅ trigger
- `vecka` — mall + typ finns men **INGEN cron/trigger**. ❌
- `fas2nudge` — mall + typ finns men **INGEN trigger** (servern ser inte nivå 25). ❌
- `prenumeration-intention` — köas vid begäran. ✅
- Leverantör: Resend/SendGrid-adaptern är KLAR men okonfigurerad → allt svarar "köad (leverantör saknas)".

**Vbout — 3 wired flöden** (`src/lib/vbout.ts`): `medlem`, `fas2-ansok`, `prenumeration` (fire-and-forget; status syns ej i admin, endast console.warn).

### Luckor (sammanfattning)
1. **Ingen trattvy** — datan finns i 4 källor (trafik-events, members, fas2_ansokan-events, email_kö) men ingen vy knyter ihop dem.
2. **Aktivering osynlig server-side** — XP i localStorage gör "aktiv"-steget till en skattning (beteende-proxyn), och fas2nudge är praktiskt död.
3. **Prenumerationsintention under-rapporterad** — endast nyhetsbrevs-checken når servern.
4. **Ingen CTA-klickmätning** — bara sidvisningar; "Begär aktivering"-klick etc. mäts ej.
5. **Inget betalsteg** — konverteringsgraden till kr kan bara härledas manuellt.
6. **Besökare↔medlem kan inte kohortkopplas** (hashad session ≠ member-id, by design GDPR) → trattsteg jämförs aggregerat per period, aldrig per individ.

---

## 2. Forskning — benchmarks och källor (WebSearch 2026-09-04)

**SaaS/edtech-konvertering**
- Freemium free→paid: median **3–5 %** (Crazy Egg; Pathmonk 2–5 %); ChartMoguls totalmedian 8 % är inkl. trials — freemium når sällan dit. [ChartMogul](https://chartmogul.com/reports/saas-conversion-report/), [Crazy Egg](https://www.crazyegg.com/blog/free-to-paid-conversion-rate/), [Userpilot](https://userpilot.com/blog/saas-average-free-trial-conversion-rate/)
- Freemium visitor→signup: **13–16 %** (zero-commitment entry konverterar ~2× trials).
- Edu: försäljningssida **1–3 %**, opt-in/landing **3–5 %**, topp 5–10 %. Unbounce: utbildnings-landningar median **8,4 %** (kurs-sidor upp mot 18 %). [Acceleroi](https://www.acceleroi.com/blog/unlocking-success-exploring-the-average-conversion-rate-for-online-courses), [Unbounce](https://unbounce.com/conversion-benchmark-report/education-conversion-rate/), [FirstPageSage](https://firstpagesage.com/seo-blog/conversion-rate-benchmarks/)
- AK1A-referens: besökare→gratismedlem ~8–13 % (gratis = opt-in-liknande), gratis→Fas 2/prenumeration ~3–5 % är realistiska band att mäta emot (METODMÅL, inte löften).

**Aktivering / Aha-moment**
- Aktiveringsgrad SaaS: **25–40 %** normalband (Userpilot 2024: snitt 37,5 %; OpenView 30–40 %, bäst >50 %, svaga <15 %); fintech 44 %. [PayProGlobal](https://payproglobal.com/answers/what-is-saas-activation-rate/), [Amplitude](https://amplitude.com/explore/digital-analytics/what-is-activation-rate)
- Metod: definiera EGEN aha-händelse via korrelation med retention — inte jaga branschsnitt. [Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-to-determine-your-activation), [Thoughtlytics 5-stegsramverk](https://www.thoughtlytics.com/blog/saas-activation-metric), [Kissmetrics](https://kissmetrics.io/blog/activation-rate-optimization)
- AK1A-kandidater (mätbara redan idag ur `user_activities`): "första quiz-rätta svar" (metadata ratt), "första kurs startad", "3 kurser startade inom 7 d", proxy-XP ≥ tröskel inom 7 d. PQL-definition: fas2_ansokan-eventet är i praktiken en färdig PQL-signal.

**Lifecycle-mejl**
- Welcome-mejl: ~**35 %** öppna / ~3,9 % klick / ~2–3 % konvertering — högst ROI av alla flöden. [Bloomreach](https://www.bloomreach.com/en/blog/email-conversion-rate), [Digital Applied/Omnisend](https://digitalapplied.com/email-marketing-benchmarks/)
- Varning: öppningar är uppblåsta av Apple Mail Privacy Protection — lita på klick/konvertering.
- AK1A: morgon-briefingen finns; VISIBLE lucka = welcome-serie vid registrering + fas2nudge + veckorapport (mallarna är redan skrivna i `email-mallar.ts`).

---

## 3. Design

### (a) Konverteringsvy i admin — ur BEFINTLIGA data, inga nya spår

Ny route `GET /api/admin/konvertering` (x-admin-password, samma mönster som
`/api/trafik`-admin; modulmemo-cache 5 min, `force-dynamic`):

| Trattsteg (vy) | Källa (redan idag) | Räknat som |
|---|---|---|
| Besökare 30 d | `system_events type=trafik` (bounded läsning, samma som /api/trafik GET) | unika sessioner |
| Gratismedlem 30 d | `members` | content-range totalt + `created_at=gte.30d` |
| Aktiva 30 d | `user_activities` (30 d) | unika session_id med action ≠ page_view (kurs/quiz/verktyg) — "aktiv" = gjorde något som ger proxy-XP |
| Fas 2-ansökningar | `system_events type=fas2_ansokan` | content-range totalt + 30 d |
| Prenumerationsintentioner | `system_events type=email_kö` där details.typ=prenumeration-intention | antal + notering "underrapporterar: endast nyhetsbrevs-check" |
| Betalande | `members` där member_type ∉ {free} + antal fas2-access-beslut | manuellt underhållen siffra, märks "manuell" |

UI: ny admin-tab **"Konvertering ▲"** bredvid "Trafik & Säkerhet" — vertikala
tratt-staplar (guld, `StatTabell`-mönstret) med **konverteringsgrad % mellan
stegen** + noteringar per steg om mätfel (MÄTT/ÄRLIGT-DNA). Ingen skrivning,
ingen ny spårning, inga nya tabeller.

### (b) Kampanjkalender — `data/kampanjer.json` + `GET /api/kampanjer`

Fältschema (JSON-nycklar utan åäö enligt repo-regeln; redigeras av teamet som
`kunskapsflode.json`, dvs. ingen POST):

```json
{
  "version": 1,
  "uppdaterad": "2026-09-04",
  "kampanjer": [
    {
      "id": "2026-w36-veckans-research-bolag",
      "period": "2026-W36",
      "tema": "Veckans research-bolag ur forskningslaget",
      "ytor": ["blogg", "kunskapsflode", "mejl"],
      "status": "planerad",
      "mal": "Besökare -> gratismedlem",
      "koppling": { "typ": "forskningslage", "nyckel": "veckansBolag" },
      "ansvarigOrgan": "marknad",
      "material": ["/blogg/...", "/kunskapsflode"],
      "matt": { "ytterligareMedlemmar": null }
    }
  ]
}
```

- `period`: ISO-vecka (`2026-W36`) eller intervall `2026-09-01/2026-09-14`.
- `ytor`: enum `blogg | kunskapsflode | mejl` (de tre hemma-ytorna; kunskapsflödet har max 15 poster — kampanj post tränger ut äldst).
- `status`: `planerad | aktiv | avslutad | arkiverad`.
- `koppling.typ=forskningslage` + `nyckel=veckansBolag`: innehållet hämtas LIVE från `GET /api/forskningslage` (som redan returnerar veckans research-bolag, deterministisk hash per ISO-vecka i `src/lib/forskningslaget.ts`) → kampanjen självuppdateras varje vecka utan nytt innehåll.
- `GET /api/kampanjer`: publik läsning, `?status=aktiv` filtrerar, modulmemo + `Cache-Control: max-age=3600` (samma mönster som `/api/forskningslage`). AI-styrelsens `POST /api/styrelse/marknadsforing` kan generera kampanjtexter som klistras in i kalendern (människa godkänner).

### (c) CTA-platsernas hierarki (var i koden)

| Prioritet | Plats | Kod | Primär CTA → nästa trattsteg |
|---|---|---|---|
| 1 | Start/socialt bevis | `social-proof.tsx` (rad ~213–235; används på /manifest, /medlemskap, /fas2-ansok, /kurser) | "Gå med gratis — 30 sekunder" → `/logga-in`; sekundär "Utforska kurserna" |
| 2 | Kursklar-stolpen | `kurs-steg.tsx` rad ~150 — `t("kurs.fas2Porten")` visas vid nivå ≥ 25 | **Saknar länk** — endast text. Ska länka → `/fas2-ansok` |
| 3 | Certifikatet | `certifikat.tsx` rad 171–183 — "Du är kvalificerad för Fas 2" + "Ansök om Fas 2 →" | → `/medlemskap#fas2` (fungerar; kanske direkt `/fas2-ansok`) |
| 4 | Forskningsbiblioteket | `forskningsbiblioteket/page.tsx` — analys-kort + "Läs mer" → blogg | **Saknar prenumerations-CTA** — värdet visas men ingen eskalering |
| 5 | /fas2-ansok | `fas2-ansok.tsx` (gated nivå ≥ 25) + SocialProof | Ansökningsformulär → system_event |
| 6 | /prenumeration | `niva-kort.tsx` ("Aktivera den höra nivån →", event `ak1a:valj-prenumeration`) → `aktivera-panel.tsx` | "Begär aktivering" → localStorage + (villkorligt) email_kö |

Princip: **ett steg = en primär CTA till nästa steg** — sekundära länkar får
aldrig konkurrera (befintliga luckor: steg 2 och 4 ovan).

---

## 4. Implementeringsskiss (BYGG EJ)

1. **Route** `src/app/api/admin/konvertering/route.ts` (~120 rader): sex parallella
   bounded count-anrop (HEAD + content-range där det räcker: members totalt/30d,
   fas2_ansokan totalt/30d, email_kö-intentioner; fulla läsningar för trafik-sessioner
   och user_activities 30 d), aggregering till steg + %-andel, 5 min modulmemo.
2. **Panel** `src/components/ak1a/admin/konverterings-panel.tsx` + admin-tab i
   `src/app/admin/page.tsx`: tratt-staplar, konverteringsgrader, noteringar om
   mätfel, "manuell"-märkning av betalande-steget.
3. **Kalender**: `data/kampanjer.json` (schema ovan) + `src/app/api/kampanjer/route.ts`
   (~40 rader, memo-cache som forslagslagslage-routen). Yt-montering senare:
   kunskapsflöde-komponenten läser aktiva kampanjer, mejl-ronden plockar aktiv
   kampanj som ämne.
4. **CTA-luckor** (små patcher): länk i `kurs-steg.tsx` fas2Porten-text → `/fas2-ansok`;
   prenumerations-CTA-block i `forskningsbiblioteket/page.tsx` → `/prenumeration`.

### Tre rekommendationer
1. **Bygg konverteringsvyn först** (ovan 1+2) — noll nya spår, noll nya tabeller,
   allt finns redan; den blir trattens kommandocentral och sätter baseline mot
   benchmarks (besökare→medlem ~8–13 %, aktiv→ansökan, intention→betalande).
2. **Stäng mätluckan för intentioner**: låt `aktivera-panel.tsx` ALLTID posta
   intentionen till kön (typ=prenumeration-intention, nyhetsbrev eller ej) —
   en rad befintlig funktionalitet återanvänds, inget nytt beteendespår skapas;
   det är den enskilt större synlighetsvinsten i tratten. Samma patch ger
   fas2nudge en framtid när servern kan se nivå (proxy-XP-tröskel).
3. **Aktivera mejl-leverantören och kalendern tillsammans**: sätt
   `EMAIL_LEVERANTOR` + `EMAIL_API_KEY` (koden är färdig, kön töms automatiskt)
   och lansera kampanjkalendern med "veckans research-bolag" som återkommande
   veckokampanj kopplad till `/api/forskningslage` — lifecycle-mejl är det som
   rör tratten mellan stegen (welcome ~35 % öppna / 2–3 % konvertering).

*Inget committat. Ingen kod byggd. Källor: se sektion 2.*
