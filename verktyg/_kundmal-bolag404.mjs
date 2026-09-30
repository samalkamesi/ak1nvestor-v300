// Kundmålet 2026-09-25: verifiera att de 21 /bolag/-sidorna från
// gränssnittsvaktens larm svarar 200 i prod (definition-of-done).
// Sond — städas efter bruk.
const SLUGS = [
  "engi-pa", "eoan-de", "fnt-de", "hei-de", "ifx-de", "li-pa", "muv2-de",
  "ng-l", "ntr", "pson-l", "pub-pa", "puig-mc", "rci-b", "ree-mc", "rr-l",
  "saf-pa", "sge-l", "sgo-pa", "shl-de", "sn-l", "td",
];

const BASER = ["https://lab.ak1nvestor.com", "http://localhost:3000"];

for (const bas of BASER) {
  let ok = 0;
  const fel = [];
  for (const slug of SLUGS) {
    const url = `${bas}/bolag/${slug}`;
    try {
      const r = await fetch(url, { redirect: "manual" });
      if (r.status === 200) ok++;
      else fel.push(`${slug}: ${r.status}`);
    } catch (e) {
      fel.push(`${slug}: FEL ${e.message}`);
    }
  }
  console.log(`${bas}: ${ok}/21 OK${fel.length ? " — FEL: " + fel.join(", ") : " — ALLA 200"}`);
}
