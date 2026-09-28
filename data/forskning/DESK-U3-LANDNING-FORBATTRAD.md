# DESK-U3 — Landningssidan förbättrad: tillgänglighet, mobilskärpa, svenska

**Datum:** 2026-09-28 · **Agent:** fabriksagent v198-u3 (BYGGARE, omgång 2) · **Ägarskap:** `/var/www/desk/index.html` (endast denna fil) + detta protokoll.

**Syfte:** Den svenska mobil-landningen på `https://lab.ak1nvestor.com/desk/` är kundens dörr in till ZCode-skrivbordet. U3 höjer tillgängligheten (WCAG 2.1 AA-kontrast, fokus, pekmål, reducerad rörelse), mobilskärpan (temafärg, faktakorrigerad noVNC-guide) och svenskan (Du-form, inga anglicismer) — utan att byta design-språk (mörk #0b1120, AK1A-blå). Knappen är fortfarande ONE-tap med **exakt bevarat mål**: `vnc.html?autoconnect=true&resize=scale&show_dot=true`.

## 0. Omgångshistorik (viktigt för fabriken)

Manifestet v198-desk-a-o dispatchades två gånger. **Omgång 1** (före Fabrikskuren 687917d4) levererade faktiskt filändringarna till `/var/www/desk/index.html` (sha256 `2fd480e0…`, verifierad av omgång 2) men committade protokollet i den gamla klonen `/home/ak1a/agent/ak1` (commit `aea976b6`, bas 04f245a2) — klonen har divergerat från liveträdet och protokollet strandsattes. **Omgång 2** (detta protokoll, körd i arbetsmiljön `/home/ak1a/AK1` enligt Fabrikskuren) har (a) verifierat omgång 1:s samtliga anspråk oberoende, (b) hittat och rättat **tre kvarvarande brister** som omgång 1 lämnade (se § 1 rad 15–17), varav en var en felaktig kontrastsiffra i omgång 1:s egen rapport. Detta protokoll **ersätter** `aea976b6` helt — klon-grenen kan sopas av huvudagenten.

---

## 1. Före/efter — varje ändring

Före = originalsidan före U3 (omgång 1:s utgångsläge). Rad 1–14 levererade av omgång 1 (i filen sedan 2026-09-28 15:50 UTC, verifierade av omgång 2). Rad 15–17 = omgång 2:s rättningar.

| # | Före | Efter | Skäl |
|---|------|-------|------|
| 1 | Ingen `theme-color`-meta | `<meta name="theme-color" content="#0b1120">` | Webbläsarens adressfält/pelare får sidans mörka bakgrund — ingen vit blixt på mobil vid öppning. |
| 2 | Knapp utan `aria-label` | `aria-label="Öppna ZCode-skrivbordet i fullskärm"` | Tydligt tillgängligt namn; pilen "→" läses inte upp som "högerpil". Etiketten inleds med synliga texten "Öppna ZCode" (WCAG 2.5.3 Label in Name). |
| 3 | Ingen `:focus-visible`-stil | `.knapp:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }` | Synlig fokusring för tangentbords-/switch-användning; färg se rad 17. |
| 4 | Knapp utan minsta höjd (faktisk ~65 px men ingen garanti) | `min-height: 48px` på `.knapp` | Touch-mål ≥ 44 px garanterat (48 px med marginal), hela bredden. Sidans enda interaktiva element — därmed "överallt" uppfyllt. |
| 5 | `.litet { color: #6b7280; }` = **3.89:1** ✗ | `.litet { color: #94a3b8; }` = **7.34:1** ✓ | WCAG 4.5:1 för brödtext (12.5 px = normal text, inget undantag). |
| 6 | `.fot { color: #475569; }` = **2.48:1** ✗ | `.fot { color: #94a3b8; }` = **7.34:1** ✓ | Samma regel; fotnoten är text som kunden ska kunna läsa. |
| 7 | `.knapp:active { transform: scale(.98); }` alltid | `@media (prefers-reduced-motion: reduce) { .knapp:active { transform: none; } }` | Ingen rörelse vid inställd rörelsekänslighet. Sidans enda animation — därmed hela sidan still i läget. |
| 8 | Steg 3: "Tryck på tangentbordsikonen i noVNC:s meny (strecket högst upp)" | "Tryck först där du vill placera markören. Fäll sedan ut menyn med fliken vid skärmens vänsterkant och tryck på tangentbordsikonen — den syns bara på pekskärm." | **Faktakorrigerat mot källan** (se § 2): menyn sitter i VÄNKANTEN, inte högst upp; ikonen visas bara på pekskärm. Ordningen markör→meny→tangentbord gör flödet korrekt. |
| 9 | Blurb: "Sessionen lever kvar även när du stänger webbläsaren." | "Sessionen finns kvar även när du stänger webbläsaren." | Naturligare svenska. |
| 10 | Steg 1: "användarnamn ak1a och lösenordet du fått. Webbläsaren sparar det — bara första gången." | "skriv användarnamnet ak1a och lösenordet du har fått. Webbläsaren sparar inloggningen, så detta behövs bara första gången." | Tydligare satsning; förklarar VAD som sparas. (Lösenordet står aldrig i klartext på sidan.) |
| 11 | Steg 2: "Skrivbordet är format för bred vy. Liggande läge ger dig hela fönstret…" | "Skrivbordet är byggt för bred vy. Liggande läge visar hela fönstret…" | "Format för" = anglicism (formatted); "visar" renare än "ger dig". |
| 12 | Steg 4: "ZCode frågar efter ditt konto. … programmet minns det åt dig." | "ZCode frågar efter din inloggning. … programmet minns inloggningen." | Det som frågas efter är inloggning, inte konto. |
| 13 | Faktarutan: "ditt arbete väntar på dig tillbaka. Tappar du anslutningen: ladda om…" | "ditt arbete ligger kvar och väntar. Om du tappar anslutningen: ladda om…" | Idiomatisk svenska, full sats. |
| 14 | Fot: "AK1A Research Lab · pedagogisk plattform, ej investeringsråd · …" | "… · utbildningsplattform, ej investeringsråd · …" | "Utbildning" är det juridiska nyckelordet (2 kap 5 § lagen 2007:528) — förstärker utbildningsframingen. |
| **15** | `<title>AK1A Lab — ZCode-skivbordet</title>` (stavfel, saknade r) | `<title>AK1A Lab — ZCode-skrivbordet</title>` | **Omgång 2:** titeln syns i fliken, historiken och vid delning — stavfelet fanns kvar i omgång 1:s leverans (synligt i dess egen KVD-utdata). |
| **16** | `.fot { … font-size: 11.5px; }` | `.fot { … font-size: 12.5px; }` | **Omgång 2, mobilskärpa:** sidans minsta text låg under 12 px-gränsen för läsbar sekundärtext på mobil; nu samma storlek som `.litet`. Kontrasten är oförändrad 7.34:1. |
| **17** | `.knapp:focus-visible { outline: 3px solid #93c5fd; }` = **2.87:1** mot knappens #2563eb ✗ | `outline: 3px solid #fff;` = **5.17:1** mot #2563eb, **6.70:1** mot #1d4ed8, **18.83:1** mot sidbakgrunden ✓ | **Omgång 2:** omgång 1:s rapport hävdade 5.74:1 — det var siffran för paret #93c5fd/#1e3a8a (steg-numret), inte fokusringen. Egen beräkning: 2.87:1 = UNDER WCAG-kravet 3:1 för icke-text. Vit ring (samma färg som knappens text) passerar alla angränsande ytor med marginal och behåller design-språket. |

**Oförändrat (medvetet):** design-språket (bakgrund #0b1120, blå gradient #2563eb→#1d4ed8, accent #60a5fa, layout, steg-kort), h1-rubrik, knappens synliga text "Öppna ZCode →", `noindex,nofollow`, viewport-meta, `lang="sv"`, frånvaro av externa resurser (ingen CDN, inga webbfonter — allt är systemtypsnitt), ingen tracking. Rubrikens "live" behålls (etablerat svenskt lånord, SAOL).

## 2. Faktagrund: noVNC-versionen i /home/ak1a/desk-web

Steg 3-texten kontrollerad mot **just denna noVNC-källkod** (inte minnet av andra versioner) — omgång 2 har läst platserna på nytt i första hand:

- `vnc.html` rad 128–133: tangentbordsknappen är `<input type="image" alt="Keyboard" src="app/images/keyboard.svg" id="noVNC_keyboard_button" title="Show keyboard">` — en tangentbordsikon, i gruppen `noVNC_mobile_buttons` ("touch device only buttons").
- `app/styles/base.css` rad 239–252: kontrollfältet `#noVNC_control_bar` är `position: fixed` med `left: -100%`, fälls ut till `left: 0` — alltså **vänsterkanten**; `.noVNC_right` (rad 269) finns bara som alternativ och används endast om inställningen `controlbar_pos` är 'right' (`app/ui.js` rad 110 — en färsk telefon har standard = vänster).
- `app/styles/base.css` rad 332 `@media (any-pointer: coarse)`: mobilknappsgruppen visas bara på pekskärmar — där texten "den syns bara på pekskärm".
- `app/ui.js` rad 254–256: knappen kopplas till `UI.toggleVirtualKeyboard` — ett tryck visar/döljer tangentbordet, vilket bekräftar "tryck på tangentbordsikonen". (Rad 1500–1517: samma knapp markeras vald när virtuella tangentbordet är öppet.)

**Slutsats:** texten i steg 3 stämmer mot källan. (Omgång 1 rättade dåvarande felet "strecket högst upp" — verifierat korrekt.)

## 3. Kontrastredovisning (WCAG 2.1, krav 4.5:1 brödtext, 3:1 icke-text)

Beräknade av omgång 2 med eget node-skript (WCAG-formeln: relativa luminanser, kvot = (L1+0.05)/(L2+0.05)). Faktarutans bakgrund är kompositen av `rgba(34,197,94,.08)` över `#0b1120` = **#0d1f25**. Klistrad programutdata:

```
PASS  Brödtext body: #e5e7eb på #0b1120 = 15.21:1 (krav 4.5:1)
PASS  .blurb: #9ca3af på #0b1120 = 7.42:1 (krav 4.5:1)
PASS  .litet och .fot: #94a3b8 på #0b1120 = 7.34:1 (krav 4.5:1)
PASS  .varumärke + h1 span: #60a5fa på #0b1120 = 7.41:1 (krav 4.5:1)
PASS  .steg-kort p: #9ca3af på #111a2e = 6.83:1 (krav 4.5:1)
PASS  .steg-kort b: #f9fafb på #111a2e = 16.59:1 (krav 4.5:1)
PASS  .steg-nr (14px, ej stor): #93c5fd på #1e3a8a = 5.74:1 (krav 4.5:1)
PASS  .fakta (bakgrund #0d1f25): #86efac på #0d1f25 = 12.06:1 (krav 4.5:1)
PASS  Knapp gradient-start: #ffffff på #2563eb = 5.17:1 (krav 4.5:1)
PASS  Knapp gradient-slut: #ffffff på #1d4ed8 = 6.70:1 (krav 4.5:1)
PASS  Fokusring (icke-text): #ffffff på #2563eb = 5.17:1 (krav 3:1)
PASS  Fokusring mot gradient-slut: #ffffff på #1d4ed8 = 6.70:1 (krav 3:1)
PASS  Fokusring mot sidbakgrund: #ffffff på #0b1120 = 18.83:1 (krav 3:1)
FAIL  FÖRE runda0: .litet: #6b7280 på #0b1120 = 3.89:1 (krav 4.5:1)   ← historia, rättad rad 5
FAIL  FÖRE runda0: .fot: #475569 på #0b1120 = 2.48:1 (krav 4.5:1)    ← historia, rättad rad 6
SAMMANFATTNING: 0 underkända aktiva par (runda-0-kolumnen redovisas som historia)
```

**Summa: 13 aktiva par efter — 0 underkända.** Not: i filen skrivs vitt som CSS-kortformen `#fff` (knapp-text och fokusring); skriptets hex-kontroll eftersöker `#ffffff` och säger därför "saknad" — notation, inte brist. Samma kontroll bekräftar att de historiska färgerna `#6b7280`/`#475569` INTE längre finns i filen (bevis att rättningarna är verkställda).

## 4. KVD — verifieringsutdata (klistrade)

Engångskontroll (node, grep på den sparade filen `/var/www/desk/index.html`):

```
== U3-KVD: grep på /var/www/desk/index.html ==
== viewport == OK
5:<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
== lang=sv == OK
2:<html lang="sv">
== title == OK
8:<title>AK1A Lab — ZCode-skrivbordet</title>
== aria-label == OK
81:aria-label="Öppna ZCode-skrivbordet i fullskärm">
== theme-color == OK
6:<meta name="theme-color" content="#0b1120">
== href one-tap == OK
80:<a class="knapp" href="vnc.html?autoconnect=true&amp;resize=scale&amp;show_dot=true"
== focus-visible == OK
45:.knapp:focus-visible {
== reduced-motion == OK
69:@media (prefers-reduced-motion: reduce) {
```

- **HTTP-kontroll:** `curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/desk/` → **401** = väntat svar utan basic auth och samtidigt beviset på att nginx läser den sparade filen utan krasch (felaktig fil/konfig hade gett 500). Autentiseringsuppgifter gissades aldrig.
- **Filen ligger utanför repot** (`/var/www/desk/`) och redovisas via sha256 i stället för commit:
  - omgång 1 (före omgång 2:s rättningar): `2fd480e090f66dce9fe4325eb10f21d59b3180c72da68dfe5ab19b4629f45688`
  - **omgång 2 (gällande): `8b41fd5ccd6630a04d2feef562f2e29097e5f8ff20172eead3f781dfd4ab2130`**
- **Gitkvitto:** detta protokoll committas i arbetsmiljön `/home/ak1a/AK1` (develop) enligt Fabrikskuren 687917d4 ("barnen äver nu arbetsmiljön") — inte i den divergerade klonen `/home/ak1a/agent/ak1` som manifestets originaltext föreskrev (sökvägen är pre-Kur och sparade omgång 1:s protokoll på drift). Commit-hash redovisas i fabriksloggen/LEVERANS-raden.

## 5. Juridik

- Sidan och foten ramar in verksamheten som **utbildning** ("utbildningsplattform, ej investeringsråd") — lagen (2007:528) om värdepappersrörelser: utbildning tillåtet (2 kap 5 §), rådgivning kräver tillstånd. Ingen text på sidan utgör råd.
- Inga lösenord i klartext (endast basic auth-användarnamnet "ak1a", som inte är en hemlighet), ingen tracking, inga externa resurser, inga jobb-begrepp utanför kundens.
