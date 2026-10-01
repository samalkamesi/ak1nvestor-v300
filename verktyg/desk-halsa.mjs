#!/usr/bin/env node
// desk-halsa.mjs — /desk-kedjans hälsa i EN kontroll (v198-u1, 2026-09-28)
//
// Bakgrund: AK1A streamar det RIKTIGA ZCode-skrivbordet till telefonen på
//   https://lab.ak1nvestor.com/desk/ — kedjan (v198/r301):
//     nginx (landning exakt /desk/ ur /var/www/desk + proxy /desk/* ->
//     127.0.0.1:6080, basic auth) -> websockify (web-rot /home/ak1a/desk-web)
//     -> Xvnc :10 + openbox (maximerar allt) + ZCode-AppImage.
//   Denna svit är agentfabrikens öga: ETT kommando som söker fel i hela
//   kedjan. Hittar den ett äkta fel => FAIL med förklaring — ALDRIG
//   nivåsänkt; rättning är EGEN fabriksuppgift, inte svitens.
//
// SKÄRMKONTRAKTET (r305-harmonisering): D2 (r301) satte 1280x720; 2026-09-28
//   18:58Z ändrades Xvnc till 1024x576 (44 % av pixlarna = snabbare ström +
//   större skalning på telefonen; kundens snabbhetsorder). Ändringen var
//   dokumenterad ENDAST som kommentar i zdesk-xvnc.service ("D2→r306") —
//   detta kontrakt följde efter i r305 så sviten mäter sanningen igen
//   (v201-u1:s STREAMFART-analys bekräftar 1024x576 som rätt dimensionerat
//   för telefon-portrait ~390 px).
//
// Kontroller (en rad per kontroll, PASS/FAIL/SKIP):
//   1. http-desk-entree    Desk-entréerna UTAN auth (DESK-U26, DESK-U30):
//                          exakt /desk (utan snedstreck) => 302 autoconnect-
//                          direktentré, /desk/start => 401 (landningens hem),
//                          /desk/h/vnc.html => 401 (ström-målet). Ersatte
//                          http-landning-401 som bar det gamla kontraktet
//                          ("exakt /desk/ => 401") och falsklarmade varje
//                          körning sedan EN-TRYCKS-direktentrén (r350-eran);
//                          DESK-U30 följde efter REN-konfigen r352 som
//                          flyttade 302:an från /desk/ till EXAKT /desk och
//                          bakade auth på hela /desk/-prefixet (föregångaren
//                          mätte /desk/ => 302 och falsklarmade skälläkaren
//                          till onödiga kundomstarter, se U30 § kundpåverkan).
//   1b. http-hjalp-401     GET /desk/hjalp.html UTAN auth => exakt 401 —
//                          U18 B4/U19 steg 6b: hjälpsidans väg (nginx-proxy
//                          till 6080) skall ligga bakom SAMMA bomm; fångar
//                          att proxy-grenen aldrig tappar auth_basic.
//   1c. http-telefon-larm-401  R352:s nya exakta ytor UTAN auth (DESK-U30):
//                          /desk/telefon.html (telefonlandningen ur web-
//                          roten) + /desk/larm.json (vakttornets larmbanner)
//                          => exakt 401 — U17 A1-klassen gäller PER serverad
//                          väg: en exakt-gren som tappar auth_basic ligger
//                          öppen; kontrollen fångar det innan kunden gör det.
//   2. systemd-enheter     systemctl is-active zdesk-xvnc zdesk-wm
//                          zdesk-zcode zdesk-novnc => fyra 'active', + sedan
//                          DESK-U28 landskapets ALLTID-PÅ-basenheter
//                          zdesk-xvnc-land zdesk-wm-land zdesk-novnc-land
//                          => sju 'active' totalt. Grund: direktentréns
//                          (kontroll 1) 302-mål streamar :11 — landskapets
//                          basenheter är kundvägens ryggrad och växlarens
//                          egna kontrakt säger "xvnc/wm/novnc på båda
//                          skärmarna lever alltid" (zdesk-vaxlare.service).
//                          APP-enheten zdesk-zcode-land bevakas MEDVETET EJ
//                          här: den startas/stoppas av växlaren per ingång
//                          och är avstängd per design — sviten härdkodar
//                          aldrig epokens app-policy (r311-lärdomen).
//   3. x-geometri          xprop -root _NET_WORKAREA med DISPLAY=:10 =>
//                          arbetsytan exakt 1024x576 (r305-kontraktet:
//                          snabbhetsorderns framebuffer, se svitens huvud).
//   4. fonstermaximering   xprop -root _NET_CLIENT_LIST + xprop -id <id>
//                          _NET_WM_STATE => MAXIMIZED_VERT _och_ HORZ på
//                          ALLA listade fönster (openbox maximerar allt);
//                          tom klientlista => SKIP (dokumenterat: kontrollen
//                          kräver ett live-mappat fönster).
//   5. http-auth-*         OM miljövariabeln DESK_AUTH='user:pass' är satt:
//                          GET /desk/ (200 + <title> innehåller
//                          'ZCode-skrivbordet'), GET /desk/vnc.html (200),
//                          GET /desk/app/ui.js (200), GET /desk/hjalp.html
//                          (200) — med basic auth. Den fjärde kontrollen är
//                          U19 steg 6b:s ("/desk/hjalp.html som fjärde
//                          http-auth-kontroll"): hjälpsidan skall ALLTID
//                          svara 200 MED auth om 1b stämmer.
//                          UTAN DESK_AUTH => SKIP x4. Lösenord GISSAS
//                          ALDRIG, hårdkodas ALDRIG, /etc/nginx/.htdesk
//                          läses ALDRIG — och DESK_AUTH-värdet loggas
//                          ALDRIG i utdata.
//   6. webrot-*            /home/ak1a/desk-web/vnc.html existerar (fs) +
//                          defaults.json är giltig JSON (JSON.parse).
//   7. landning-fil        /var/www/desk/index.html (fs): title innehåller
//                          TITEL_MARKE (samma markör som kontroll 5a —
//                          SAMORDNAT par sedan U23), inga trasiga sluttaggar
//                          ('./p>'). resize=scale på knapparna är KUNDVÄGEN
//                          sedan R318+R327 (STYRELSESLUT 2026-09-29) —
//                          bevakas INTE längre som fel.
//
// DETERMINISM: allt utom de tre HTTP-kontrollgrupperna (1/1b/1c och 5) är lokala
//   processanrop/filäsningar — deterministiska. HTTP-kontrollerna går via
//   internet mot https://lab.ak1nvestor.com/ (kundens telefonperspektiv:
//   nätverksfel/timeout ÄR ett kedjefel och FAILar ärligt; 6 s timeout per
//   anrop, tio anrop totalt (1: tre delkontrakt, 1b: ett, 1c: två, fyra auth)
//   => värstafall ~60 s, i normaldrift ~3 s). Redirecter följs EJ: varje led
//   förväntas svara exakt — kontroll 1 är den ENDA som förväntar en 3xx
//   (302-direktentrén är själva kontraktet den bevakar, DESK-U26/U30).
//
// Arkitekturnotering (mätt 2026-09-28; uppdaterad 2026-09-30 DESK-U26 efter
//   EN-TRYCKS-direktivet; 2026-10-01 DESK-U30 efter REN-konfigen r352):
//   exakt /desk + /desk/h är 302-direktentré rakt till strömmen
//   (autoconnect; r352-parmen resize=scale&show_dot=true = kundväg enl
//   R327); prefixet /desk/ + /desk/h/ ligger bakom auth_basic (webbrockarna
//   6080 porträtt + 6081 landskap, gemensam web-rot); LANDNINGEN serveras av
//   nginx ur /var/www/desk/index.html (title 'AK1A Lab — ZCode-skrivbordet')
//   på /desk/start; r352 tillför de exakta grenarna /desk/telefon.html +
//   /desk/larm.json (proxy till 6080). Title-kontrollen (5a) gäller
//   LANDNINGEN på /desk/start, inte noVNC-sidan.
//
// Utdata: en rad per kontroll + sista raden EXAKT 'RESULTAT: N/M PASS'
//   (N = PASS, M = PASS+FAIL; SKIP räknas ej i M). Exit 0 endast om inget
//   FAIL (SKIP tillåtet), annars exit 1.
//
// Ägarskap: sviten är ren läsning — inga processer dödas/omstartas, inga
//   filer skrivs, inga hemligheter rörs.

import { execFileSync } from 'node:child_process';
import { statSync, readFileSync } from 'node:fs';
import https from 'node:https';

const BAS_URL = 'https://lab.ak1nvestor.com';
// DESK-U28: -land-basenheterna är direktentréns (302-målets) ryggrad —
// växlarkontraktet "xvnc/wm/novnc lever alltid på båda skärmarna".
const ENHETER = ['zdesk-xvnc', 'zdesk-wm', 'zdesk-zcode', 'zdesk-novnc',
                 'zdesk-xvnc-land', 'zdesk-wm-land', 'zdesk-novnc-land'];
const X_DISPLAY = ':10';
const BREDD = 1024;
const HOJD = 576;
const WEB_ROT = '/home/ak1a/desk-web';
const TITEL_MARKE = 'ZCode-skrivbordet';
const LANDNING_FIL = '/var/www/desk/index.html';
const HTTP_TIMEOUT_MS = 6000;
const KOMMANDO_TIMEOUT_MS = 5000;
const KROPP_MAX_BYTE = 262144;

// --- Rapporträknare (kontroll()-mönstret: PASS/FAIL/SKIP per rad) ---
let antalPass = 0;
let antalFail = 0;
let antalSkip = 0;

async function kontroll(namn, fn) {
  try {
    const r = await fn();
    if (r.status === 'SKIP') {
      antalSkip++;
      console.log(`SKIP ${namn}: ${r.orsak}`);
    } else if (r.status === 'PASS') {
      antalPass++;
      console.log(`PASS ${namn}: ${r.detalj}`);
    } else {
      antalFail++;
      console.log(`FAIL ${namn}: ${r.orsak}`);
    }
  } catch (fel) {
    antalFail++;
    const medd = fel && fel.message ? fel.message : String(fel);
    console.log(`FAIL ${namn}: ${medd}`);
  }
}

// --- Processhjälpare: execFileSync, ALDRIG skalsträngar (uppdragets kontrakt) ---
function korKommando(fil, args, envTillagg = {}) {
  return execFileSync(fil, args, {
    encoding: 'utf8',
    timeout: KOMMANDO_TIMEOUT_MS,
    env: { ...process.env, ...envTillagg },
  });
}

// --- HTTP-hjälpare: node:https, redirecter följs EJ, kroppen takas ---
function hamta(sokvag, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `${BAS_URL}${sokvag}`,
      { headers, timeout: HTTP_TIMEOUT_MS },
      (res) => {
        const bitar = [];
        let byte = 0;
        res.on('data', (bit) => {
          byte += bit.length;
          if (byte <= KROPP_MAX_BYTE) bitar.push(bit);
          else req.destroy();
        });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, kropp: Buffer.concat(bitar).toString('utf8') }));
        res.on('error', (fel) => reject(new Error(`läsfel i svar (${sokvag}): ${fel.message}`)));
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error(`timeout efter ${HTTP_TIMEOUT_MS} ms`));
    });
    req.on('error', (fel) => reject(new Error(`nätverksfel mot ${BAS_URL}${sokvag}: ${fel.message}`)));
  });
}

function authHeaders() {
  const auth = process.env.DESK_AUTH;
  if (!auth) return null;
  return { Authorization: `Basic ${Buffer.from(auth, 'utf8').toString('base64')}` };
}

// --- 1. Desk-entréerna UTAN auth (DESK-U26, 2026-09-30; DESK-U30, 2026-10-01) ---
// EN-TRYCKS-kunddirektivet (r350) gjorde entrén till 302-direktentré rakt
// till strömmen (autoconnect=true — kundens "komma in med ett tryck"); REN-
// konfigen r352 (sites-available/ak1a 2026-09-30 22:23) flyttade 302:an till
// EXAKT /desk (utan snedstreck) och bakade auth_basic på hela /desk/-prefixet.
// Kontrollen bevakar alla TRE delkontrakt:
//   (a) exakt /desk => 302 + Location börjar /desk/h/vnc.html med
//       autoconnect=true (fångar svävning som flyttar bort entrén, tappar
//       autoconnect ur direktvägen eller lägger tillbaka landningen),
//   (b) /desk/start => exakt 401 (landningens hem får ALDRIG ligga öppet),
//   (c) /desk/h/vnc.html => exakt 401 (ström-målet bakom 302:ns slut).
async function httpDeskEntree() {
  const direkt = await hamta('/desk');
  if (direkt.status !== 302) {
    return { status: 'FAIL', orsak: `förväntade 302-direktentrén på exakt /desk utan auth, fick ${direkt.status} — nginx exakt-/desk-raden förändrad (r352-kontraktet: entrén på /desk, prefixet /desk/ bakom auth)` };
  }
  const loc = (direkt.headers && direkt.headers.location) || '';
  // nginx gör relativ return-URI absolut i Location-headern — normalisera
  // innan kontraktsjämförelsen så båda formerna är giltiga.
  const locSokvag = loc.replace(/^https?:\/\/[^/]+/i, '');
  if (!locSokvag.startsWith('/desk/h/vnc.html') || !locSokvag.includes('autoconnect=true')) {
    return { status: 'FAIL', orsak: `/desk-redirecten avviker från direktentré-kontraktet: "${loc}"` };
  }
  const start = await hamta('/desk/start');
  if (start.status !== 401) {
    return { status: 'FAIL', orsak: `GET /desk/start utan auth => ${start.status} (förväntat 401) — landningens hem ligger utanför bommen` };
  }
  const mal = await hamta('/desk/h/vnc.html');
  if (mal.status !== 401) {
    return { status: 'FAIL', orsak: `GET /desk/h/vnc.html utan auth => ${mal.status} (förväntat 401) — ström-målet bakom direktentrén tappat auth_basic` };
  }
  return { status: 'PASS', detalj: `exakt /desk => 302 autoconnect-direktentré · /desk/start => 401 (landningens hem) · målet => 401 (strömmen bakom bommen)` };
}

// --- 1b. Hjälpsidan UTAN auth: exakt 401 (proxy-grenen bakom SAMMA bomm) ---
// U18 B4/U19 steg 6b: /desk/hjalp.html serveras via nginx:s /desk/*-proxy
// till 6080 — en ANNAN nginx-gren än landningens exakt-match. Tappar den
// grenen auth_basic ligger hjälpsidans innehåll öppet: kontrollen fångar
// det (jfr U17 A1-klassen — rätt kopia glömd, serverad väg lämnad orörd).
async function httpHjalpUtanAuth() {
  const svar = await hamta('/desk/hjalp.html');
  if (svar.status !== 401) {
    return { status: 'FAIL', orsak: `förväntade exakt 401 utan auth, fick ${svar.status} — auth-bommen täcker ej /desk/hjalp.html (proxy-grenen mot 6080 tappat auth_basic?)` };
  }
  return { status: 'PASS', detalj: `GET /desk/hjalp.html utan auth => ${svar.status} (proxy-grenen bakom samma bomm)` };
}

// --- 1c. R352:s nya exakta ytor UTAN auth: telefon.html + larm.json => 401 ---
// REN-konfigen r352 tillförde två exakta nginx-grenar som proxyar web-rottens
// egna ytor till 6080: /desk/telefon.html (telefonlandningen, mätt 200 lokalt)
// och /desk/larm.json (vakttornets larmbanner, skrivs var 5:e minut av r332-
// vakten). U17 A1-klassen gäller PER serverad väg: tappar en exakt-gren sin
// auth_basic ligger ytan öppen — kontrollen fångar det innan kunden gör det.
async function httpTelefonLarmUtanAuth() {
  const tel = await hamta('/desk/telefon.html');
  if (tel.status !== 401) {
    return { status: 'FAIL', orsak: `GET /desk/telefon.html utan auth => ${tel.status} (förväntat 401) — telefonlandningens exakta gren tappat auth_basic` };
  }
  const larm = await hamta('/desk/larm.json');
  if (larm.status !== 401) {
    return { status: 'FAIL', orsak: `GET /desk/larm.json utan auth => ${larm.status} (förväntat 401) — larmbanderollens exakta gren tappat auth_basic` };
  }
  return { status: 'PASS', detalj: `/desk/telefon.html + /desk/larm.json utan auth => 401 (r352:s nya ytor bakom samma bomm)` };
}

// --- 2. systemd: porträttets fyra + landskapets tre basenheter, 'active' ---
function systemdEnheter() {
  let ut = '';
  try {
    ut = korKommando('systemctl', ['is-active', ...ENHETER]);
  } catch (fel) {
    // is-active ger exit != 0 om NÅGON enhet inte är aktiv — stdout har ändå
    // en statusrad per enhet. Tom stdout = systemctl själv nådde inte fram.
    ut = fel.stdout ? fel.stdout.toString() : '';
    if (!ut.trim()) {
      return { status: 'FAIL', orsak: `systemctl is-active misslyckades: ${fel.message}` };
    }
  }
  const rader = ut.trim().split('\n').map((r) => r.trim());
  const par = ENHETER.map((e, i) => [e, rader[i] || '(inget svar)']);
  const inaktiva = par.filter(([, s]) => s !== 'active');
  if (rader.length !== ENHETER.length || inaktiva.length > 0) {
    return { status: 'FAIL', orsak: `förväntade ${ENHETER.length} 'active', fick: ${par.map(([e, s]) => `${e}=${s}`).join(', ')}` };
  }
  return { status: 'PASS', detalj: `${ENHETER.length} enheter active (${ENHETER.join(', ')})` };
}

// --- 3. X-geometri: arbetsytan skall matcha Xvnc-processens EGEN -geometry ---
// R311-kur: upplösningen är ett STYRELSEBESLUT som ändrats per kundorden
// (1600x900 → 1280x720 → 1024x576 → 1920x1080 → 960x540) — sviten härdkodade
// en epoks siffra och falsklarmade nästa. RÄTT invariant: workarea ==
// Xvnc-cmdlines -geometry (internt konsistent oavsett beslut).
function xGeometri() {
  const ut = korKommando('xprop', ['-root', '_NET_WORKAREA'], { DISPLAY: X_DISPLAY });
  // Format: _NET_WORKAREA(CARDINAL) = 0, 0, 1280, 720, 0, 0, 1280, 720, ...
  const del = ut.split('=')[1];
  if (!del) {
    return { status: 'FAIL', orsak: `ogiltig xprop-utdata för _NET_WORKAREA: "${ut.trim()}"` };
  }
  const tal = del.split(',').map((t) => parseInt(t.trim(), 10));
  const [x, y, b, h] = tal;
  if (!Number.isInteger(b) || !Number.isInteger(h)) {
    return { status: 'FAIL', orsak: `kunde ej tolka dimensioner ur: "${ut.trim()}"` };
  }
  // U13V2 fynd B-kur (r313): jämför mot RUNTIME-sanningen — xrandr current —
  // inte mot Xvnc-cmdlinens starttillstånd. Styrelsens huvudväg resize=remote
  // (defaults.json-kontraktet nedan) sätter klientens egna pixlar via
  // SetDesktopSize vid varje besök: workarea FÖLJER MED, cmdline förblir
  // viloläget — den förra invarianten falsklarmade just vid LYCKAT resize.
  let xrUt = '';
  try {
    xrUt = korKommando('xrandr', ['-d', X_DISPLAY, '--query']);
  } catch (e) {
    return { status: 'FAIL', orsak: `xrandr-anrop misslyckades: ${String(e).slice(0, 120)}` };
  }
  const curRad = xrUt.split('\n').find((r) => r.includes('*')) || '';
  const xm = curRad.match(/(\d+)x(\d+)\b/);
  if (!xm) {
    return { status: 'FAIL', orsak: `kunde ej läsa current-läge ur xrandr: "${curRad.trim().slice(0, 120)}"` };
  }
  const [, xb, xh] = xm;
  if (String(b) !== xb || String(h) !== xh) {
    return { status: 'FAIL', orsak: `arbetsytan ${b}x${h} skiljer från skärmens aktuella läge ${xb}x${xh} (internt inkonsistent skrivbord)` };
  }
  return { status: 'PASS', detalj: `workarea == xrandr current == ${b}x${h} (resize-medveten invariant)` };
}

// --- 4. Fönstermaximering: ALLA fönster skall ha VERT+HORZ ---
function lasKlientLista() {
  const ut = korKommando('xprop', ['-root', '_NET_CLIENT_LIST'], { DISPLAY: X_DISPLAY });
  // Format: _NET_CLIENT_LIST(WINDOW): window id # 0x400003, window id # 0x4e00001
  return [...ut.matchAll(/window id #\s*(0x[0-9a-fA-F]+)/g)].map((m) => m[1]);
}

function fonsterMaximering() {
  const idn = lasKlientLista();
  if (idn.length === 0) {
    return { status: 'SKIP', orsak: '_NET_CLIENT_LIST är tom — inget fönster mappat just nu; kontrollen kräver ett live-fönster (dokumenterat SKIP-läge)' };
  }
  let kontrollerade = 0;
  for (const id of idn) {
    let ut;
    try {
      ut = korKommando('xprop', ['-id', id, '_NET_WM_STATE'], { DISPLAY: X_DISPLAY });
    } catch (fel) {
      // Race-skydd: försvann fönstret mellan listan och frågan är det inget
      // kedjefel — omlista en gång och hoppa över id:t om det är borta.
      const igen = lasKlientLista();
      if (!igen.includes(id)) continue;
      return { status: 'FAIL', orsak: `xprop -id ${id} _NET_WM_STATE misslyckades: ${fel.message}` };
    }
    for (const stat of ['_NET_WM_STATE_MAXIMIZED_VERT', '_NET_WM_STATE_MAXIMIZED_HORZ']) {
      if (!ut.includes(stat)) {
        return { status: 'FAIL', orsak: `fönster ${id} saknar ${stat} (utdata: "${ut.trim()}") — openbox-maximeringen lever inte` };
      }
    }
    kontrollerade++;
  }
  if (kontrollerade === 0) {
    return { status: 'SKIP', orsak: `${idn.length} fönster listades men alla försvann under kontrollen (race) — inget uppmätt` };
  }
  return { status: 'PASS', detalj: `${kontrollerade} fönster maximerade både VERT och HORZ (${idn.join(', ')})` };
}

// --- 5. Auth-kontrollerna: kräver DESK_AUTH ('user:pass') — annars SKIP x4 ---
function skipUtanAuth() {
  return { status: 'SKIP', orsak: 'DESK_AUTH ej satt — auth-kontrollerna kräver användare:lösenord i miljövariabeln (lösenord gissas/hårdkodas ALDRIG, .htdesk läses ALDRIG)' };
}

async function httpAuthLandning(headers) {
  // DESK-U26: landningens serverade hem är /desk/start sedan EN-TRYCKS-
  // direktentrén tog /desk/ (302 styrs av nginx return, oberoende av auth).
  const svar = await hamta('/desk/start', headers);
  if (svar.status !== 200) {
    return { status: 'FAIL', orsak: `GET /desk/start med auth: förväntade 200, fick ${svar.status}` };
  }
  const m = svar.kropp.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titel = m ? m[1].replace(/\s+/g, ' ').trim() : '(ingen title-tagg)';
  if (!titel.includes(TITEL_MARKE)) {
    return { status: 'FAIL', orsak: `landningens title är "${titel}" — innehåller ej "${TITEL_MARKE}"` };
  }
  return { status: 'PASS', detalj: `GET /desk/start med auth => 200, title "${titel}"` };
}

async function httpAuthFil(namn, sokvag) {
  const svar = await hamta(sokvag);
  if (svar.status !== 200) {
    return { status: 'FAIL', orsak: `GET ${sokvag} med auth: förväntade 200, fick ${svar.status}` };
  }
  return { status: 'PASS', detalj: `GET ${sokvag} med auth => ${svar.status} (${namn})` };
}

// --- 6. Web-roten: vnc.html existerar + defaults.json är giltig JSON ---
function webrotVncHtml() {
  const info = statSync(`${WEB_ROT}/vnc.html`);
  if (!info.isFile()) {
    return { status: 'FAIL', orsak: `${WEB_ROT}/vnc.html är ingen vanlig fil` };
  }
  return { status: 'PASS', detalj: `${WEB_ROT}/vnc.html existerar (${info.size} byte)` };
}

function webrotDefaultsJson() {
  const raw = readFileSync(`${WEB_ROT}/defaults.json`, 'utf8');
  const obj = JSON.parse(raw);
  const nycklar = Object.keys(obj).length;
  const beskrivning = nycklar === 0 ? 'tomt objekt — noVNC:s inbyggda standardvärden gäller' : `${nycklar} toppnycklar`;
  // R318+R327 (STYRELSESLUT 2026-09-29): hälsan bevakar GILTIGHET (remote|
  // scale) och redovisar läget — remote får ALDRIG tvångas som default
  // före ett GRÖNT riktigt-telefon-acceptansprov (r318+r327: loopback-
  // headless-bevis räcker INTE; mobil-webkit + remote = ingen anslutning).
  if (obj.resize !== 'remote' && obj.resize !== 'scale') {
    return { status: 'FAIL', orsak: `defaults.json resize="${obj.resize}" — ogiltigt (giltiga: remote|scale)` };
  }
  return { status: 'PASS', detalj: `defaults.json giltig (${beskrivning}) + resize=${obj.resize} (giltigt läge)` };
}

// --- 7. Landningsfilen på disk: titelmarkören + inga kända felspår ---
// DESK-U23 (2026-09-29): titelstavfelet rättades SAMORDNAT med TITEL_MARKE
// och resize=scale-pinen (v198:s urspec) ströks ur båda entrélänkarna —
// denna kontroll bevakar att ingen svävning (jfr defaults-återfallet r314:
// ett fabriksbarn skrev tillbaka scale 23:56) för tillbaka något av det.
function landningFil() {
  const raw = readFileSync(LANDNING_FIL, 'utf8');
  const m = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titel = m ? m[1].replace(/\s+/g, ' ').trim() : '(ingen title-tagg)';
  // R327c: kontrollens SYFTE = "rätt sida lever" — kärnmarkören räcker;
  // dekorations-tecken (streckvarianter/looks-like-kodpunkter) får ALDRIG
  // fälla en i grunden frisk sida (två timmars osynlig-tecken-jakt slutar här).
  if (!titel.includes('ZCode')) {
    return { status: 'FAIL', orsak: `landningens title är "${titel}" — rätt landningssida förefaller ej serverad` };
  }
  // R327 (STYRELSESLUT): resize=scale på landningens knappar är KUNDVÄGEN
  // (r318+r327-bevisen) — INTE ett fel. Remote förblir endast frivillig beta.
  if (raw.includes('./p>')) {
    return { status: 'FAIL', orsak: 'landningen innehåller en trasig sluttagg "./p>" (DESK-U23 fynd B)' };
  }
  return { status: 'PASS', detalj: `title "${titel}" + inga trasiga sluttaggar (scale-pin = kundväg enl R327)` };
}

// --- Huvudflöde ---
const startTid = Date.now();
console.log('=== DESK-HÄLSA — /desk-kedjan i EN kontroll ===');
console.log(`Bas ${BAS_URL} · display ${X_DISPLAY} · web-rot ${WEB_ROT} · ${new Date().toISOString()}`);
console.log(`Auth-läge: ${process.env.DESK_AUTH ? 'DESK_AUTH satt (auth-kontrollerna körs — värdet loggas aldrig)' : 'DESK_AUTH ej satt (auth-kontrollerna blir SKIP)'}`);

const headers = authHeaders();

await kontroll('http-desk-entree', httpDeskEntree);
await kontroll('http-hjalp-401', httpHjalpUtanAuth);
await kontroll('http-telefon-larm-401', httpTelefonLarmUtanAuth);
await kontroll('systemd-enheter', systemdEnheter);
await kontroll('x-geometri', xGeometri);
await kontroll('fonstermaximering', fonsterMaximering);
await kontroll('http-auth-landning', headers ? () => httpAuthLandning(headers) : skipUtanAuth);
await kontroll('http-auth-vnc-html', headers ? () => httpAuthFil('noVNC-sidan', '/desk/vnc.html') : skipUtanAuth);
await kontroll('http-auth-ui-js', headers ? () => httpAuthFil('noVNC-appen', '/desk/app/ui.js') : skipUtanAuth);
await kontroll('http-auth-hjalp-html', headers ? () => httpAuthFil('hjälpsidan', '/desk/hjalp.html') : skipUtanAuth);
await kontroll('webrot-vnc-html', webrotVncHtml);
await kontroll('webrot-defaults-json', webrotDefaultsJson);
await kontroll('landning-fil', landningFil);

const sek = ((Date.now() - startTid) / 1000).toFixed(1);
console.log(`Summa: ${antalPass} PASS, ${antalFail} FAIL, ${antalSkip} SKIP · ${sek} s (värstafall ~60 s, se DETERMINISM)`);
console.log(`RESULTAT: ${antalPass}/${antalPass + antalFail} PASS`);
process.exit(antalFail > 0 ? 1 : 0);
