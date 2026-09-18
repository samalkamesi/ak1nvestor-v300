#!/usr/bin/env node
// s7-u3 o78: A/B-proxy — servar localhost:3000 men injicerar (läge=1)
// kandidat-CSS:en FÖRSTA i <head> (hydrat-neutral plats). Läget styrs av
// env INJICERA=1|0 så att identisk metodik mäter kur-effekten isolerat:
//   INJICERA=0 node verktyg/_s7u3o78-proxy.mjs &   # kontroll via proxy
//   INJICERA=1 node verktyg/_s7u3o78-proxy.mjs &   # kur via proxy
//   LH_BAS=http://localhost:9999 node verktyg/prestanda-lighthouse.mjs <namn> /kurser
import http from "node:http";

const INJICERA = process.env.INJICERA === "1";
const PORT = Number(process.env.PROXY_PORT || 9999);

const KUR_CSS = `
  section.marin-panel { content-visibility: auto; contain-intrinsic-size: auto 95rem; }
  main section.rounded-2xl { content-visibility: auto; contain-intrinsic-size: auto 76rem; }
  main div.mt-10 { content-visibility: auto; contain-intrinsic-size: auto 23rem; }
  div.pt-10 { content-visibility: auto; contain-intrinsic-size: auto 14rem; }
  footer.border-t-2 { content-visibility: auto; contain-intrinsic-size: auto 134rem; }
`;

const server = http.createServer(async (req, res) => {
  try {
    const uppstr = await fetch(`http://localhost:3000${req.url}`, {
      headers: { "user-agent": req.headers["user-agent"] ?? "" },
    });
    const ctype = uppstr.headers.get("content-type") ?? "";
    for (const [k, v] of uppstr.headers) {
      if (["content-encoding", "content-length", "transfer-encoding", "set-cookie"].includes(k)) continue;
      res.setHeader(k, v);
    }
    if (INJICERA && ctype.includes("text/html")) {
      let html = await uppstr.text();
      html = html.replace(/(<head[^>]*>)/i, `$1<style id="cv-kur-prov">${KUR_CSS}</style>`);
      res.setHeader("content-type", ctype);
      res.end(html);
      return;
    }
    const buf = Buffer.from(await uppstr.arrayBuffer());
    res.end(buf);
  } catch (fel) {
    res.writeHead(502);
    res.end("proxy-fel: " + String(fel));
  }
});
server.listen(PORT, "127.0.0.1", () => {
  console.log(`o78-proxy på :${PORT} INJICERA=${INJICERA ? 1 : 0}`);
});
