#!/usr/bin/env node
// s7-u3 sond: identifiera /kurser:s chunks (innehåll + storlek raw/gz)
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const chunks = [
  "2i51e627rllld.js","3tc9l_yj-kftz.js","0ghd343qi8jtv.js","turbopack-045a409cwl-_v.js",
  "3fntmmi971322.js","2etudctbz5udd.js","04z4dypizkj3v.js","3o-an9dtd0lrc.js",
  "3482dq7-r_wgz.js","1ymt1shyhmu-4.js","1y-5o88dqqoiw.js","452iyves_63ju.js",
  "3l9jylnfgk94a.js","06jd2skjlxjar.js","0cz1d0mv5g_q7.js","0el5nt6-nk2y3.js",
  "2ecierimwxqep.js","1b-3drmwimcg8.js","1fd_6cmqv4kra.js",
];
const markorer = [
  ["ai-mentor-lager","fragor:"], ["studiomotor","studio"], ["recharts","Recharts"],
  ["d3","d3-scale"], ["kurs-sok","ksok."], ["supabase","supabase"],
  ["larvag","larvag"], ["akm","AKM2"], ["kalender","kalender"], ["portfolj","portfolj"],
  ["quiz","quiz"], ["sprak","Sprak"], ["drift/konsol","granssnitt"],
  ["sitemap","sitemap"], ["auth","password"], ["pdf","pdfjs"], ["chart","chart"],
  ["xlsx","xlsx"], ["react-dom","react-dom"], ["framer","framer"],
];
for (const f of chunks) {
  try {
    const buf = readFileSync(".next/static/chunks/" + f);
    const s = buf.toString("utf8");
    const gz = gzipSync(buf).length;
    const hits = markorer.filter(([, n]) => s.includes(n)).map(([namn]) => namn);
    console.log(
      f.padEnd(26),
      String(Math.round(buf.length / 1024)).padStart(4) + "K raw",
      String(Math.round(gz / 1024)).padStart(4) + "K gz",
      "—",
      hits.join(", ") || "?",
    );
  } catch {
    console.log(f.padEnd(26), "SAKNAS");
  }
}
