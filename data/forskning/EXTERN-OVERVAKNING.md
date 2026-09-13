# EXTERN ÖVERVAKNING — kundens steg-för-steg

**Våg 122B · Styrelsebeslut mtzou25g åtgärd 2 · 2026-09-13**

---

## VARFÖR detta behövs (kort förklaring)

AK1A:s bevakning (pulsvakten, gränsnittsvakten, AI-styrelsens ronder) körs
**på servern själv**. Det fungerar utmärkt — ända tills servern helt tystnar
(strömavbrott, nätverksfel, krasch). Då tystnar alla larm med den: **en server
kan inte larma om sig själv.**

Lösningen är en liten bevakning **utanför servern** som kollar sajten var
5:e minut och skickar mejl till dig om den inte svarar. Plattformen på vår
sida är REDAN byggd och klar — det enda som återstår är att du skapar ett
gratis konto och kopplar ihop det. Det tar cirka 10 minuter.

> **Viktigt:** kontot hos bevakningstjänsten och vilken e-post som får larmen
> är **ditt beslag** (styrelseregel R2 — vi skapar aldrig konton eller delar
> ut e-postadresser åt dig). Nedan är ditt recept.

---

## STEG 1 — Skapa ett gratis konto (3 minuter)

1. Öppna **uptimerobot.com** i din webbläsare (valfri bevakningstjänst fungerar,
   men beskrivningen här följer UptimeRobot).
2. Klicka på **Sign up for FREE**.
3. Ange din e-post och ett lösenord — **använd din egen e-post** (dit larmen ska).
4. Bekräfta mejlet som kommer.

## STEG 2 — Skapa bevakningen (2 minuter)

1. När du är inloggad: klicka **Add New Monitor**.
2. Välj typ **HTTP(s)**.
3. Klistra in denna adress (friendly name kan du själv välja, t.ex. "AK1A"):

   ```
   https://lab.ak1nvestor.com/api/overvaking/status
   ```

4. Ställ **Monitoring Interval** på **5 minutes**.
5. Klicka **Create Monitor**.

Adressen är en liten direktöppning som alltid svarar `ok` så länge sajten
lever — den är byggd exakt för bevakning: snabb, fri från persondata och
cachas aldrig. **Klart — du får nu mejl om sajten går ner.**

## STEG 3 — Mejl-larm (1 minut, oftast redan på)

1. Gå till **Alert Contacts** (vänstermenyn).
2. Kontrollera att din e-post står där med **Active** — lägg annars till den.
3. Kontrollera att din bevakning (från steg 2) skickar till den kontakten.

## STEG 4 — VALFRITT: låt även AI-sessionen larmas automatiskt

Stegen 1–3 ger mejl till dig. Vill du dessutom att din AI-session i studion
ska få larmet automatiskt (så att nästa session ser vad som hänt även om du
missar mejlet), gör så här — **endast en gång**:

**A. Skapa en hemlig token.** Det är ett långt slumpmässigt lösenord som bara
du och sajten känner till. Öppna Terminalen (Termius mot servern) och kör —
du får en slumpmässig rad tillbaka, kopiera den:

```bash
openssl rand -hex 24
```

**B. Lägg tokenen i serverns miljöfil.** Kör i Terminalen — klistra in DIN
token där det står DINTOKEN (inga mellanslag runt likhetstecknet):

```bash
cd /home/ak1a/AK1
echo "OVERVAKNING_TOKEN=DINTOKEN" >> .env
pm2 restart ak1a
```

*(Vi rör aldrig .env-filen åt dig — nycklar är ditt område. Kommandot ovan
lägger bara till en rad i slutet av filen.)*

**C. Koppla webhooken i UptimeRobot.**

1. Gå till **My Settings → Webhooks** (eller Alert Contacts → Add New
   Contact → Webhook, beroende på version).
2. Lägg in denna URL — byt ut DINTOKEN mot samma token som i steg B:

   ```
   https://lab.ak1nvestor.com/api/overvaking/larm?token=DINTOKEN
   ```

3. Spara. Testa gärna med **Test webhook** om knappen finns.

**Hur det fungerar:** när sajten går ner anropar UptimeRobot vår mottagare,
som kontrollerar att tokenen stämmer och skriver en rad i serverns
larmlogg (`data/vakten/externa-larm.log`). Där plockar AI-sessionen upp den.
Tills du gjort steg B är mottagaren **stängd** — den svarar bara "ej
konfigurerad", vilket är säkrast.

---

## Bra att veta

- **Kostnad:** gratis-nivån på UptimeRobot räcker gott (bevakning var 5:e
  minut, mejl-larm).
- **Tystnad = allt väl:** tjänsten hör bara av sig vid problem.
- **Hur vi talar om tillgänglighet:** AK1A utlovar **hög tillgänglighet med
  planerat underhåll** — aldrig "100 % online" (sanning enligt beslutets
  åtgärd 10).
- **Vad loggas:** bara tidpunkt, bevakningens namn och en krypterad kortkod
  för avsändaren — aldrig råa IP-adresser eller persondata (GDPR).
- Byte av bevakningstjänst? Adressen i steg 2 fungerar överallt; webhooken
  (steg 4) likaså — principen är densamma hos alla leverantörer.

---

*Teknisk dokumentation: `src/app/api/overvaking/status/route.ts` (publik
status), `src/app/api/overvaking/larm/route.ts` (webhook-mottagare),
`src/lib/overvaking.ts` (helper). Fråga AI-sessionen i studion om något
strular — full åtkomst finns.*
