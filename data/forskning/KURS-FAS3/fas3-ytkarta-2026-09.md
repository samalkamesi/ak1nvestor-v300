# FAS 3 — YTKARTA 2026-09 (våg 202: var Fas 3 bor, skiftets positionering, R2-gränser)

**Uppdrag:** skiftet 2026-09-18 fokus 4 — KURS-FAS 3-FÖRBEREDELSE:
"under byggnation — kommer snart", ALDRIG resultatlöften. Denna ytkarta
inventerar var Fas 3 lever i plattformen, vilka ytor som fick skiftets
positionering denna våg, och vilka som är R2 (väntar kund — ändras ALDRIG
autonomt).

**Skiftets positioneringstabell (källdokumentet):**

| Före | Efter |
|---|---|
| "90 dagars garanti" | "Förbered dig till Fas 3" |
| "Pengarna tillbaka" | "Under byggnation — kommer snart" |
| Implicit löfte om resultat | "Bygg din analysförmåga steg för steg" |

## Ytorna (inventerade 2026-09-19, rond 92)

| # | Yta | Fil | Skiftets läge | Åtgärd våg 202 |
|---|---|---|---|---|
| 1 | **Kurslåsvyn (lärvägsstrukturen)** — där en elev möter låst Fas 3-innehåll i kursflödet | `src/components/ak1a/fas2-gate.tsx` + ordlista `fas3.statusEtikett/statusText` | Positioneringen SAKNADES | **LEVERERAD**: statusruta "Under byggnation — kommer snart" + "bygg din analysförmåga steg för steg" — endast Fas 3-grenen, ×3 språk (sv/en/ar via ordlistan) |
| 2 | `/fas3`-sidan (produktöversikten) | `src/app/(huvud)/fas3/page.tsx` (+ en/ar-speglar) | HAR redan shift-ärlig "Under utveckling"-sektion ("vi lovar inte färdiga datum — vi lovar riktningen") | Lämnad orörd denna våg — se R2 nedan |
| 3 | `/fas3` pris + garantitext ("90 dagars nöjd-kund-garanti … betalning sker först efter 90 dagar") + metadata med garantitext | `fas3/page.tsx` rad ~631 + metadata rad ~20 | ⚠ **R2**: betalningsvillkor + garanti = kundens veto (skiftet ger riktningen, men utfästelsen är juridisk) | **VÄNTAR KUND** — ingång i R2-paketet (jämte /medlemskap + Villkoren 5–6) |
| 4 | `/medlemskap` Fas 3-text ("18 fundamentala i Fas 2, 24 i Fas 3") + garantitext | `medlemskap/page.tsx` rad ~480 | ⚠ **R2** (pipeline-notisen) | VÄNTAR KUND |
| 5 | `Fas3Cert` (praktikportföljens progress på /fas3) | `src/components/ak1a/fas3-cert.tsx` | Beskriver certifieringsmekaniken (existerar) — inget löftespråk | Orörd |
| 6 | Kurs-access + låstexter | `src/lib/kurs-access.ts` `fas3LockeradText` | Beskrivande (ekosystem/psykologi/standard) — inget garanti-/resultatspråk | Orörd (texterna bär innehållet, inte löften) |
| 7 | Chatbot-svar om Fas 3 | `src/app/api/chatbot/route.ts` ~1359 | "teknisk analys hör hemma i Fas 3" — saklig | Orörd (~1067 bär garanti + pris = R2-adjacent, lämnad) |
| 8 | Fas 2-notisen (nivå 25) | `src/lib/notiser.ts` | DJUP-formulerad i våg 201 (rond 91) | Klart |

## Kvar i spåret (nästa vågar i Fas 3-förberedelsen)

1. **R2-paketet** (kundens knapp): garanti-omformulering på /fas3 + /medlemskap
   + Villkoren 5–6 → skiftets "Förbered dig till Fas 3". Underlag = denna
   karta + brandgenomgången P1. Verkställs ALDRIG autonomt.
2. Fas 3-spegelsidorna (en/ar) får statusrutan automatiskt via ordlistan —
   verifieras live efter deploy.
3. `/fas3`-sidans statusribbon (hero-nivå) föreslås som R2-adjacent fråga:
   sidan säljer en färdig produkt MEDAN verktygen är under byggnation —
   spänningen löses av kunden (antingen ribbon eller omformulerad hero).

*Juridikgrind: alla nya formuleringar är utbildningsform — "bygg din
analysförmåga steg för steg" beskriver en metod, inte ett resultat. Inga
datum, inga avkastningslöften, inga prisändringar (2007:528).*
