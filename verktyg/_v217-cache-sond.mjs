// v217: STATISKA TILLGÅNGARS CACHE-HEADERS (rond 358:s bokning, spår 7)
// Read-only sond: hämtar 4 nyckelsidor, plockar /_next/**-resurser ur HTML,
// mäter Cache-Control/ETag/Last-Modified på ett urval per sida.
// Dom: hash-namngivna /_next/static-resurser SKA bära lång max-age
// (Next.js default: public, max-age=31536000, immutable) + ETag.
// Rapport: data/vakten/cache-headers-v217.json · utdata: stdout.
import fs from "node:fs";
import path from "node:path";

const BAS = "https://lab.ak1nvestor.com";
const SIDER = ["/", "/kurser", "/blogg", "/dataset"];
const MAX_PER_SIDA = 6; // urval per sida (chunks + css + media)

const tid = () => new Date().toISOString().slice(0, 19);
const logga = (s) => console.log(s);

function parsaCacheControl(cc) {
  if (!cc) return { maxAge: null, immutable: false, riktigt: cc ?? null };
  const m = cc.match(/max-age=(\d+)/i);
  return {
    maxAge: m ? parseInt(m[1], 10) : null,
    immutable: /immutable/i.test(cc),
    riktigt: cc,
  };
}

function tolkaDirektiv(directives) {
  // Kort max-age på hash-resurs = kur-läge; 0 utan no-cache = inte cachad.
  if (directives.maxAge === null) return "SAKNAS-CACHE-CONTROL";
  if (directives.maxAge >= 30 * 24 * 3600 && directives.immutable) return "MAL-NASTA-BYGG";
  if (directives.maxAge >= 30 * 24 * 3600) return "LANG-DUTAN-IMMUTABLE";
  if (directives.maxAge >= 24 * 3600) return "DYGN";
  if (directives.maxAge === 0) return "NOLL";
  return "KORT (" + directives.maxAge + " s)";
}

const rapport = { ts: tid(), bas: BAS, sidor: [], dom: null };

for (const sida of SIDER) {
  const post = { sida, status: null, resurser: [], fel: null };
  try {
    const r = await fetch(BAS + sida, { signal: AbortSignal.timeout(15_000) });
    post.status = r.status;
    const html = await r.text();
    // Alla /_next-referenser i HTML (src/href): chunks, css, media
    const traf = [...html.matchAll(/[srchref]{2,4}=["']([^"']*\/_next\/[^"']+)["']/g)].map((m) => m[1]);
    const unika = [...new Set(traf)].slice(0, MAX_PER_SIDA);
    for (const resurs of unika) {
      try {
        const rr = await fetch(new URL(resurs, BAS), { signal: AbortSignal.timeout(10_000) });
        const cc = parsaCacheControl(rr.headers.get("cache-control"));
        post.resurser.push({
          resurs: resurs.replace(/^https?:\/\/[^/]+/, "").slice(0, 100),
          status: rr.status,
          cacheControl: cc.riktigt,
          maxAge: cc.maxAge,
          immutable: cc.immutable,
          etag: rr.headers.get("etag") ? "JA" : "NEJ",
          lastModified: rr.headers.get("last-modified") ? "JA" : "NEJ",
          viktning: tolkaDirektiv(cc),
        });
      } catch (e) {
        post.resurser.push({ resurs: resurs.slice(0, 100), fel: String(e).slice(0, 60) });
      }
    }
  } catch (e) {
    post.fel = String(e).slice(0, 80);
  }
  rapport.sidor.push(post);
}

// ── DOM ──
const alla = rapport.sidor.flatMap((s) => s.resurser.filter((r) => !r.fel));
const hashResurser = alla.filter((r) => /\/_next\/static\/[^/]+\/[^/]*[.-][0-9a-f]{8,}\.(js|css|woff2?|png|svg|jpg|webp)/i.test(r.resurs) || /\/_next\/static\/media\//.test(r.resurs));
const kor = alla.filter((r) => r.viktning && r.viktning !== "MAL-NASTA-BYGG" && r.maxAge !== null && r.maxAge < 30 * 24 * 3600);
const saknas = alla.filter((r) => r.viktning === "SAKNAS-CACHE-CONTROL");
const utanEtag = alla.filter((r) => r.etag === "NEJ");

rapport.dom = {
  mätta: alla.length,
  hashResurser: hashResurser.length,
  kortMaxAge: kor.length,
  saknarCacheControl: saknas.length,
  saknarEtag: utanEtag.length,
  domslut:
    kor.length === 0 && saknas.length === 0
      ? "GRÖN — alla mätta resurser bär månadslång eller längre cache"
      : kurDom(kor, saknas, utanEtag),
};

function kurDom(kor, saknas, utanEtag) {
  if (saknas.length > 0) return `RAD — ${saknas.length} resurs(er) SAKNAR Cache-Control helt: ${saknas.slice(0, 3).map((r) => r.resurs).join(", ")}`;
  if (kor.length > 0) return `KUR-LÄGE — ${kor.length} resurs(er) med kort max-age: ${kor.slice(0, 3).map((r) => `${r.resurs} (${r.maxAge}s)`).join(", ")}`;
  return `GUL — ${utanEtag.length} resurs(er) utan ETag (revalidering försvåras)`;
}

// Skriv rapport (agent-trädet; bokförs i PIPELINE-KO av sessionen)
const utVag = path.join(import.meta.dirname, "..", "data", "vakten", "cache-headers-v217.json");
fs.writeFileSync(utVag, JSON.stringify(rapport, null, 2) + "\n");

logga(`v217 CACHE-SOND ${tid()} — ${BAS}`);
for (const s of rapport.sidor) {
  logga(`\n── ${s.sida} (HTTP ${s.status}) — ${s.resurser.length} resurser provade`);
  for (const r of s.resurser) {
    if (r.fel) { logga(`  FEL  ${r.resurs} ${r.fel}`); continue; }
    logga(`  ${r.viktning.padEnd(22)} etag=${r.etag} lm=${r.lastModified} maxage=${r.maxAge ?? "-"} ${r.resurs.slice(0, 70)}`);
  }
}
logga(`\nDOM: ${rapport.dom.domslut}`);
logga(`mätta=${rapport.dom.mätta} hash=${rapport.dom.hashResurser} kort=${rapport.dom.kortMaxAge} saknas-cc=${rapport.dom.saknarCacheControl} utan-etag=${rapport.dom.saknarEtag}`);
logga(`rapport: ${utVag}`);
