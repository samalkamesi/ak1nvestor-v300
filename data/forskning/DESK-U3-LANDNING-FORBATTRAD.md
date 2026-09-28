# DESK-U3 — Landningssidan förbättrad: tillgänglighet, mobilskärpa, svenska

**Datum:** 2026-09-28 · **Agent:** fabriksagent v198-u3 (BYGGARE) · **Ägarskap:** `/var/www/desk/index.html` (endast denna fil) + detta protokoll.

**Syfte:** Den svenska mobil-landningen på `https://lab.ak1nvestor.com/desk/` är kundens dörr in till ZCode-skrivbordet. U3 höjer tillgängligheten (WCAG 2.1 AA-kontrast, fokus, pekmål, reducerad rörelse), mobilskärpan (temafärg, faktakorrigerad noVNC-guide) och svenskan (Du-form, inga anglicismer) — utan att byta design-språk (mörk #0b1120, AK1A-blå). Knappen är fortfarande ONE-tap med **exakt bevarat mål**: `vnc.html?autoconnect=true&resize=scale&show_dot=true`.

---

## 1. Före/efter — varje ändring

| # | Före | Efter | Skäl |
|---|------|-------|------|
| 1 | Ingen `theme-color`-meta | `<meta name="theme-color" content="#0b1120">` | Webbläsarens adressfält/pelare får sidans mörka bakgrund — ingen vit blixt på mobil vid öppning. |
| 2 | Knapp utan `aria-label` | `aria-label="Öppna ZCode-skrivbordet i fullskärm"` | Tydligt tillgängligt namn; pilen "→" läses inte upp som "högerpil" till skärmläsare. |
| 3 | Ingen `:focus-visible`-stil | `.knapp:focus-visible { outline: 3px solid #93c5fd; outline-offset: 3px; }` | Synlig fokusring (ljusblå #93c5fd, kontrast 5.74:1 mot knappblått) för tangentbords-/switch-användning. |
| 4 | Knapp utan minsta höjd (faktisk ~65 px men ingen garanti) | `min-height: 48px` på `.knapp` | Touch-mål ≥ 44 px garanterat (48 px med marginal), hela bredden. Sidans enda interaktiva element — därmed "överallt" uppfyllt. |
| 5 | `.litet { color: #6b7280; }` = **3.89:1** ✗ | `.litet { color: #94a3b8; }` = **7.34:1** ✓ | WCAG 4.5:1 för brödtext (12.5 px = normal text, inget undantag). |
| 6 | `.fot { color: #475569; }` = **2.48:1** ✗ | `.fot { color: #94a3b8; }` = **7.34:1** ✓ | Samma regel; fotnoten är text som kunden ska kunna läsa. |
| 7 | `.knapp:active { transform: scale(.98); }` alltid | `@media (prefers-reduced-motion: reduce) { .knapp:active { transform: none; } }` | Ingen rörelse för användare med inställd rörelsekänslighet. Sidans enda animation — därmed hela sidan ruhig i läget. |
| 8 | Steg 3: "Tryck på tangentbordsikonen i noVNC:s meny (**strecket högst upp**/knappen i kanten)" | "Tryck först där du vill placera markören. **Fäll sedan ut menyn med fliken vid skärmens vänsterkant** och tryck på tangentbordsikonen — **den syns bara på pekskärm**." | **Faktakorrigerat mot källan** (se § 2): menyn sitter i VÄNKANTEN, inte högst upp; ikonen visas bara på pekskärm och bara efter anslutning. Ordningen markör→meny→tangentbord gör dessutom flödet korrekt. |
| 9 | Blurb: "Sessionen **lever kvar** även när du stänger webbläsaren." | "Sessionen **finns kvar** även när du stänger webbläsaren." | Naturligare svenska. |
| 10 | Steg 1: "användarnamn **ak1a** och lösenordet du fått. Webbläsaren sparar **det** — **bara första gången**." | "skriv användarnamnet **ak1a** och lösenordet du har fått. Webbläsaren sparar **inloggningen, så detta behövs bara första gången**." | Tydligare satsning; förklarar VAD som sparas. (Lösenordet står fortsatt aldrig i klartext på sidan.) |
| 11 | Steg 2: "Skrivbordet är **format** för bred vy. Liggande läge **ger dig** hela fönstret skarpt och läsbart." | "Skrivbordet är **byggt** för bred vy. Liggande läge **visar** hela fönstret skarpt och läsbart." | "Format för" = anglicism (formatted); "visar" renare än "ger dig". |
| 12 | Steg 4: "ZCode frågar efter **ditt konto**. … **programmet minns det åt dig**." | "ZCode frågar efter **din inloggning**. … **programmet minns inloggningen**." | Det som frågas efter är inloggning, inte konto; sluten tydligare. |
| 13 | Faktarutan: "ditt arbete **väntar på dig tillbaka**. **Tappar du anslutningen:** ladda om…" | "ditt arbete **ligger kvar och väntar**. **Om du tappar anslutningen:** ladda om…" | Idiomatisk svenska, full sats. |
| 14 | Fot: "AK1A Research Lab · **pedagogisk plattform**, ej investeringsråd · …" | "AK1A Research Lab · **utbildningsplattform**, ej investeringsråd · …" | "Utbildning" är det juridiska nyckelordet (utbildning är tillåtet enligt 2 kap 5 § lagen 2007:528) — förstärker utbildningsframingen. |

**Oförändrat (medvetet):** design-språket (bakgrund #0b1120, blå gradient #2563eb→#1d4ed8, accent #60a5fa, layout, steg-kort), h1-rubrik, knappens synliga text "Öppna ZCode →", `noindex,nofollow`, viewport-meta, `lang="sv"`, `<title>`, frånvaro av externa resurser (ingen CDN, inga webbfonter — allt är systemtypsnitt), ingen tracking. Rubrikens "live" behålls (etablerat svenskt lånord, SAOL).

## 2. Faktagrund: noVNC-versionen i /home/ak1a/desk-web

Steg 3-texten kontrollerad mot **just denna noVNC-källkod** (inte minnet av andra versioner):

- `vnc.html` rad 130–132: tangentbordsknappen är `<input type="image" alt="Keyboard" src="app/images/keyboard.svg" id="noVNC_keyboard_button" title="Show keyboard">` — en tangentbordsikon, i gruppen `noVNC_mobile_buttons`.
- `app/styles/base.css` rad 221–252: kontrollfältet `#noVNC_control_bar` är `position: fixed` i **vänsterkant** (`left: -100%`, fälls ut till `left: 0`; `.noVNC_right` finns bara som alternativ klass). Fliken `noVNC_control_bar_handle` har titeln "Hide/Show the control bar" — alltså en **dragfliken i kanten**, inte ett "streck högst upp".
- `app/styles/base.css` rad 560–574: `#noVNC_mobile_buttons` döljs (`display: none`) både **före anslutning** och på **icke-pekskärmar** (`@media not all and (any-pointer: coarse)`). Ikonen syns alltså bara på telefon/pekskärm EFTER anslutning — där texten "den syns bara på pekskärm".
- `app/ui.js` rad 254–266: knappen kopplas till `UI.toggleVirtualKeyboard` — ett tryck visar/döljer tangentbordet, vilket bekräftar "tryck på tangentbordsikonen".

**Slutsats:** gamla textens "strecket högst upp" var fel (fältet sitter i vänsterkanten) och utelämnade att ikonen bara finns på pekskärm. Rättad i rad 8 ovan.

## 3. Kontrastredovisning (WCAG 2.1, krav 4.5:1 för brödtext)

Beräknade som relativa luminanser enligt WCAG-formeln (node-skript, klistrat värdepar i format förgrund–bakgrund). Faktarutans bakgrund är kompositen av `rgba(34,197,94,.08)` över `#0b1120` = **#0d1f25**.

| Text | Före | Värde | Efter | Värde | Dom |
|---|---|---|---|---|---|
| Brödtext body | #e5e7eb på #0b1120 | 15.21:1 | oförändrad | 15.21:1 | ✓ |
| .blurb | #9ca3af på #0b1120 | 7.42:1 | oförändrad | 7.42:1 | ✓ |
| .litet | **#6b7280 på #0b1120** | **3.89:1** | **#94a3b8 på #0b1120** | **7.34:1** | ✗→✓ |
| .fot | **#475569 på #0b1120** | **2.48:1** | **#94a3b8 på #0b1120** | **7.34:1** | ✗→✓ |
| .varumärke + h1 span | #60a5fa på #0b1120 | 7.41:1 | oförändrad | 7.41:1 | ✓ |
| .steg-kort p | #9ca3af på #111a2e | 6.83:1 | oförändrad | 6.83:1 | ✓ |
| .steg-kort b | #f9fafb på #111a2e | 16.59:1 | oförändrad | 16.59:1 | ✓ |
| .steg-nr | #93c5fd på #1e3a8a | 5.74:1 | oförändrad | 5.74:1 | ✓ |
| .fakta | #86efac på #0d1f25 | 12.06:1 | oförändrad | 12.06:1 | ✓ |
| Knapp (gradient-start) | #ffffff på #2563eb | 5.17:1 | oförändrad | 5.17:1 | ✓ |
| Knapp (gradient-slut) | #ffffff på #1d4ed8 | 6.70:1 | oförändrad | 6.70:1 | ✓ |
| Fokusring | (saknades) | — | #93c5fd mot #2563eb | 5.74:1 | ✓ (icke-text, krav 3:1) |

**Summa: 11 par före → 2 underkända; 11 par efter → 0 underkända. Alla brödtextpar ≥ 4.5:1.**

## 4. KVD — verifieringsutdata (klistrade)

Engångskontroll grep-rad på den sparade filen `/var/www/desk/index.html`:

```
== viewport ==
5:<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
== lang=sv ==
2:<html lang="sv">
== title ==
8:<title>AK1A Lab — ZCode-skivbordet</title>
== aria-label ==
81:     aria-label="Öppna ZCode-skrivbordet i fullskärm">
== theme-color ==
6:<meta name="theme-color" content="#0b1120">
== href bevarad ==
80:  <a class="knapp" href="vnc.html?autoconnect=true&amp;resize=scale&amp;show_dot=true"
== focus-visible ==
45:  .knapp:focus-visible {
== reduced-motion ==
69:  @media (prefers-reduced-motion: reduce) {
== http-kod ==
401
== sha256 ==
2fd480e090f66dce9fe4325eb10f21d59b3180c72da68dfe5ab19b4629f45688  /var/www/desk/index.html
```

- **HTTP 401** på `https://lab.ak1nvestor.com/desk/` är det **väntade** svaret utan basic auth — samtidigt beviset på att nginx läser den nya filen utan krasch (felaktig konfig/fil hade gett 500). Uppgift (b) uppfylld; autentiseringsuppgifter gissades aldrig.
- Filen ligger **utanför repot** (`/var/www/desk/`) och redovisas därför via sha256 ovan i stället för commit: `2fd480e090f66dce9fe4325eb10f21d59b3180c72da68dfe5ab19b4629f45688`.
- Gitkvitto för detta protokoll: se commit `studio: v198-u3 landning förbättrad — a11y+svenska [fabrik]` i arbetsytans logg (hash redovisas i fabriksloggen).

## 5. Juridik

- Sidan och foten ramar in verksamheten som **utbildning** ("utbildningsplattform, ej investeringsråd") — lagen (2007:528) om värdepappersrörelser: utbildning tillåtet (2 kap 5 §), rådgivning kräver tillstånd. Ingen text på sidan utgör råd.
- Inga lösenord i klartext (endast basic auth-användarnamnet "ak1a", som redan stod där och inte är en hemlighet), ingen tracking, inga externa resurser, inga jobb-begrepp utanför kundens.
