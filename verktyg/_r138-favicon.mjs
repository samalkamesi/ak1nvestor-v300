#!/usr/bin/env node
// Rond 138: generera public/favicon.ico — 16×16, 32-bit BMP-baserad ICO.
// Rot: chrome begär /favicon.ico automatiskt; kodbasen saknade den helt ⇒
// 404 ⇒ konsolfel som gränssnittsvakten räknar (1 fel × varje kombination).
// Enfärgad i AK1A:s mörka marinblå (diskret i både light och dark tema).
import fs from 'node:fs';

const W = 16, H = 16;
const [BR, BG, BB] = [0x2b, 0x1f, 0x14]; // #14202b marinblå (BGRA-ordning nedan)

// Pixeldata: BGRA, nederst rad först (BMB-ordning)
const pix = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  pix[i * 4] = BB; pix[i * 4 + 1] = BG; pix[i * 4 + 2] = BR; pix[i * 4 + 3] = 0xff;
}
// AND-mask: 16 rader à 4 byte, alla 0 (opak via alfa)
const mask = Buffer.alloc((W / 8) * H);

const dib = Buffer.alloc(40);
dib.writeUInt32LE(40, 0);          // biSize
dib.writeInt32LE(W, 4);            // biWidth
dib.writeInt32LE(H * 2, 8);        // biHeight dubbel (XOR+AND)
dib.writeUInt16LE(1, 12);          // biPlanes
dib.writeUInt16LE(32, 14);         // biBitCount
dib.writeUInt32LE(W * H * 4 + mask.length, 20); // biSizeImage

const bmp = Buffer.concat([dib, pix, mask]);

const dir = Buffer.alloc(6);
dir.writeUInt16LE(0, 0); dir.writeUInt16LE( 1, 2); dir.writeUInt16LE(1, 4); // typ 1 (ikon), 1 bild
const entry = Buffer.alloc(16);
entry[0] = W; entry[1] = H; entry[2] = 0; entry[3] = 0;
entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(bmp.length, 8); entry.writeUInt32LE(6 + 16, 12);

const ico = Buffer.concat([dir, entry, bmp]);
const ut = '/home/ak1a/agent/ak1/public/favicon.ico';
fs.writeFileSync(ut, ico);
console.log('skrev', ut, ico.length, 'byte');
