import { readFileSync, writeFileSync } from "node:fs";
const p = "data/kurser-tillagg/od-02-implicit-volatilitet.json";
let t = readFileSync(p, "utf8");
const byt = [
  ["och-format tabellen", "och ger tabellen"],
  ["krachtuppen", "krashtoppen"],
  ["1987 års krash", "1987 års krasch"],
  ["krashen som utlöser skyddet", "kraschen som utlöser skyddet"],
  ["sin prisseformel", "sin prisformel"],
  ["den som SELJER skydd", "den som SÄLJER skydd"],
  ["kompenserass i genomsnitt", "kompenseras i genomsnitt"],
  ["Det är ingen buggyvning utan en lön", "Det är inget marknadsfel utan en lön"],
  ["| Läge | VIX | Måndsbredd |", "| Läge | VIX | Månadsbredd |"],
  ["är den kontoupstigande", "är den svagt stigande"],
  ["jänga inkomster", "jämn inkomster"],
  ["(ett standardavvikelsespann)", "(ett spann motsvarande en standardavvikelse)"],
  ["medan lugna marknader notera VIX", "medan lugna marknader noterade VIX"],
  ["earnings-bevakningen", "rapportbevakningen"],
  ["volatilitet som ASSETKLASS", "volatilitet som tillgångsklass"],
  ["kvart sekel senare", "ett kvartssekel senare"],
  ["en köpslig option på 5,0 kronor", "en option köpt för 5,0 kronor"],
  ["någon betalar för en mil som prissätter 25", "någon betalar för en förväntan som prissätter 25 procent"],
  ["den här, av allt att döma, rörligaste ingredielsen", "den kanske rörligaste ingrediensen"],
  ["enkelsregeln löser den", "enkelhetsregeln löser den"],
  ["Räk-regeln som gör VIX läsbart", "Räkregeln som gör VIX läsbart"],
  ["och en enkel räk-regel", "och en enkel räkne" + "regel"],
  ["är volatiliteten motivationsvariabeln per scenarie", "är volatiliteten inmatningsvariabeln i varje scenario"],
  ["i genomsnitt och med systematik. Det är ingen buggyvning", "i genomsnitt och med systematik. Det är inget marknadsfel"],
  ["är 'risk' i sig (rk-01)", "är 'risk' i sig"],
  ["sin vanliga skepsis mot det han kallade 'complexity risk' — papper vars mekanism han inte kunde förklara på en minut", "sin vanliga skepsis mot papper vars mekanism han inte kunde förklara på en minut"],
  ["Men hans eget viktiga bidrag till kursens ämne finns ändå, och det är humoristiskt prosaiskt: hans påpekande att 'om du investerar i emotionella tillgångar blir du själv emotionell' — VIX-världen i en mening.", "Men hans eget viktiga bidrag till kursens ämne finns ändå, och det är prosaiskt nog: hans påpekande att marknadens känslor smittar den som lever nära dem — VIX-världen i en mening."],
  ["Lynch-kursen i vol: läs barometern, lita inte på den.", "Lynch-läxan i vol: läs barometern, lita inte på den."]
];
let n = 0;
const saknade = [];
for (const [a, b] of byt) {
  if (!t.includes(a)) { saknade.push(a.slice(0, 55)); continue; }
  t = t.split(a).join(b); n++;
}
writeFileSync(p, t);
console.log("Rättade " + n + " av " + byt.length);
if (saknade.length) console.log("SAKNADE:\n  " + saknade.join("\n  "));
console.log("CJK:", JSON.stringify(t.match(/[\u4e00-\u9fff\u3040-\u30ff]+/g)));
console.log("Mjuka bindestreck (U+00AD):", (t.match(/\u00ad/g) || []).length);
const j = JSON.parse(t);
console.log("JSON giltigt | level:", j.level, "| kapitel:", j.chapters.length, "=", j.chapters_list.length);
