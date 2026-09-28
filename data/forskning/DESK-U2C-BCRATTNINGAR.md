# DESK-U2C — B/C-fyndens självrättning: verifiering + rättning (2026-09-28)

**Agent:** fabriksagent v199-u2C (BYGGARE) · **Uppdrag:** verifiera u2:s 16 fynd (DESK-U2-MOBILFELJAKT.md) mot dagens filläge efter u3 (landning) + u4 (defaults), rätta det som fortfarande är fel i ak1a-ytorna.
**Ägarskap denna leverans:** `/var/www/desk/index.html` + `/home/ak1a/desk-web/{defaults.json,mandatory.json,vnc.html}` + detta protokoll. **Orörda:** app/ui.js (u1:s yta), core/**, vendor/**, app/styles, app/locale.

---

## 1. HUVUDFYND VID VERIFIERINGEN: u3:s landningsleverans hade SKRIVITS ÖVER

Dagens `/var/www/desk/index.html` (sha `d10d5db1…` före denna rättning) var **inte** u3 omgång 2:s redovisade läge (`8b41fd5c…`). Jämförelse rad för rad visade att nästan ALLA u3-rättningar saknades i filen: ingen `theme-color`, ingen `aria-label`, ingen `:focus-visible`, inget `min-height: 48px`, ingen `prefers-reduced-motion`, kontrastfärgerna tillbakarullade (`#6b7280`/`#475569` åter i stället för `#94a3b8`), textomskrivningarna borta. Kvar av u3 var endast tre spår: title-stavrättningen ("ZCode-skrivbordet"), `viewport-fit=cover` och en hybrid i steg 3 ("strecket högst upp/knappen i kanten"). Filen har alltså skrivits över av ett senare skrivande med äldre innehåll — en tyst regression som ingen protokollförde.

**Åtgärd:** hela u3:s dokumenterade leverans (tabellrad 1–17 i DESK-U3-LANDNING-FORBATTRAD.md) har **återställts** av u2C och byggts vidare med u2:s B/C-rättningar som u3 aldrig tog (F4/F5-landningstext/F6/F9). Äran för återställda delar tillfaller u3 — de redovisas nedan som "återställd ur u3 (förlorad vid överskrivningen)". **Lesson för fabriken: ytfiler utanför repot behöver sha-kontroll i nästa agents KVD innan eget skrivande — annars skriver man omedvetet över föregångarens leverans.**

u4:s leverans var däremot **intakt och sha-identisk** med redovisningen: defaults.json `708f4705…`, mandatory.json `ca3d163b…` (= paketet), vnc.html `03d8c8eb…` (före u1:s senare F1-tillägg, se § 4).

## 2. Verdict per fynd (F1–F16)

| Fynd | Alv. | Verdict | Vem |
|---|---|---|---|
| F1 nyp-zoom | A | **Kod: RÄTTAD av u1** (one-tap "Återställ zoom (Ctrl+0)"-knapp i vnc.html, märkt DESK-U2B, verifierad i filen). **Textstöd på landningen: RÄTTAT av u2C** (steg 2 pekar nu på knappen) | u1 + u2C |
| F2 sidfot-kontrast | B | **RÄTTAT** — återställd ur u3 (förlorad vid överskrivningen) | u3/u2C |
| F3 knapptext-kontrast | B | **RÄTTAT** — återställd ur u3 (förlorad) | u3/u2C |
| F4 fullskärmslöfte | B | **RÄTTAT av u2C** (fanns kvar i filen — varken u2- eller u3-rättning) | u2C |
| F5 reconnect av | B | defaults: **RÄTTAT av u4** (reconnect:true, sha intakt) · landningstext: **RÄTTAT av u2C** ("ladda om"-rådet var kvar) | u4 + u2C |
| F6 auth-permanenslöfte | B | **RÄTTAT av u2C** ("bara första gången" fanns kvar i filen) | u2C |
| F7 "strecket högst upp" | B | **RÄTTAT** — u3:s faktakorrigerade text återställd (filen hade hybriden "högst upp/knappen i kanten") | u3/u2C |
| F8 touch-mål 33 px | B | **VIDAREBOKAS** — rättningen bor i app/styles/base.css (`.noVNC_button` padding/min 44 px), utanför u2C:s ytor denna våg | nästa omgång |
| F9 401 utan förklaring | B | **Landningsrad RÄTTAD av u2C** · wrapper-idé kvarstår som framtidsförslag | u2C |
| F10 nginx 401-sida | C | **VIDAREBOKAS** — /etc/nginx ägs av root-rond (u2C förbjudet i /etc/**) | root-rond |
| F11 porträtt-tips i vnc-vyn | C | **RÄTTAT av u2C** — svensk snabbhjälpsrad i connect-dialogen (bokmärkesresan) | u2C |
| F12 user-scalable=no | C | **DOKUMENTERAT VAL** — ingen ändring (u2:s rekommendation; viewport i vnc.html orörd av u2C) | — |
| F13 tom defaults.json | C | **RÄTTAT av u4** (resize:scale + show_dot + reconnect + quality:6; autoconnect medvetet ute — Anslut-dialogen som första intryck; u4:s motiverade beslut respekteras) | u4 |
| F14 titel "noVNC" | C | **RÄTTAT av u4** (vnc.html title "AK1A — Skrivbord", verifierad i filen) · PAGE_TITLE i ui.js (live-titel) = u1:s yta, lämnad | u4 |
| F15 safe-area | C | **VIDAREBOKAS** — rättningen bor i app/styles/base.css (`env(safe-area-inset-left)`), utanför u2C:s ytor | nästa omgång |
| F16 "Remote resizing"-svenska | C | **VIDAREBOKAS** — app/locale/sv.json utanför u2C:s ytor · mandatory-låsning av `resize` prövades och avslogs med motivering av u4 (rättvisa: inget låses) | nästa omgång |

## 3. Före/efter — varje rättning med mätvärde (u2C:s egna)

Landningen `/var/www/desk/index.html` (före = dagens läge vid start, sha `d10d5db1…`):

| # | Före (mätt i filen) | Efter (mätvärde) | Fynd |
|---|---|---|---|
| 1 | `.fot { color:#475569; font-size:11.5px }` = **2,48:1** på #0b1120 | `.fot { color:#94a3b8; font-size:12.5px }` = **7,34:1** (krav 4,5:1; u2C:s egen WCAG-beräkning, samma siffra som u3) | F2 |
| 2 | `.litet { color:#6b7280 }` = **3,89:1** | `.litet { color:#94a3b8 }` = **7,34:1** | F3 |
| 3 | `.litet`-text: "Öppnas i fullskärm — vrid telefonen liggande för bästa vy." | "Öppnar skrivbordet — vrid telefonen liggande för bästa vy." + aria-label "Öppna ZCode-skrivbordet" (fullskärm kan inte garanteras på iOS Safari, ui.js:147-158 döljer knappen) | F4 |
| 4 | Faktaruta: "Tappar du anslutningen: ladda om sidan och tryck på knappen igen." | "Tappar du anslutningen återansluter den oftast automatiskt — annars tryck på Anslut." (sant tack vare u4:s `reconnect:true` + `reconnect_delay:5000` i defaults.json, sha `708f…` orörd av u2C) | F5 |
| 5 | Steg 1: "Webbläsaren sparar det — bara första gången." | "Webbläsaren minns inloggningen vanligtvis åt dig — ibland frågar den igen efter en omstart, då anger du samma uppgifter igen." | F6 |
| 6 | Steg 3: "Tryck på tangentbordsikonen i noVNC:s meny (strechet högst upp/knappen i kanten)…" | "Tryck först där du vill placera markören. Fäll sedan ut menyn med fliken vid skärmens vänsterkant och tryck på tangentbordsikonen — den syns bara på pekskärm." (vänsterkant bevisad: base.css:239-252 `left:0`; pekskärm-villkor base.css:332) | F7 |
| 7 | (saknad rad) | Ny mening i faktarutan: "Säger den bara ”misslyckades att ansluta”: stäng fliken, öppna den här sidan igen och logga in." (401 på websockify mätt av u2; sv.json:7 ger tekniska felstatusen utan förklaring) | F9 |
| 8 | Steg 2 saknade gest-varning | "Nypa med två fingrar zoomar appens text, inte vyen — blir den för stor trycker du på **Återställ zoom** i menyn." (pekar på u1:s DESK-U2B-knapp, verifierad i vnc.html rad 159–175) | F1-textstöd |
| 9 | Fot: "pedagogisk plattform" | "utbildningsplattform" (juridiska nyckelordet, 2 kap 5 § 2007:528) | u3:14 |

**Återställda ur u3:s protokoll** (förlorade vid okänd överskrivning, nu åter i filen, u2C har verifierat vart och ett med grep): `theme-color #0b1120` (rubrik 1) · `aria-label` på knappen (rubrik 2, av u2C omformad utan "fullskärm") · `:focus-visible outline 3px #fff` = **5,17:1** mot #2563eb (rubrik 3+17) · `min-height:48px` på knappen = touch-mål ≥ 44 px (rubrik 4) · `prefers-reduced-motion` (rubrik 7) · `.fot` 12,5 px (rubrik 16) · blurb "finns kvar" (rubrik 9) · steg 1/2/4-omskrivningar (rubrik 10–12) · faktaruta "ligger kvar och väntar" (rubrik 13, av u2C sammanslagen med F5/F9-rättningarna).

noVNC-vyn `/home/ak1a/desk-web/vnc.html` (före = u4:s läga + u1:s F1-knapp):

| # | Före | Efter | Fynd |
|---|---|---|---|
| 10 | Connect-dialogen (rad 354–364) hade ingen vägledning alls | En rad under Anslut-knappen: "Tips: vrid telefonen liggande för bästa vy. Menyn öppnas från strecket i vänsterkant." (`translate="no"` = medvetet svensk, lokaliseraren rör den inte — kundens språk; synlig i connect-läget = just bokmärkes-/frånkopplingsresan där landningens vägledning saknas) | F11 |

**Orörda av u2C (bevis):** defaults.json sha `708f4705…` = exakt u4:s läge · mandatory.json sha `ca3d163b…` = paketet · u1:s zoom-knapp "Återställ zoom (Ctrl+0)" intakt · viewport-raden (F12) orörd · core/, vendor/, app/ orörda.

## 4. KVD — verifieringsutdata (klistrad)

```
defaults.json: GILTIG          (node JSON.parse)
mandatory.json: GILTIG         (node JSON.parse)
vnc.html connect_dlg: OK · F11-tipsrad: OK · u1 zoom-knapp: OK · title "AK1A — Skrivbord": OK
index.html gamla #6b7280: borta (OK) · gamla #475569: borta (OK)
index.html fullskärmslöfte: borta · bara-första-gången: borta · "högst upp": borta · ladda-om-råd: borta
index.html reconnect-text: OK · F9-vägledning: OK · F1-stöd: OK
index.html theme-color/aria-label/focus-visible/min-height 48/reduced-motion: OK
kontrast .litet/.fot #94a3b8 på #0b1120 = 7.34 (krav 4.5)
kontrast FÖRE .litet #6b7280 = 3.89 · FÖRE .fot #475569 = 2.48 (historia)
kontrast fokusring #fff på #2563eb = 5.17 (krav 3)

curl (utan auth — VÄNTAT):
/desk/               → HTTP 401
/desk/vnc.html       → HTTP 401
/desk/defaults.json  → HTTP 401

sha256 (efter):
a74da688126a8d33084f29641c4b20a7be03b6ec9275c2cb431eb0b6e94a6a3e  /var/www/desk/index.html   (ÄNDRAD av u2C)
708f4705c71b6105de1be7f158d7d698cb24895bb892073d2f1a5b941fd91fa4  defaults.json              (orörd = u4)
ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356  mandatory.json             (orörd)
3d29c5e7dd35493b404b37dcc8bcaef60fec8cd93fbfbf1bb5d73c6fe637aa5b  vnc.html                  (u1:s F1-version + u2C:s F11-rad)
```

## 5. Vidarebokningar (för nästa KO-omgång / root-rond)

1. **F8** (touch-mål 33 px): `app/styles/base.css` — `.noVNC_button { padding:8px; min-width/height:44px }` med centrerad ikon (CSS-only).
2. **F15** (safe-area): samma fil — `#noVNC_control_bar_anchor { padding-left: env(safe-area-inset-left); }` m.fl.
3. **F16** (svenska): `app/locale/sv.json` — "Remote resizing" → "Skalning på servern" / "Fjärrändra upplösning".
4. **F10** (svensk 401-sida): nginx `error_page 401` — root-rond.
5. **F1-rest** (live-titel): `PAGE_TITLE` i ui.js = "noVNC" skriver över vnc.html-titeln vid start (ui.js:21, 1193, 1768) — ui.js-yta.
6. **Regressionsskydd** för `/var/www/desk/index.html`: närmaste agent som skriver filen bör verifiera sha `a74da688…` först (se § 1).

## 6. Juridik

Landningens texter ramas in som utbildning ("utbildningsplattform, ej investeringsråd" — 2 kap 5 § lagen 2007:528); inga råd, inga lösenord i klartext (endast användarnamnet "ak1a", ej hemlighet), inga externa resurser, ingen tracking. vnc.html-tipsraden är neutral verktygsvägledning.
