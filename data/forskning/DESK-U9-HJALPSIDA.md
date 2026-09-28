# DESK-U9 — Svensk hjälpsida: all klickhjälp samlad på ett ställe

**Våg:** v202-u2 (agentfabrik, BYGGARE) · **Datum:** 2026-09-28
**Uppdrag:** bygg `/var/www/desk/hjalp.html` (ak1a-ägd yta, ny fil) + länka från
`/var/www/desk/index.html` med EN diskret "Hjälp →"-länk i sidhuvudet.
**Föräldradokument:** desk-kedjan — DESK-U2-MOBILFELJAKT (fynd F1, F5, F6, F7),
DESK-U2B-CTRLNOLL (Återställ zoom-knappen), DESK-U3-ATERANSLUTNING (auto-
återanslutningens beteende), DESK-U3-LANDNING-FORBATTRAD/u199 (landningens
aktuella texter som hjälpsidan speglar).

---

## 1. Syfte

Kundens resa landning → ström → inloggning → chatt har sex kända snubbelstenar
(spridda över landningens steg + fakta-ruta): klick svåra i liten vy,
tangentbordsgrejen, nyp-zoom-fällan, 5-min-regeln, "varför z.ai" och
återanslutning. Hjälpsidan samlar **lösningarna** sökbart på en sida — samma
mörka AK1A-designspråk som landningen, Du-form, korta stycken, inga externa
resurser, ingen spårning, inget lösenord i källan.

## 2. Routingfynd (viktigt för efterlevnad — ärligt redovisat)

Uppdraget pekar ut `/var/www/desk/hjalp.html`. nginx verklighet
(sites-available/ak1a:21-29, läst, orörd):

- `location = /desk/` (exakt) serverar `/var/www/desk/index.html` statiskt —
  **endast** URI:n `/desk/` exakt.
- `location /desk/` (prefix) proxas till websockify på 127.0.0.1:6080 vars
  webbrot är **`/home/ak1a/desk-web/`** (processkommandorad läst) — därför
  levererar `/desk/vnc.html` från desk-web.

⇒ `/desk/hjalp.html` med auth serveras från desk-web, inte från /var/www/desk.
**Åtgärd:** kanonisk fil levererad i `/var/www/desk/hjalp.html` enligt uppdraget
+ byte-identisk serverande kopia i `/home/ak1a/desk-web/hjalp.html` (ny fil,
unik name — noll kollision med pågående desk-web-leveranser; u3-strömagentens
ytor orörda). Utan kopian skulle Hjälp-länken ge 404 hos kunden med auth.
Back-länken på hjälpsidan pekar därför på `/desk/` (exakt URI) — inte
`index.html`, som proxas till websockify och 404:ar (mätt).

## 3. Leveransyta (ak1a-ägd, ej git-repo — spårbarhet via sha256)

| Fil | roll | sha256 |
|---|---|---|
| `/var/www/desk/index.html` | ändrad (före `952d518acb88…e247c5`) | `44e01b70b31d9eac152ea9589234e117a895a42acf8481830d134b765675bcce` |
| `/var/www/desk/hjalp.html` | NY, kanonisk | `1df68231048f2c9ab2cc9c5fdbef400445b0bfeacafb1ea99c1e6beb70a7d4e1` |
| `/home/ak1a/desk-web/hjalp.html` | NY, serverande kopia (identisk) | `1df68231048f2c9ab2cc9c5fdbef400445b0bfeacafb1ea99c1e6beb70a7d4e1` |

## 4. Innehåll — sex avsnitt (Du-form, speglar belagda lösningar)

1. **Trycka lättare när allt känns för litet** — vrid liggande; webbläsarens
   zoom-knappar +/− (Safari: aA, Chrome: ⋮ → Zoom); skrivbordets egen storlek
   är förinställd (resize=scale, defaults.json belagt) — zooma inte inne i bilden.
2. **Tangentbordet i telefonen** — markör först; menyn från strecket i VÄNSTRA
   kanten (U2 F7); tangentbordsikonen syns bara på pekskärm (vnc.html:130-133);
   extraknapparna Ctrl/Tab/Esc i samma meny.
3. **Texten blev för stor — eller för liten** — knappen **Återställ zoom
   (Ctrl+0)** i extraknappspanelen (U2B:s leverans, vnc.html:159-176).
4. **Inloggningen — och varför z.ai?** — z.ai = kontot bakom Z-Code, samma
   konto som på datorn, inget nytt konto; Google eller e-post; länken gäller
   5 minuter; Waiting för länge ⇒ Cancel → Logga in igen; första dörren =
   webbläsarrutan med användarnamnet ak1a + lösenordet man fått (lösenord
   ALDRIG i källan — U2 F6:s mjukare formulering om att rutan kan komma igen).
5. **Tappade anslutningen** — auto-återanslutning "Återansluter… (försök N)"
   pågår tills det lyckas (U3:s leverans); annars ladda om + tryck Öppna ZCode;
   sessionen lever kvar på servern.
6. **Varning: nypa inte med två fingrar!** (röd varningskort) — nypgesten
   zoomar appens text, inte vyn (U2 F1, core/rfb.js belagt); kur = Återställ
   zoom (Ctrl+0); förstora hellre med webbläsarens zoom.

Dessutom: "← Startsida" i sidhuvudet, primärknapp "Öppna ZCode →" (samma
URL-parametrar som landningen) + foten med utbildningsdisclaimern, ordagrant
som landningen.

## 5. Före/efter-diff — index.html (hela ändringen)

```diff
--- före (952d518a…)	2026-09-28
+++ efter (44e01b70…)	2026-09-28
@@ -29,6 +29,15 @@
   }
   .varumärke .prick { width: 10px; height: 10px; border-radius: 50%;
     background: #22c55e; box-shadow: 0 0 8px #22c55e; }
+  .sidhuvud { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 28px; }
+  .sidhuvud .varumärke { margin-bottom: 0; }
+  .hjalp-lank {
+    display: inline-flex; align-items: center; min-height: 44px;
+    color: #93c5fd; font-size: 13.5px; font-weight: 600;
+    text-decoration: none; letter-spacing: .5px; padding: 0 2px;
+  }
+  .hjalp-lank:hover { text-decoration: underline; }
+  .hjalp-lank:focus-visible { outline: 3px solid #fff; outline-offset: 3px; border-radius: 6px; }
   h1 { font-size: clamp(26px, 6.5vw, 34px); font-weight: 700; line-height: 1.2; }
@@ -69,7 +78,10 @@
 <body>
 <div class="wrap">
-  <div class="varumärke"><span class="prick"></span> AK1A Lab</div>
+  <div class="sidhuvud">
+    <div class="varumärke"><span class="prick"></span> AK1A Lab</div>
+    <a class="hjalp-lank" href="hjalp.html">Hjälp →</a>
+  </div>
   <h1>Ditt ZCode-<br><span>skrivbord</span> live</h1>
```

Diskret placering till höger om varumärket, tryckyta ≥44 px höjd, fokusmarkering
som landningens knappar, kontrast #93c5fd på #0b1120 (klart över WCAG AA).

## 6. KVD (allt mätt 2026-09-28 ~20:44 lokal tid)

| Kontroll | Resultat |
|---|---|
| (a) `curl -k https://localhost/desk/` utan auth | **401** (VÄNTAT — auth-porten intakt) |
| (a) `curl -k https://localhost/desk/hjalp.html` utan auth | **401** (VÄNTAT — auth krävs även för hjälpsidan) |
| (a) websockify direkt `http://127.0.0.1:6080/hjalp.html` | **200**, `Content-type: text/html`, body sha256 = filens (byte-identisk) |
| (b) html-grundkontroll index.html | `lang="sv"` ✓ · viewport ✓ · `<title>AK1A Lab — ZCode-skivbordet</title>` ✓ |
| (b) html-grundkontroll hjalp.html | `lang="sv"` ✓ · viewport ✓ · `<title>AK1A Lab — Hjälp</title>` ✓ |
| (b) externa resurser/spårning (grep src/href http(s)://, analytics, gtag m.m.) | **0 träffar** i båda filerna — allt inline, ingen spårning |
| (c) före/efter-diff index.html | se §5 — två punkter: CSS-block + sidhuvuds-wrapper, inget annat rört |
| Lösenord i källan | **nej** — endast "lösenordet du har fått" (samma formulering som landningen) |
| Juridik | sidan innehåller ingen finansiell text; footerns utbildningsframing kvar (2007:528: utbildning, ej rådgivning) |

## 7. Framtida förslag (EJ utfört — bokas till KO)

- **En enda filhem**: root-ägd nginx-rule `location ~ ^/desk/(index|hjalp)\.html$`
  med `root /var/www` skulle ta bort behovet av desk-web-kopian. Rör `/etc/nginx`
  = utanför fabrikens ägarskap; lämnas som förslag tills KO beslutar.
- Ev. länk till hjälpsidan OCKSÅ från noVNC:s fel/återanslutningsöverlägg
  (app/ui.js) — u3-strömagentens yta denna omgång, ej rört.
