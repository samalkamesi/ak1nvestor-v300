// _s8u3o565-nasdaq-sond.mjs — sond: hur svarar nasdaq.com på HEAD vs GET
// med verktygets exakta UA och tidsgräns? (rotorsaksbevis för o565)
const UA = "ak1a-doda-lankar-externa/1.0 (+länkvakten; kontakta hej@ak1nvestor.com)";
const TIDSGRANS_MS = 15_000;

async function sond(url, metod) {
  const kontroll = new AbortController();
  const tid = setTimeout(() => kontroll.abort(), TIDSGRANS_MS);
  const start = Date.now();
  try {
    const svar = await fetch(url, {
      method: metod,
      redirect: "follow",
      signal: kontroll.signal,
      headers: { "user-agent": UA, accept: "*/*" },
    });
    const status = svar.status;
    const slutlig = svar.url;
    try { await svar.body?.cancel(); } catch { kontroll.abort(); }
    return { status, slutlig, fel: null, ms: Date.now() - start };
  } catch (fel) {
    const felText = fel?.cause?.code
      ? fel.cause.code
      : String(fel?.name || "").includes("Abort") || /aborted|timed? ?out/i.test(String(fel?.message || ""))
        ? "TIMEOUT"
        : String(fel?.message || fel);
    return { status: 0, slutlig: url, fel: felText, ms: Date.now() - start };
  } finally {
    clearTimeout(tid);
  }
}

const mal = process.argv[2] || "https://www.nasdaq.com/european-market-activity";
for (const metod of ["HEAD", "GET"]) {
  const r = await sond(mal, metod);
  console.log(`${metod}: status=${r.status} fel=${r.fel} ms=${r.ms} slutlig=${r.slutlig}`);
}
// och en GET med webbläsarlik UA som kontroll (bevisar UA-skillnaden)
const kontroll = new AbortController();
const tid = setTimeout(() => kontroll.abort(), TIDSGRANS_MS);
const start = Date.now();
try {
  const svar = await fetch(mal, {
    method: "GET",
    redirect: "follow",
    signal: kontroll.signal,
    headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", accept: "text/html,*/*" },
  });
  try { await svar.body?.cancel(); } catch { kontroll.abort(); }
  console.log(`GET(browser-UA): status=${svar.status} ms=${Date.now() - start}`);
} catch (fel) {
  console.log(`GET(browser-UA): FEL ${fel?.cause?.code || fel?.name} ms=${Date.now() - start}`);
} finally {
  clearTimeout(tid);
}
