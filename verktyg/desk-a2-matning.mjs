#!/usr/bin/env node
// DESK-A2-MÄTNING (U16 fynd A2 + U19 steg 4a, född DESK-U25) — 2026-09-29
//
// U16 A2: appens WM_NORMAL_HINTS min 480×640 kan klampa mot telefonviewports
// i remote-resize-eran — men px-talen per orientering saknades (U19 steg 4a:
// "app-min är leverantörens yta, men skadan skall beläggas i drift").
// Detta verktyg mäter dem SYNTETISKT enligt U20:s bevisade sondmetod:
// sätt framebuffer (xrandr --fb), låt openbox om-maximera genom settle-
// grinden, läs fönstergeometri + min-hints, beräkna px utanför, återställ.
//
// Säkerhetskontrakt:
//   - VÄGRAR sätta framebuffer om en klient är uppkopplad på :6080/:5910
//     (kundens pågående ström är helig — U20:s försiktighet). --matt är
//     ren passiv läsning och tillåten alltid.
//   - Fönstret hittas med --onlyvisible --name "ZCode" (U16 B2-kuren:
//     --class zcode ger två träffar med 10×10-hjälpfönstret FÖRST).
//   - Settle-grind (U16 A1/B3-lärdomen): kräver två på varandra följande
//     IDENTISKA fönsteravläsningar (~400 ms stabilitet) innan mätvärde
//     bokförs — om-maximering efter geometribyte är asynkron.
//
// Användning (från arbetsytans rot):
//   node verktyg/desk-a2-matning.mjs --matt            mät nuvarande läge
//   node verktyg/desk-a2-matning.mjs --fb 844x390      sätt läge + mät
//   node verktyg/desk-a2-matning.mjs --aterstall 412x915   = --fb (semantisk tyngd)
//
// Utdata: läsbar rapport på stdout + JSON-rad i data/vakten/desk-a2-matning.jsonl.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const LOGG = 'data/vakten/desk-a2-matning.jsonl';
const XENV = { ...process.env, DISPLAY: ':10' };
const SETTLE_MS = 200;      // intervall mellan fönsteravläsningar
const SETTLE_TAK_MS = 12_000; // max väntan på stabil geometri

const x = (cmd) => execSync(cmd, { encoding: 'utf8', timeout: 10_000, env: XENV });

function raderMedPort(port) {
  try {
    const ut = execSync('ss -tn state established', { encoding: 'utf8', timeout: 5_000 }).trim();
    return ut.split('\n').filter((r) => r.includes(':' + port + ' '));
  } catch {
    return [];
  }
}

// Kund = bestående ström. Kortlivade 6080-anslutningar är hälsans/gränssnitts-
// vaktens curl-sonder (DESK-U25-fynd under utveckling: false positive-klassen);
// en riktig noVNC-klient håller websockifys upstream 5910 öppen (U15 §0) och
// 6080 bestående > 1,5 s. Därför: 5910 ELLER två 6080-avläsningar i följd.
async function klientUppkopplad(vanta = sleep) {
  if (raderMedPort(5910).length > 0) return true;
  if (raderMedPort(6080).length === 0) return false;
  await vanta(1500);
  return raderMedPort(6080).length > 0;
}

function lasSkarm() {
  const m = x('xrandr --current').match(/current (\d+) x (\d+)/);
  if (!m) throw new Error('kunde inte läsa xrandr current');
  return { w: Number(m[1]), h: Number(m[2]) };
}

function hittaFonster() {
  const idn = x('xdotool search --onlyvisible --name "ZCode"').trim().split('\n').filter(Boolean);
  if (idn.length !== 1) throw new Error('förväntade exakt ett synligt ZCode-fönster, fann ' + idn.length);
  return idn[0];
}

function lasFonster(id) {
  const ut = {};
  for (const rad of x(`xdotool getwindowgeometry --shell ${id}`).trim().split('\n')) {
    const [k, v] = rad.split('=');
    if (k && v !== undefined) ut[k.trim()] = Number(v);
  }
  return { id, x: ut.X, y: ut.Y, w: ut.WIDTH, h: ut.HEIGHT };
}

function lasMinHints(id) {
  const m = x(`xprop -id ${id} WM_NORMAL_HINTS`).match(/minimum size:\s*(\d+) by (\d+)/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

function lasWorkarea() {
  const m = x('xprop -root _NET_WORKAREA').match(/_NET_WORKAREA\(CARDINAL\/ARGB\) =\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)/);
  return m ? { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) } : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lasFonsterStabilt(id) {
  let fore = null, stabilSedan = Date.now();
  const start = Date.now();
  while (Date.now() - start < SETTLE_TAK_MS) {
    const nu = lasFonster(id);
    if (fore && nu.w === fore.w && nu.h === fore.h && nu.x === fore.x && nu.y === fore.y) {
      if (Date.now() - stabilSedan >= 2 * SETTLE_MS) return nu; // två identiska avläsningar
    } else {
      stabilSedan = Date.now();
    }
    fore = nu;
    await sleep(SETTLE_MS);
  }
  throw new Error('fönstergeometrin stabiliserade ej inom ' + SETTLE_TAK_MS + ' ms (sista: ' + JSON.stringify(fore) + ')');
}

// RFB SetDesktopSize — exakt kundens klientmekanism (noVNC skickar denna vid
// varje anslutning/rotation, U12:819-829). U20 bevisade sonden på :10
// (verkställer omedelbart på xrandr). Sonden skickar ENDAST geometrin —
// ingen tangentbords-/musinput (U16 C1:s hållning om loopback-None).
function rfbSetDesktopSize(w, h) {
  return new Promise((resolve, reject) => {
    const sok = net.connect(5910, '127.0.0.1');
    sok.setTimeout(6_000, () => { sok.destroy(); reject(new Error('RFB-sond: timeout')); });
    let buf = Buffer.alloc(0);
    let fas = 'version'; // fasvariabel är OBLIGATORISK: mönstermatchning på
                         // innehåll tolkar ServerInit-breddens lågbyte som
                         // nya security-typer när flera chunkar trampolineras
                         // (DESK-U25-felsökning: [156] = 0x9C ur 412 = 0x019C)
    const fx = (n) => { buf = buf.subarray(n); }; // konsumera n byte från fronten
    const bearbeta = () => {
      if (fas === 'version') {
        if (buf.length < 12) return false;
        const serverVersion = buf.toString('ascii', 0, 12);
        fx(12);
        if (!serverVersion.includes('003.008')) { sok.destroy(); reject(new Error('RFB-sond: server erbjuder ' + serverVersion.trim() + ' — sonden kräver 003.008')); return false; }
        sok.write('RFB 003.008\n');
        fas = 'types';
        return true;
      }
      if (fas === 'types') {
        if (buf.length < 1) return false;
        const n = buf[0]; // RFB 3.8: u8 antal + typer (0 = u32-felkod följer)
        if (n === 0) {
          if (buf.length < 5) return false;
          sok.destroy(); reject(new Error('RFB-sond: serverns security-förhandling misslyckades')); return false;
        }
        if (buf.length < 1 + n) return false;
        const types = [...buf.slice(1, 1 + n)];
        fx(1 + n);
        if (!types.includes(1)) { sok.destroy(); reject(new Error('RFB-sond: SecurityTypes None erbjuds ej: ' + JSON.stringify(types))); return false; }
        sok.write(Buffer.from([1])); // välj None
        fas = 'result';
        return true;
      }
      if (fas === 'result') {
        if (buf.length < 4) return false;
        if (buf.readUInt32BE(0) !== 0) { sok.destroy(); reject(new Error('RFB-sond: SecurityResult != 0')); return false; }
        fx(4);
        sok.write(Buffer.from([1])); // ClientInit, shared
        fas = 'serverinit';
        return true;
      }
      if (fas === 'serverinit') {
        // ServerInit: u16 w, u16 h, 16B pixelformat, u32 namnLen, namn
        if (buf.length < 24) return false;
        const namnLen = buf.readUInt32BE(20);
        if (buf.length < 24 + namnLen) return false;
        fx(24 + namnLen);
        // SetEncodings med resize-pseudokodningarna — noVNC deklarerar
        // -223 (DesktopSize) och -308 (ExtendedDesktopSize) före resize
        // (rfb.js:2256/2260; U20:s "-308-rect mottagen" bevisar kravet):
        const enc = Buffer.alloc(4 + 2 * 4);
        enc.writeUInt8(2, 0);              // SetEncodings
        enc.writeUInt8(0, 1);
        enc.writeUInt16BE(2, 2);
        enc.writeInt32BE(-223, 4);
        enc.writeInt32BE(-308, 8);
        sok.write(enc);
        const b = Buffer.alloc(24);        // wire-format ur rfb.js:3266-3286
        b.writeUInt8(251, 0);              // SetDesktopSize
        b.writeUInt8(0, 1);
        b.writeUInt16BE(w, 2);
        b.writeUInt16BE(h, 4);
        b.writeUInt8(1, 6);                // 1 skärm
        b.writeUInt8(0, 7);                // PAD8 efter antal skärmar
        b.writeUInt32BE(0, 8);             // screen id 0 (noVNC-mönstret)
        b.writeUInt16BE(0, 12);            // x
        b.writeUInt16BE(0, 14);            // y
        b.writeUInt16BE(w, 16);
        b.writeUInt16BE(h, 18);
        b.writeUInt32BE(0, 20);            // flags
        setTimeout(() => sok.write(b), 120);
        fas = 'klar';
        setTimeout(() => { sok.destroy(); resolve(true); }, 700);
        return true;
      }
      return false;
    };
    sok.on('error', (e) => { try { sok.destroy(); } catch {} reject(new Error('RFB-sond: ' + e.message)); });
    sok.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      try { while (bearbeta()) { if (fas === 'klar') break; } }
      catch (e) { reject(e); }
    });
  });
}

async function sättFramebuffer(w, h) {
  // Väg 1: xrandr -s om modet redan finns (rent lokalt, dämpat probe —
  // Xvnc accepterar bara listade modes, DESK-U25-fynd). Väg 2: RFB-sonden.
  // OBS ärlighet från U25-driften: ett misslyckat `--fb` kan ha satt fb
  // delvis (BadValue EFTER RRSetScreenSize) — därför verifieras EVERY sökväg
  // mot xrandr current i polling-loop, och misslyckande avbryter högljudd.
  try { x(`xrandr -s ${w}x${h} 2>/dev/null`); } catch { await rfbSetDesktopSize(w, h); }
  for (let i = 0; i < 32; i++) {
    const s = lasSkarm();
    if (s.w === w && s.h === h) return;
    await sleep(250);
  }
  throw new Error(`framebuffer ${w}x${h} verkställdes EJ (current ${JSON.stringify(lasSkarm())}) — avbryter utan ytterligare ändring`);
}

function berakna(skarm, fonster) {
  const horisontellt = fonster.w - skarm.w; // >0 = klippt i höger (NorthWest-gravity)
  const vertikalt = fonster.h - skarm.h;    // >0 = klippt i botten (kompositorns hemvist U11 F4)
  return {
    overflodeHorisontelltPx: Math.max(0, horisontellt),
    overflodeVertikaltPx: Math.max(0, vertikalt),
    luckaHorisontelltPx: Math.max(0, -horisontellt),
    luckaVertikaltPx: Math.max(0, -vertikalt),
  };
}

async function main() {
  const arg = process.argv[2] ?? '--hjalp';
  const ld = process.argv[3];
  const klient = await klientUppkopplad();

  if (arg === '--hjalp' || (arg !== '--matt' && !ld)) {
    console.log('användning: node verktyg/desk-a2-matning.mjs --matt | --fb WxH | --aterstall WxH');
    process.exit(arg === '--hjalp' ? 0 : 1);
  }
  const m = arg === '--matt' ? null : ld?.match(/^(\d+)x(\d+)$/);
  if (!m && arg !== '--matt') { console.error('format: WxH (t.ex. 844x390)'); process.exit(1); }

  if (arg !== '--matt') {
    if (klient) {
      console.error('desk-a2-mätning: klient uppkopplad på :6080/:5910 — VÄGRAR ändra framebuffer (kundens ström helig)');
      process.exit(2);
    }
    await sättFramebuffer(Number(m[1]), Number(m[2]));
    await sleep(600); // ge openbox sin RRScreenChangeNotify-först
  }

  const id = hittaFonster();
  const fonster = await lasFonsterStabilt(id);
  const skarm = lasSkarm();
  const minHints = lasMinHints(id);
  const workarea = lasWorkarea();
  const ov = berakna(skarm, fonster);

  const rad = {
    ts: new Date().toISOString(), mode: arg === '--matt' ? 'matt' : 'fb-satt',
    begard: arg === '--matt' ? null : ld,
    skarm, fonster, minHints, workarea, ...ov,
    klampMinHints: minHints ? (fonster.w === minHints.w || fonster.h === minHints.h) : null,
    klientUppe: klient,
    notera: 'vertikalt överflöd = klippt botten (kompositorn); horisontellt = klippt höger',
  };
  fs.appendFileSync(LOGG, JSON.stringify(rad) + '\n');
  console.log('desk-a2-mätning: skärm ' + skarm.w + 'x' + skarm.h + ' · fönster ' + fonster.w + 'x' + fonster.h +
    ' +' + fonster.x + '+' + fonster.y + ' · min ' + (minHints ? minHints.w + 'x' + minHints.h : '?') +
    ' · utanför: höger ' + ov.overflodeHorisontelltPx + ' px, botten ' + ov.overflodeVertikaltPx + ' px' +
    (rad.klampMinHints ? ' · KLAMPAR mot min-hints' : '') + ' · loggad ' + LOGG);
}

main().catch((e) => { console.error('desk-a2-mätning FEL: ' + (e.stack || e.message)); process.exit(1); });
