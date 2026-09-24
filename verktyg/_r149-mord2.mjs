// Mordutredning 2: fabrikens logg.jsonl-svans + aktiva manifest + RAM-vakt-beslut
import fs from 'node:fs';
const ut = {};
try {
  const rader = fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/logg.jsonl', 'utf8').trimEnd().split('\n');
  ut.senaste = rader.slice(-12).map(r => { try { const o = JSON.parse(r); return (o.ts || '') + ' ' + (o.händelse || o.handelse || o.event || '') + ' ' + String(o.meddelande || o.detalj || '').slice(0, 110); } catch { return r.slice(0, 110); } });
} catch (e) { ut.logg = 'FEL ' + e.message.slice(0, 80); }
// aktiva manifest
try { ut.ko = fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/ko'); } catch (e) { ut.ko = 'FEL ' + e.message.slice(0, 50); }
// status-filer
try { ut.status = fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/status').slice(-6); } catch (e) { ut.status = 'FEL'; }
console.log(JSON.stringify(ut, null, 1));
