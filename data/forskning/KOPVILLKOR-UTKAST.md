# KOPVILLKOR-UTKAST — ångerrätt och distansavtalsposter för köpflödet

**Status: UTKAST — implementeras INTE denna våg.** Ny rutt/kod för köpflödet
väntar på kundens pris-beslut (R2: priser och portföljmotorens nivåer 249/449/799
kr väntar kund). Detta dokument är säljberedskap: när beslutet kommer finns
posterna färdiggranskade här. Uppdrag v207-u2 (fabrik, 2026-09-29).

## Bakgrund

`/villkor` (användarvillkoren) lever sedan tidigare med fullständig
ångerrättssektion (sektion 6: 14 dagar enligt 2 kap. 10 § lagen 2005:59,
undantaget för påbörjad digital leverans enligt 2 kap. 11 § första stycket
11 p., samtyckeskryss-rutinen och 90 dagars nöjd-kund-garantin med betalning
först dag 90). Det som saknas är de **konkreta poster som köpflödet
(checkout-yta + orderbekräftelse) ska bära** när försäljningen aktiveras.
Detta utkast listar dem. Utkastet ändrar inga priser och skapar ingen rutt.

## Lagrum och poster (per 2005:59)

### A. Information före köpet (checkout-ytan)

1. **Ångerrättsinformation** — att konsumenten har 14 dagars ångerrätt från
   avtalets ingående, villkoren för och användning av rätten samt det
   standardformulär för utövande av ångerrätt som följer av lagen (2005:59)
   och dess bilagor (länk + bilagd kopia i orderbekräftelsen).
2. **Undantagsvarning digitalt innehåll** — tydlig text nära kryssrutan (se C):
   på samtycke till omedelbar leverans under ångerfristen upphör ångerrätten
   när leveransen påbörjats (2 kap. 11 § första stycket 11 p.).
3. **Väsentliga avtalsvillkor** — pris inkl. moms, åtkomstperiod (12 månader),
   sättet för tillhandahållande, betalningsgång enligt nöjd-kund-garantin
   (betalning först dag 90), reklamation och tvistlösning (ARN, hemvist-
   domstol) — speglar redan publicerat på `/villkor` sektion 5, 6 och 12.

### B. Orderbekräftelsen (e-post direkt efter köp)

4. Bekräftelse på avtalet + bekräftelse på konsumentens **uttryckliga
   samtycke** till omedelbar digital leverans (parallellt med samtyckes-
   kryss-rutinen på ytan) — de tre villkoren i 2 kap. 11 §: (i) påbörjad
   leverans, (ii) uttryckligt samtycke + medvetenhet om att ångerrätten
   upphör, (iii) bekräftelse mottagen.
5. Standardformuläret för ångerrätt, i den utsträckning samtycke till
   omedelbar leverans ej lämnats (annars skäl varför rätten upphört).
6. Kontaktväg för frågor: info@ak1nvestor.com.

### C. Samtyckeskryss-rutinen (kod, nästa våg)

7. Opåkallad, ej förkryssad, separat kryssruta i stil med villkorens
   redan publicerade lydelse: *"Jag samtycker till omedelbar åtkomst och
   förstår att ångerrätten därmed går förlorad"* — köpknappen förblir låst
   tills rutan är ikryssad (aktiv handling = uttryckligt samtycke).
8. Samtycke + tidsstämpel sparas tillsammans med ordern som bevis.

### D. Interaktion med 90 dagars nöjd-kund-garantin

9. Garantin är **frivillig förmån utöver lagen** och inskränker aldrig
   ångerrätten — det står redan i `/villkor` sektion 6 och ska stå kvar.
10. **Oavgiftsavveckling (2 kap. 14 §):** informerar AK1A om en utökad
    ångerrätt (garantitiden om den marknadsförs som utökad ångerrätt) får
    ingen avgift tas ut för att fullgöra ångerrätten under den utökade
    fristen — villkorstexten måste därför kalla garantin just *garanti/
    nöjd-kund-åtagande*, inte "utökad ångerrätt", om avgiftsfrågan ska
    förbli oberoende. **Kund/jurist beslutar slutlig karaktärsbenämning
    (R2-juridik).**
11. Återbetalning vid utövad ångerrätt (där den lever): inom 14 dagar,
    samma betalsätt (Stripe).

## Nästa våg — implementeringschecklista (vid kundens pris-beslut)

- [ ] Checkout-yta: poster A1–A3 + C7–C8.
- [ ] Orderbekräftelsemall: poster B4–B6.
- [ ] E-postmeddelande mottagande + samtyckeslogg i databasen.
- [ ] `/villkor` sektion 5–6 auditoras mot det byggda flödet (en sanning).
- [ ] Tsc 0, bygg under `/tmp/ak1a-deploy.lock`, gränsnittsvakten grön,
      prod 200 på nya ytor.

Källor: `src/app/(huvud)/villkor/page.tsx` (sektion 5–6), juridikgrinden
(`.zcode/skills/juridikgrind/SKILL.md`), lagen (2005:59).
INGA priser satta i detta utkast — R2.
