// _s1u3-forsakring-commit.mjs — worklog-append + commitmsg-fil (engångs, granskarens egna ytor)
import fs from 'node:fs';

const W = `/home/ak1a/AK1/worklog.md`;
const rad = `
## SPÅR 1 s1-u3 ANDRA INSTANS (manifest auto-s1-1789804529817, 3/3) — 2026-09-19 ~10:2x lokal: FÖRSÄKRINGSAKTIER B16 KONTROLLGRANSKAD — flyttklar efter 3 rättningar; universummedianens drift vintage-bevisad

Fabriksagent s1-u3, andra instans (OMSTARTSBOKFÖRING s9-u2-D20/s10-u3-presedansen: första
instansen levererade detailhandel-KONTROLLEN och är bokförd klar i status — denna leverans
är nästa objekt, inte duplikat). PIVOT (anspråk disk-först,
data/vakten/auto-s1-1789804529817-u3-ansprak-2-instans.md): uppdragets ordagranda m9-utkast
#3 (forskningslaget) komplett sedan 09-16 14:29 — m9-serien 6/6 sedan 14:35 (8448ef77);
detailhandel levererat av första instansen (14626), flyg anspråkat + sedan levererat av
syskonomgången (d72d12c0), ABB levererat ⇒ FIFO-valet försäkring B16 (09-16 20:16, äldsta
rotguide utan granskningsartefakt; medie+livsmedel återstår av kvällsgenerationen).

Leverans: granskning/forsakringsaktier-sa-analyserar-du-forsakringsbolag-KONTROLL-2026-09-19.md
+ granskning/forsakringsaktier-sa-analyserar-du-forsakringsbolag-diff.json (nya filer;
utkast-JSON:en orörd; sond verktyg/_s1u3-forsakring-verify.mjs + diffcheck
verktyg/_s1u3-forsakring-diffcheck.cjs). DOM: FLYTTKLAR EFTER RÄTTNING — B1 (BYT, väsentligt):
"2025 var koncernens bästa år med nettoresultatet 1 998 miljoner euro" binder rekordet till
nettoresultatet men universumets egen serie är 2 107 (2022, bär Nordea-exittens
realisationsvinster) → 1 323 → 1 154 → 1 998 — 2022 är HÖGRE; kvalificeraren "sedan
Nordea-gångarna" bevarar hela normaliseringsargumentet (forward 16,2 > trailing 14,7 sant);
noteringens interna spänning ("rekordår" + "2022 bär gångar" i samma not) är källan — flagga
F4 till dataägaren. B2 (BYT): finansmedianen driven — "median 2,47 och 15,3" var VINTAGE-SANT
(byggarens KVD rad 103–104 assertade exakt dessa mot 09-16-filen och passerade) men dagens
universum (finans n=20 av 195) ger 2,57/15,5; "båda avkastar klart över mittläget" håller
ändå (24,1/19,6 > 15,5) — OBEROENDE KONFIRMERAD av syskonets flygaktier-leverans d72d12c0
("universumglidningens första rent innehållsdrivna fynd") = samma fenomenfamilj, två objekt
samma dag ⇒ flagga F3 till universumägaren (medianer beräknas om vid verkställning).
B3 (BYT): readingMinutes 2→7 (1 379 ord textrensat = 690 ord/min mot publicerade max 240;
sjunde fallet i klassen, byggd 09-16 före 09-17-domen). C1 (FÖRSLAG): If P&C-etiketten —
83,6/−0,7/1 485/+12 är SAMPO-KONCERNENS tal enligt FSR ("Sampo Group … 83.6 (84.3)"), If
P&C-segmentet 83,4 enligt Ifs SFCR (0,2 pp delta); "Sampokoncernen" föreslås bära siffrorna.
-en-spegeln Ö16 bär samtliga systerformuleringar (5 strängar maskinverifierade unika) och
speglas vid verkställning. GRÖNT: källtalsparitet 28/28 mot bolagsunivers.json (Sampo
24,1/3,38/14,7/16,2/0,35/1 998/+73 %/0,36 €/3,7 %/18,16/2,55/β 0,24; Allianz
19,6/2,47/14,6/0,51/16,7 %/136,0/33,7/17,10 €/3,8 %/55 %/11,40→17,10 = +14,5 %/år/EBT-gap
2,1 mdr; Berkshire 12,6 + serien −22,8/96,2/89,0/67,0 exakt; KO β 0,34), aritmetik 14/14,
externa källor KORSBELAGDA 2026-09-19 via oberoende webbsökning utöver byggarens
live-kontroll (Allianz CR 92,2 (93,4) + solvens 218 % — allianz.com:s egen Q2-2026-release
"+7 pp mot helåret 2025 (218 %)"; Sampo FSR 83,6 (84,3)/1 485 M€/+12 %; allianz.com-releasen
svarar 403 mot maskinell hämtning = bot-skydd, ej död länk — noterat), juridik 2007:528 ren
(26 varumärkesmönster × 3 ytor = 0 FEL, rådglossor 0, disclaimer exakt sista raden,
utbildningsgrunden i ingressen), 911 = 0/6 mönster båda språken, 17/17 interna länkar HTTP
200 mot levande sajten (kursankaret se-06-finanssektorn lever; -en länkar multiset-identiska),
struktur grön (8 H2, title 52/60, desc 154/155, 0 mjuka bindestreck). Sond: 73 OK / 0 FEL /
2 VARN (S8 readingMinutes + X1 allianz-403, båda dokumenterade). KVD: src/ orörd INGET
bygge · R2 orörd (data/blogg/ orörd; publicering = kundens beslut) · utkast-JSON:en orörd ·
syskonytor orörda (flyg-meddelandet d72d12c0 + detailhandel-KOMPLEMENTet b72daf08 lästa,
respekterade) · commit med explicit pathspec. [fabrik]
`;
fs.appendFileSync(W, rad, "utf8");
console.log("worklog appenderad:", rad.length, "tecken");

const msg = `studio: auto s1-u3 B16 FÖRSÄKRINGSGRANSKNING KONTROLL+DIFF — flyttklar efter 3 rättningar: B1 rekordbindningen ("koncernens bästa år" 1 998 M€ mot seriens 2022 = 2 107 med Nordea-gångar — kvalificerare bevarar normaliseringsargumentet) + B2 finansmedian-drift (2,47/15,3 vintage-bevisad via byggarens KVD → dagens 2,57/15,5; oberoende konfirmerad av syskonets flyg-fynd d72d12c0) + B3 readingMinutes 2→7 (sjunde fallet); C1 If P&C-etikett (FSR-tal på koncernnivå, If-segment 83,4) som förslag — källtal 28/28, aritmetik 14/14, externa källor korsbelagda (Allianz 92,2/93,4+218 %, Sampo 83,6/1 485/+12), juridik 2007:528 ren, 911 = 0, 17/17 länkar levande; -en-spegeln bär 5 maskinverifierade systersträngar; sond 73 OK/0 FEL [fabrik]`;
fs.writeFileSync("/home/ak1a/AK1/verktyg/_s1u3-forsakring-commitmsg.txt", msg, "utf8");
console.log("commitmsg skriven:", msg.length, "tecken");
