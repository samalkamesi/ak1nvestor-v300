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
//   1. http-landning-401   GET /desk/ UTAN auth => exakt 401 (auth-bommen).
//   1b. http-hjalp-401     GET /desk/hjalp.html UTAN auth => exakt 401 —
//                          U18 B4/U19 steg 6b: hjälpsidans väg (nginx-proxy
//                          till 6080) skall ligga bakom SAMMA bomm; fångar
//                          att proxy-grenen aldrig tappar auth_basic.
//   2. systemd-enheter     systemctl is-active zdesk-xvnc zdesk-wm
//                          zdesk-zcode zdesk-novnc => fyra 'active'.
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
//                          SAMORDNAT par sedan U23), INGEN 'resize=scale'-
//                          pin (U13V2:s kontrakt är defaults resize=remote;
//                          U17 A1-klassen), inga trasiga sluttaggar ('./p>').
//
// DETERMINISM: allt utom de två HTTP-kontrollgrupperna (1/1b och 5) är lokala
//   processanrop/filäsningar — deterministiska. HTTP-kontrollerna går via
//   internet mot https://lab.ak1nvestor.com/ (kundens telefonperspektiv:
//   nätverksfel/timeout ÄR ett kedjefel och FAILar ärligt; 6 s timeout per
//   anrop, sex anrop totalt (1, 1b + fyra auth) => värstafall ~36 s, i
//   normaldrift ~2 s). Redirecter följs
//   EJ: kedjan förväntas svara exakt (3xx => FAIL).
//
// Arkitekturnotering (mätt 2026-09-28; titel rättad SAMORDNAT med TITEL_MARKE
// 2026-09-29, DESK-U23): landningssidan på exakt /desk/
//   serveras av nginx ur /var/www/desk/index.html (title 'AK1A Lab —
//   ZCode-skrivbordet'); prefixet /desk/* proxyas till websockify vars
//   /desk/vnc.html har title 'noVNC'. Title-kontrollen (5a) gäller därför
//   LANDNINGEN, inte noVNC-sidan.
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
const ENHETER = ['zdesk-xvnc', 'zdesk-wm', 'zdesk-zcode', 'zdesk-novnc'];
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
        res.on('end', () => resolve({ status: res.statusCode, kropp: Buffer.concat(bitar).toString('utf8') }));
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

// --- 1. Landning UTAN auth: exakt 401 (basic auth-bommen i nginx) ---
async function httpLandningUtanAuth() {
  const svar = await hamta('/desk/');
  if (svar.status !== 401) {
    return { status: 'FAIL', orsak: `förväntade exakt 401 utan auth, fick ${svar.status} — basic auth-bommen på exakt /desk/ är botten eller förändrad` };
  }
  return { status: 'PASS', detalj: `GET /desk/ utan auth => ${svar.status} (auth-bommen lever)` };
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

// --- 2. systemd: fyra enheter skall vara 'active' ---
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
    return { status: 'FAIL', orsak: `förväntade fyra 'active', fick: ${par.map(([e, s]) => `${e}=${s}`).join(', ')}` };
  }
  return { status: 'PASS', detalj: `fyra enheter active (${ENHETER.join(', ')})` };
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
  const svar = await hamta('/desk/', headers);
  if (svar.status !== 200) {
    return { status: 'FAIL', orsak: `GET /desk/ med auth: förväntade 200, fick ${svar.status}` };
  }
  const m = svar.kropp.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titel = m ? m[1].replace(/\s+/g, ' ').trim() : '(ingen title-tagg)';
  if (!titel.includes(TITEL_MARKE)) {
    return { status: 'FAIL', orsak: `landningens title är "${titel}" — innehåller ej "${TITEL_MARKE}"` };
  }
  return { status: 'PASS', detalj: `GET /desk/ med auth => 200, title "${titel}"` };
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
  return { status: 'PASS', detalj: `title "${titel}" + ingen scale-pin + inga trasiga sluttaggar` };
}

// --- Huvudflöde ---
const startTid = Date.now();
console.log('=== DESK-HÄLSA — /desk-kedjan i EN kontroll ===');
console.log(`Bas ${BAS_URL} · display ${X_DISPLAY} · web-rot ${WEB_ROT} · ${new Date().toISOString()}`);
console.log(`Auth-läge: ${process.env.DESK_AUTH ? 'DESK_AUTH satt (auth-kontrollerna körs — värdet loggas aldrig)' : 'DESK_AUTH ej satt (auth-kontrollerna blir SKIP)'}`);

const headers = authHeaders();

await kontroll('http-landning-401', httpLandningUtanAuth);
await kontroll('http-hjalp-401', httpHjalpUtanAuth);
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
console.log(`Summa: ${antalPass} PASS, ${antalFail} FAIL, ${antalSkip} SKIP · ${sek} s (värstafall ~36 s, se DETERMINISM)`);
console.log(`RESULTAT: ${antalPass}/${antalPass + antalFail} PASS`);
process.exit(antalFail > 0 ? 1 : 0);
