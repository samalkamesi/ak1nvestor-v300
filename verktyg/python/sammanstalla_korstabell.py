#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AK1A — P6: sammanställer AKM1-lagret + FVag-lagret till korstabell-grund och
skriver P6-rapporten.

Läser:
  data/portfolj-system/bolagsunivers.json   (100 BolagsNyckeltal-poster)
  data/cache/akm1-{TICKER}.json             (AKM1Bedomning, se bedom_akm1.py)
  data/cache/fvag-{TICKER}.json             (FVagAnalys, se kor-fvag.mjs)

Skriver:
  data/portfolj-system/korstabell-grund.json
  data/rapporter/p6-akm1-bedömning-2026-09-03.md
  data/rapporter/d1-datatackning-2026-09-03.md

STATUSREGLER (D1 2026-09-03 — trösklarna skalas efter datatäckning):
  datatackning   = Σ vikt över beräkningsbara (icke-osatta) variabler / 97
  akm1MaxMojligt = Σ vikt över beräkningsbara × 5 × (20/97)
                   (= datatackning × 100; osatt variabel ger ALLTID 0 poäng)
  grön = AKM1 ≥ 70 % av akm1MaxMojligt OCH datatackning ≥ 60 % OCH inget port-brott
  gul  = AKM1 50–70 % av akm1MaxMojligt OCH inget port-brott
  röd  = AKM1 < 50 % av akm1MaxMojligt ELLER port-brott (V19 < 12 mån ⇒ max 45)
  Låg täckning kan ALDRIG ge grön status — men saknad data sänker aldrig poängen,
  bara taket: modellen straffar inte saknad data, den redovisar täckningen öppet.
  (osatt används endast om underlagsfiler saknas — ska inte hända i pass 1)

  BAKGRUND (strukturellt fynd i pass 1): 28,9 % av vikten vilar på variabler utan
  datakällor (V02, V03, V11, V13, V15–V18, V20) — fasta tröskeln "grön ≥ 70" var
  därmed i praktiken ouppnåelig (teoretiskt max ≈ 71). Det är ett datakvalitetsfynd,
  inte en bolagsbedömning; D1-skalan kalibrerar redovisningen, inte bolagen.

fvagDynamik (sammanvägd fundamental riktning): majoriteten bland de 20
variablernas dynamik (förbättras/stabilt/försvagas); vid oavgjort eller
samtliga osatta → stabilt/osatt. Beskriver, dömer aldrig.

SÄKERHET: sanera_filnamn + saker_sokvag (P1-mönster). INGET NÄTVERK.

Pedagogisk forskning — ALDRIG investeringsråd.
"""

from __future__ import annotations

import json
import math
import os
import re
import statistics
import sys
from pathlib import Path

REPO_ROT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
UNIVERSFIL = os.path.join(REPO_ROT, "data", "portfolj-system", "bolagsunivers.json")
CACHE_ROT = os.path.join(REPO_ROT, "data", "cache")
KORSTABELLFIL = os.path.join(REPO_ROT, "data", "portfolj-system", "korstabell-grund.json")
RAPPORTFIL = os.path.join(REPO_ROT, "data", "rapporter", "p6-akm1-bedömning-2026-09-03.md")
RAPPORTFIL_D1 = os.path.join(REPO_ROT, "data", "rapporter", "d1-datatackning-2026-09-03.md")


def skriv_fil(sokvag: str, innehall: str) -> None:
    """Bevakad skrivning — vägrar sökvägar utanför repo-roten (realpath-kontroll,
    samma skydd som samla_nyckeltal.skriv_json och bedom_akm1.saker_sokvag)."""
    verklig = os.path.realpath(sokvag)
    rot = os.path.realpath(REPO_ROT)
    if not verklig.startswith(rot + os.sep):
        raise ValueError(f"sökväg utanför repo-roten avvisad: {sokvag!r}")
    Path(verklig).write_text(innehall, encoding="utf-8", newline="\n")

DATUM = "2026-09-03"
VIKTER = {
    "V01": 8.0, "V02": 4.0, "V03": 3.0, "V04": 4.0, "V05": 4.0,
    "V06": 11.0, "V07": 10.0, "V08": 6.0, "V09": 6.0, "V10": 4.0,
    "V11": 4.0, "V12": 4.0, "V13": 4.0, "V14": 3.0, "V15": 3.0,
    "V16": 2.0, "V17": 2.0, "V18": 2.0, "V19": 9.0, "V20": 4.0,
}
VAR_NAMN = {
    "V01": "Försäljningstillväxt", "V02": "ARR-tillväxt", "V03": "Intäktsdiversifiering",
    "V04": "P/S", "V05": "P/B", "V06": "EV/EBITDA", "V07": "Bruttomarginal",
    "V08": "EBITDA-marginal", "V09": "ROE", "V10": "Skuldsättningsgrad",
    "V11": "Likviditet", "V12": "Intäktsstabilitet", "V13": "Patent & IP",
    "V14": "Varumärke & kundlojalitet", "V15": "Nätverkseffekter",
    "V16": "Produktlanseringar", "V17": "Avtal & partnerskap",
    "V18": "Regulatoriska katalysatorer", "V19": "Kassatäckning — nyemissionsrisk",
    "V20": "Återköp av egna aktier",
}


def sanera_filnamn(ticker: str) -> str:
    if not ticker or ".." in ticker:
        raise ValueError(f"ogiltig ticker (path-traversal-misstänkt): {ticker!r}")
    rensat = re.sub(r"[^A-Za-z0-9._-]", "_", ticker)
    if not rensat or rensat.startswith("."):
        raise ValueError(f"ogiltig ticker efter sanering: {ticker!r}")
    return rensat


def saker_sokvag(rot: str, filnamn: str) -> str:
    sokvag = os.path.join(rot, filnamn)
    verklig = os.path.realpath(sokvag)
    rot_verklig = os.path.realpath(rot)
    if verklig != rot_verklig and not verklig.startswith(rot_verklig + os.sep):
        raise ValueError(f"sökväg utanför rot avvisad: {sokvag!r}")
    return sokvag


def ticker_namn(ticker: str) -> str:
    return sanera_filnamn(ticker).replace(".", "_")


def las_cache(prefix: str, ticker: str) -> dict | None:
    sokvag = saker_sokvag(CACHE_ROT, f"{prefix}-{ticker_namn(ticker)}.json")
    if not os.path.isfile(sokvag):
        return None
    with open(sokvag, encoding="utf-8") as f:
        return json.load(f)


def sammanvagd_dynamik(fvag: dict) -> str:
    """Majoriteten av variablernas dynamik; oavgjort → stabilt; alla osatta → osatt."""
    r = {"forbattras": 0, "stabilt": 0, "forsvamras": 0}
    for v in fvag.get("perVariabel", {}).values():
        if v.get("dynamik") in r:
            r[v["dynamik"]] += 1
    if sum(r.values()) == 0:
        return "osatt"
    if r["forbattras"] > r["forsvamras"]:
        return "forbattras"
    if r["forsvamras"] > r["forbattras"]:
        return "forsvamras"
    return "stabilt"


def datatackning_ur(akm1: dict) -> tuple[float, float]:
    """(datatackning, akm1MaxMojligt) per bolag ur en AKM1-bedömning.

    datatackning = Σ vikt över icke-osatta variabler / 97 — andelen av modellens
    totalvikt som har dataunderlag (0–1). akm1MaxMojligt = Σ vikt över
    beräkningsbara × 5 × (20/97) = Σ vikt × (100/97): poängtaket när alla
    beräkningsbara variabler håller 5 poäng och de osatta håller 0 — osatt
    variabel ger ALLTID 0 poäng (ärlighetsprincipen: modellen gissar aldrig).
    Samma kriterium för "osatt" som bedömningen: motivering som börjar "osatt"."""
    tat_vikt = sum(w for v, w in VIKTER.items() if not akm1["motivering"][v].startswith("osatt"))
    return tat_vikt / 97.0, tat_vikt * (100.0 / 97.0)


def status(totalt: float, port: bool, tat: float, max_mojligt: float) -> str:
    """D1 (2026-09-03): trösklarna skalas per bolag efter datatäckningen.

    grön = ≥ 70 % av maxMöjligt OCH täckning ≥ 60 % — låg täckning kan ALDRIG
    bli grön; gul = 50–70 %; röd = < 50 % eller port-brott. Saknad data sänker
    taket (maxMöjligt), aldrig poängen — modellen straffar inte saknad data."""
    if port:
        return "rod"
    kvot = totalt / max_mojligt if max_mojligt > 0 else 0.0
    if kvot >= 0.70 and tat >= 0.60:
        return "gron"
    if kvot >= 0.50:
        return "gul"
    return "rod"


def status_fast(totalt: float, port: bool) -> str:
    """Pass 1:s ursprungliga fasta trösklar (grön ≥ 70, gul 55–69) — kvar endast
    som jämförelseunderlag i rapporterna (dokumenterar D1-före/D1-efter)."""
    if port or totalt < 55.0:
        return "rod"
    if totalt < 70.0:
        return "gul"
    return "gron"


def sv(x: float, dec: int = 1) -> str:
    f = 10 ** dec
    return str(round(x * f) / f).replace(".", ",")


def main() -> int:
    with open(UNIVERSFIL, encoding="utf-8") as f:
        univers = json.load(f)
    os.makedirs(os.path.dirname(RAPPORTFIL), exist_ok=True)

    rader = []
    port_bolag = []
    osatta_raknare = {v: 0 for v in VIKTER}
    extra_osatta = {}   # ticker → signatur av osatta variabler (D1 §7)
    totaler = []
    saknade = []

    for post in univers:
        t = post["ticker"]
        akm1 = las_cache("akm1", t)
        fvag = las_cache("fvag", t)
        if akm1 is None or fvag is None:
            saknade.append(t)
            rader.append({
                "ticker": t, "namn": post.get("namn", ""), "bransch": post.get("bransch", ""),
                "akm1Totalt": None, "akm1PerKategori": None,
                "fvagPerHorisont": fvag["perHorisont"] if fvag else None,
                "fvagDynamik": sammanvagd_dynamik(fvag) if fvag else "osatt",
                "golvMarginal": (post.get("golv") or {}).get("marginal"),
                "portV19": None, "datatackning": None, "akm1MaxMojligt": None,
                "status": "osatt", "senastKontrollerad": DATUM,
            })
            continue

        port = akm1["motivering"]["V19"].startswith("Kassatäckning") and "HÅRD PORT" in akm1["motivering"]["V19"]
        if port:
            port_bolag.append((t, post.get("namn", ""), akm1["totalt"], akm1["motivering"]["V19"]))
        for v in VIKTER:
            if akm1["motivering"][v].startswith("osatt"):
                osatta_raknare[v] += 1
        totaler.append(akm1["totalt"])
        tat, max_mojligt = datatackning_ur(akm1)
        extra_osatta[t] = tuple(v for v in VIKTER if akm1["motivering"][v].startswith("osatt"))

        rader.append({
            "ticker": t, "namn": post.get("namn", ""), "bransch": post.get("bransch", ""),
            "akm1Totalt": akm1["totalt"],
            "akm1PerKategori": akm1["perKategori"],
            "fvagPerHorisont": fvag["perHorisont"],
            "fvagDynamik": sammanvagd_dynamik(fvag),
            "golvMarginal": (post.get("golv") or {}).get("marginal"),
            "portV19": port,
            "datatackning": round(tat, 4),
            "akm1MaxMojligt": round(max_mojligt, 1),
            "status": status(akm1["totalt"], port, tat, max_mojligt),
            "senastKontrollerad": DATUM,
        })

    korstabell = {
        "skapad": DATUM,
        "projekt": "AK1A portföljforskning — steg 3: korstabell-grund (AKM1 + FVag, utan teknisk våg)",
        "kalla": {
            "univers": "data/portfolj-system/bolagsunivers.json (pass 1)",
            "akm1": "data/cache/akm1-{TICKER}.json (verktyg/python/bedom_akm1.py)",
            "fvag": "data/cache/fvag-{TICKER}.json (verktyg/kor-fvag.mjs → fundamental-vagmotor.ts)",
        },
        "formel": "totalt = Σ(vikt_norm(Vxx) × poäng(Vxx)) × 20 med vikt_norm = vikt/97 från akm2-2026 (AKM2-BESLUT §2, V01–V20-tabellen summerar 97 % och normaliseras till Σ1); osatt variabel ⇒ 0 poäng; HÅRD PORT: känd kassatäckning < 12 mån ⇒ totalt max 45 (BESLUT §5)",
        "datatackningRegler": {
            "datatackning": "Σ vikt över beräkningsbara (icke-osatta) variabler / 97 — andel av modellens vikt med dataunderlag (D1 2026-09-03)",
            "akm1MaxMojligt": "Σ vikt över beräkningsbara × 5 × (20/97) = datatackning × 100 — teoretiskt poängtak när alla beräkningsbara variabler håller 5 poäng (osatt ⇒ alltid 0 poäng)",
            "kalla": "data/rapporter/d1-datatackning-2026-09-03.md",
        },
        "statusRegler": {
            "gron": "AKM1 ≥ 70 % av akm1MaxMojligt OCH datatackning ≥ 60 % OCH inget port-brott (D1-skalning — låg täckning kan aldrig bli grön)",
            "gul": "AKM1 50–70 % av akm1MaxMojligt OCH inget port-brott",
            "rod": "AKM1 < 50 % av akm1MaxMojligt ELLER port-brott (V19 < 12 mån)",
        },
        "rader": rader,
    }
    skriv_fil(KORSTABELLFIL, json.dumps(korstabell, ensure_ascii=False, indent=1) + "\n")

    # ── Statistik till rapporterna ────────────────────────────────────────────
    sorterade = sorted([r for r in rader if r["akm1Totalt"] is not None],
                       key=lambda r: -r["akm1Totalt"])
    medel = statistics.mean(totaler)
    median = statistics.median(totaler)
    status_raknare = {"gron": 0, "gul": 0, "rod": 0, "osatt": 0}
    for r in rader:
        status_raknare[r["status"]] += 1
    # Jämförelse: pass 1:s ursprungliga fasta trösklar (70/55) — D1-före.
    fast_raknare = {"gron": 0, "gul": 0, "rod": 0, "osatt": 0}
    for r in rader:
        if r["akm1Totalt"] is None or r["portV19"] is None:
            fast_raknare["osatt"] += 1
        else:
            fast_raknare[status_fast(r["akm1Totalt"], r["portV19"])] += 1
    osatt_vikt_andel = sum(VIKTER[v] for v in VIKTER if osatta_raknare[v] == 100) / 97.0
    alltid_osatta = [v for v in VIKTER if osatta_raknare[v] == 100]
    berakningsbara = [v for v in VIKTER if osatta_raknare[v] < 100]

    # FVag-läge
    fvag_dynamik_r = {"forbattras": 0, "stabilt": 0, "forsvamras": 0, "osatt": 0}
    for r in rader:
        fvag_dynamik_r[r["fvagDynamik"]] += 1

    linjer = []
    a = linjer.append
    a("# P6 — AKM1-bedömning och fundamental vågklassning (2026-09-03)")
    a("")
    a("AK1A Research Lab · pedagogisk forskning — **ALDRIG investeringsråd**.")
    a("")
    a("## 1. Sammanfattning")
    a("")
    a(f"- **{len(rader)} bolag** bedömda (AKM1 V01–V20) och vågklassade (FVagAnalys); saknade underlagsfiler: {len(saknade)}.")
    a(f"- **Medelpoäng {sv(medel)} / 100**, median {sv(median)}, span {sv(min(totaler))}–{sv(max(totaler))}.")
    a(f"- **Statusfördelning (D1, skalad efter datatäckning):** grön {status_raknare['gron']} · gul {status_raknare['gul']} · röd {status_raknare['rod']} · osatt {status_raknare['osatt']}. Med pass 1:s ursprungliga fasta trösklar (grön ≥ 70, gul 55–69) var fördelningen grön {fast_raknare['gron']} · gul {fast_raknare['gul']} · röd {fast_raknare['rod']} — se D1-rapporten (`data/rapporter/d1-datatackning-2026-09-03.md`).")
    a(f"- **Port-brott (V19 kassatäckning < 12 mån):** {len(port_bolag)} bolag — {', '.join(t for t, _, _, _ in port_bolag) if port_bolag else 'inga'}.")
    a(f"- **Beräkningsbara variabler:** {len(berakningsbara)} av 20 ({', '.join(berakningsbara)}) — resterande {len(alltid_osatta)} är osatta för samtliga bolag i pass 1 ({', '.join(alltid_osatta)}).")
    a(f"- **Strukturell tak-effekt:** {sv(osatt_vikt_andel * 100)} % av vikten vilar på variabler som saknar data för alla bolag — det teoretiska maximala totalpoängtalet är därför ≈ {sv((97 - sum(VIKTER[v] for v in alltid_osatta)) / 97 * 100)} i pass 1. Gröna nivån (≥ 70) är med pass-1-data i praktiken ouppnåelig; detta är ett **datakvalitetsfynd**, inte en bedömning av bolagen.")
    a("")
    a("## 2. Formel och vikter (dokumentation)")
    a("")
    a("```")
    a("totalt = Σ(vikt_norm(Vxx) × poäng(Vxx)) × 20")
    a("vikt_norm(Vxx) = vikt(Vxx) / 97    (akm2-2026, AKM2-BESLUT §2 första spåret)")
    a("```")
    a("")
    a("BESLUT §2:s V01–V20-tabell (8+4+3+4+4+11+10+6+6+4+4+4+4+3+3+2+2+2+9+4) summerar")
    a("de facto **97 %** — vikterna normaliseras till Σ1 i beräkningen. Spårtexten i BESLUT")
    a("(”58 % V01–V20 + 42 % moduler”) avser fulla AKM2-kompositen där modulblocket V21–V28")
    a("ingår; modulerna ingår INTE i AKM1-lagret. Alternativa tabellen i r2-vikter §4.2")
    a("(summerar 100 %) har medvetet EJ använts — BESLUT-dokumentet är normerande.")
    a("Osatt variabel ⇒ **0 poäng** och motivering som inleds med ”osatt” (ärlighetsprincipen:")
    a("modellen gissar aldrig). Poängkurvor enligt AKM2-BESLUT §4/r2 §6: V01 goldilocks")
    a("(tak ~40–45 %), V06 konvex med värdefalle-hål, V07/V09 konkava (tak vid höga nivåer")
    a("då uthållighet ej kan verifieras), V19 klippfunktion. Övriga linjära band.")
    a("")
    a("## 3. Topp-10 (högst AKM1-total)")
    a("")
    a("| # | Ticker | Bolag | Bransch | AKM1 | Kategorier (tillv/värd/löns/stab/moat/kat/risk) | Dynamik | Status |")
    a("|---|--------|-------|---------|------|------------------|---------|--------|")
    for i, r in enumerate(sorterade[:10], 1):
        pk = r["akm1PerKategori"]
        pks = f"{sv(pk['tillvaxt'])}/{sv(pk['vardering'])}/{sv(pk['lonsamhet'])}/{sv(pk['stabilitet'])}/{sv(pk['moat'])}/{sv(pk['katalysator'])}/{sv(pk['risk'])}"
        a(f"| {i} | {r['ticker']} | {r['namn']} | {r['bransch']} | {sv(r['akm1Totalt'])} | {pks} | {r['fvagDynamik']} | {r['status']} |")
    a("")
    a("## 4. Botten-5 (lägst AKM1-total)")
    a("")
    a("| # | Ticker | Bolag | Bransch | AKM1 | Lägsta poäng (alltid-osatta variabler exkluderade) | Status |")
    a("|---|--------|-------|---------|------|--------------------------|--------|")
    for r in sorterade[-5:]:
        t = r["ticker"]
        akm1 = las_cache("akm1", t)
        laga = sorted(((v, p) for v, p in akm1["poang"].items() if osatta_raknare[v] < 100),
                      key=lambda kv: kv[1])[:6]
        orsak = ", ".join(f"{v}:{p}p" for v, p in laga) if laga else "samtliga beräkningsbara variabler svaga"
        a(f"| — | {t} | {r['namn']} | {r['bransch']} | {sv(r['akm1Totalt'])} | {orsak} | {r['status']} |")
    a("")
    a("## 5. Null-fördelning per variabel (osatta av 100 bolag)")
    a("")
    a("| Variabel | Namn | Vikt % | Osatta | Beräkningsbara |")
    a("|----------|------|--------|--------|----------------|")
    for v in VIKTER:
        a(f"| {v} | {VAR_NAMN[v]} | {sv(VIKTER[v], 0)} | {osatta_raknare[v]} | {100 - osatta_raknare[v]} |")
    a("")
    a("Alltid osatta (pass 1): V02 ARR, V03 diversifiering, V11 kvick-likviditet, V13 patent,")
    a("V15 nätverkseffekter, V16–V18 katalysatorer, V20 återköp — tillsammans")
    a(f"{sv(sum(VIKTER[v] for v in alltid_osatta), 0)} viktenheter av 97. Detta matchar P1:s")
    a("kända begränsningar (manifest.json): källorna saknar ARR, segmentdata,")
    a("balansräkningshistorik, återköpsbelopp och aktieantalshistorik.")
    a("")
    a("## 6. Port-brott (V19 HÅRD PORT)")
    a("")
    if port_bolag:
        for t, namn, totalt, m in port_bolag:
            a(f"- **{t} ({namn})** — totalt {sv(totalt)} (tak 45 tillämpat): {m}")
    else:
        a("- Inga bolag utlöste porten i pass 1 (porten kräver KÄND kassatäckning < 12 månader;")
        a("  osatt värde triggar aldrig — ärlig osatt väger tyngst).")
    a("")
    a("## 7. Fundamental vågbild (FVag — kort kommentar)")
    a("")
    a(f"Sammanvägd dynamik över bolagen: förbättras {fvag_dynamik_r['forbattras']} ·")
    a(f"stabilt {fvag_dynamik_r['stabilt']} · försvagas {fvag_dynamik_r['forsvamras']} ·")
    a(f"osatt {fvag_dynamik_r['osatt']}. Med pass 1:s fyra räkenskapsår kan fundamental-vagmotorns")
    a("fönsterkrav (kort ≥ 4, medellång ≥ 5, lång ≥ 6 punkter) bara uppfyllas för")
    a("omsättningsseriens mikro-fönster — perHorisont är därför huvudsakligen ”osatt”, vilket")
    a("är motorns ärliga svar på korta serier, inte ett fel. När P7+ kompletterar med")
    a("kvartalsdata/längre historik växer vågbilden fram.")
    a("")
    a("## 8. Kända dataartefakter (dokumenterade, ej lösta i pass 1)")
    a("")
    a("- **Holding-/investmentbolag:** INDU-C.ST (Industrivärden) och INVE-B.ST (Investor)")
    a("  redovisar bruttomarginal 100 % och EBIT-marginal ~100 % hos källan (koncernstrukturens")
    a("  art) — deras höga AKM1-placeringar drivs delvis av denna artefakt, inte av")
    a("  verksamhetslönsamhet. Läs topp-listan med detta i minnet.")
    a("- **Kraftigt negativ FCF utan känd kassatäckning:** CAST.ST (−72,9 % FCF-marginal)")
    a("  och RWE.DE (−69,6 %) är V19-osatta (0 poäng) eftersom kassatäckning i månader ej")
    a("  finns hos källan — porten utlöses INTE av osatt värde, men båda flaggas här för")
    a("  manuell granskning i nästa pass (investeringstung verksamhet kan förklara FCF).")
    a("- **Finansbranschen:** P1 sätter metodiskt skuld/EK = null (V10 osatt) och bankernas")
    a("  bruttomarginal är 0 % hos källan (V07 = 0) — banker får systematiskt låga AKM1-totaler")
    a("  av branschdatans art, inte av bolagens kvalitet. NDA-SE.ST:s P/B 21,5x är med stor")
    a("  sannolikhet en källartefakt (SEB 1,9x, SHB 1,6x).")
    a("- **V06-proxy:** fältet evEbit är EV/EBIT, inte EV/EBITDA. EV/EBIT ≥ EV/EBITDA alltid")
    a("  ⇒ poängen är en dokumenterad nedre gräns (systematiskt sträng, värst för")
    a("  kapitalintensiva branscher).")
    a("- **V08-proxy:** EBIT-marginal som nedre gräns för EBITDA-marginal (samma logik).")
    a("- **V14:** grov subjektiv poäng ur bruttomarginalens nivå — korrelerar med V07 och")
    a("  dubbelräknar delvis moat-evidens (r2 §4.1 varnar för just detta).")
    a("- **Källavvikelser >15 %** enligt manifestet (EQNR, GOOGL, BRK-B, NKE) påverkar")
    a("  prisberoende mått (V04–V06).")
    a("")
    a("## 9. Återföring")
    a("")
    a("1. Nyckeltalspass 2 bör prioritera: bruttovinsthistorik (V07 uthållighetskrav, V14-aggregat),")
    a("   aktieantalshistorik (V20, V25-utspädning), balanshistorik (V11), ARR/segment (V02–V03).")
    a("2. Fyra bolag har känd kassatäckning — V19:s klippfunktion är svagt belyst i pass 1;")
    a("   kassaflödeshistorik tänder den variabeln mer än någon annan.")
    a("3. Grönnivån ≥ 70 kräver att alltid-osatt-vikten (≈29 %) får data — annars bör")
    a("   trösklarna kalibreras om i nästa beslutsrunda (separat forskningsbeslut).")
    a("   *Uppföljning: kalibreringen genomfördes i D1 (2026-09-03) — trösklarna")
    a("   skalas nu per bolag efter datatäckningen; se")
    a("   `data/rapporter/d1-datatackning-2026-09-03.md`.*")
    a("")
    a("---")
    a("")
    a("*Verktyg: `verktyg/python/bedom_akm1.py` (AKM1) · `verktyg/kor-fvag.mjs` (FVag via")
    a("tsx) · `verktyg/python/sammanstalla_korstabell.py` (denna korstabell + rapport).*")
    a("")
    a("*AK1A Research Lab — pedagogisk forskning. ALDRIG investeringsråd.*")

    skriv_fil(RAPPORTFIL, "\n".join(linjer) + "\n")

    # ── D1-rapporten: datatäckning och skalade trösklar ──────────────────────
    bedomda_rader = [r for r in rader if r["akm1Totalt"] is not None]

    def kvot(r: dict) -> float:
        return r["akm1Totalt"] / r["akm1MaxMojligt"] if r["akm1MaxMojligt"] else 0.0

    def d1_rad(r: dict) -> str:
        return (
            f"| {r['ticker']} | {r['namn']} | {r['bransch']} | {sv(r['akm1Totalt'])} | "
            f"{sv(r['akm1MaxMojligt'])} | {sv(kvot(r) * 100, 0)} % | {sv(r['datatackning'] * 100, 0)} % |"
        )

    grona = sorted([r for r in bedomda_rader if r["status"] == "gron"], key=lambda r: -kvot(r))
    gula = sorted([r for r in bedomda_rader if r["status"] == "gul"], key=lambda r: -kvot(r))
    roda = sorted([r for r in bedomda_rader if r["status"] == "rod"], key=lambda r: -kvot(r))
    tats = [r["datatackning"] for r in bedomda_rader]
    tat_min, tat_max = min(tats), max(tats)

    # Nivåfördelning: gruppera på signatur av osatta variabler (ärlig förklaring
    # till VARFÖR täckningen skiljer sig mellan bolag).
    signaturer: dict[tuple, list[str]] = {}
    for r in bedomda_rader:
        signaturer.setdefault(extra_osatta[r["ticker"]], []).append(r["ticker"])
    alltid_osatta_sign = tuple(v for v in VIKTER if osatta_raknare[v] == 100)

    d = []
    a2 = d.append
    a2("# D1 — Datatäckning och skalade statuströsklar (2026-09-03)")
    a2("")
    a2("AK1A Research Lab · pedagogisk forskning — **ALDRIG investeringsråd**.")
    a2("")
    a2("## 1. Bakgrund — det strukturella datakvalitetsfyndet")
    a2("")
    a2(f"Pass 1 bedömde 100 bolag med AKM1, men **{sv(osatt_vikt_andel * 100)} % av modellens vikt**")
    a2(f"vilar på variabler utan datakällor ({', '.join(alltid_osatta)}) — osatta variabler ger")
    a2("ALLTID 0 poäng (ärlighetsprincipen: modellen gissar aldrig), vilket sänker det")
    a2(f"teoretiska poängtaket till ≈ {sv((97 - sum(VIKTER[v] for v in alltid_osatta)) / 97 * 100)} för samtliga bolag.")
    a2("Status-tröskeln ”grön = AKM1 ≥ 70” var därmed i praktiken ouppnåelig")
    a2(f"(pass 1:s fasta trösklar gav: grön {fast_raknare['gron']} · gul {fast_raknare['gul']} · röd {fast_raknare['rod']}).")
    a2("Detta är ett **datakvalitetsfynd**, inte en bolagsbedömning — D1 åtgärdar")
    a2("redovisningen av fyndet, inte bolagspoängen.")
    a2("")
    a2("## 2. Nya regler (D1)")
    a2("")
    a2("```")
    a2("datatackning   = Σ vikt över beräkningsbara (icke-osatta) variabler / 97")
    a2("akm1MaxMojligt = Σ vikt över beräkningsbara × 5 × (20/97)  (= datatackning × 100)")
    a2("")
    a2("grön = AKM1 ≥ 70 % av akm1MaxMojligt OCH datatackning ≥ 60 % OCH inget port-brott")
    a2("gul  = AKM1 50–70 % av akm1MaxMojligt OCH inget port-brott")
    a2("röd  = AKM1 < 50 % av akm1MaxMojligt ELLER port-brott (V19 < 12 mån)")
    a2("```")
    a2("")
    a2("Saknad data sänker **taket** (maxMöjligt), aldrig poängen — modellen straffar")
    a2("inte saknad data. Samtidigt kan täckning < 60 % ALDRIG ge grön status: sämre")
    a2("underlag måste synas, inte döljas bakom en skalad tröskel.")
    a2("")
    a2("## 3. Statusfördelning NU (efter skalning)")
    a2("")
    a2(f"- **Grön {len(grona)} · gul {len(gula)} · röd {len(roda)}** av {len(bedomda_rader)} bedömda bolag")
    a2(f"  (fasta trösklar: grön {fast_raknare['gron']} · gul {fast_raknare['gul']} · röd {fast_raknare['rod']}).")
    a2(f"- **Täckningsspann:** {sv(tat_min * 100)}–{sv(tat_max * 100)} % av modellens vikt")
    a2(f"  (maxMöjligt {sv(tat_min * 100)} → {sv(tat_max * 100)} poäng).")
    a2(f"- **Port-brott (fortfarande röd oavsett kvot):** {len(port_bolag)} bolag —")
    a2(f"  {', '.join(t for t, _, _, _ in port_bolag) if port_bolag else 'inga'}.")
    a2("")
    a2("## 4. Gröna bolag — poäng ≥ 70 % av maxMöjligt OCH täckning ≥ 60 %")
    a2("")
    if grona:
        a2("| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |")
        a2("|--------|-------|---------|------|-----|------|----------|")
        for r in grona:
            a2(d1_rad(r))
    else:
        a2("- Inga bolag når den skalade gröna tröskeln i pass 1.")
    a2("")
    a2("## 5. Gula bolag — poäng 50–70 % av maxMöjligt")
    a2("")
    if gula:
        a2("| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |")
        a2("|--------|-------|---------|------|-----|------|----------|")
        for r in gula:
            a2(d1_rad(r))
    else:
        a2("- Inga gula bolag.")
    a2("")
    a2("## 6. Röda bolag — poäng < 50 % av maxMöjligt eller port-brott")
    a2("")
    if roda:
        a2("| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |")
        a2("|--------|-------|---------|------|-----|------|----------|")
        for r in roda:
            a2(d1_rad(r))
    else:
        a2("- Inga röda bolag.")
    a2("")
    a2("## 7. Täckning per variabel (osatta av 100 bolag)")
    a2("")
    a2("| Variabel | Namn | Vikt % | Osatta | Beräkningsbara |")
    a2("|----------|------|--------|--------|----------------|")
    for v in VIKTER:
        a2(f"| {v} | {VAR_NAMN[v]} | {sv(VIKTER[v], 0)} | {osatta_raknare[v]} | {100 - osatta_raknare[v]} |")
    a2("")
    a2("## 8. Varför täckningen skiljer sig mellan bolag")
    a2("")
    a2(f"Alla bolag saknar de alltid-osatta variablerna ({', '.join(alltid_osatta)} —")
    a2(f"{sv(sum(VIKTER[v] for v in alltid_osatta), 0)} viktenheter). Därtill kommer individuella")
    a2("osattheter bland de beräkningsbara variablerna (V04, V05, V06, V09, V10, V12, V19):")
    a2("")
    a2("| Extra osatta utöver de alltid-osatta | Viktenheter | Bolag | Täckning |")
    a2("|--------------------------------------|-------------|-------|----------|")
    for signatur in sorted(signaturer, key=lambda s: (sum(VIKTER[v] for v in s), s)):
        extra = tuple(v for v in signatur if v not in alltid_osatta_sign)
        extra_str = ", ".join(extra) if extra else "— (endast de alltid-osatta)"
        antal = len(signaturer[signatur])
        tat = (97 - sum(VIKTER[v] for v in signatur)) / 97.0
        a2(f"| {extra_str} | {sv(sum(VIKTER[v] for v in extra), 0)} | {antal} | {sv(tat * 100)} % |")
    a2("")
    a2("## 9. Återföring")
    a2("")
    a2("1. D1 är en **redovisningskalibrering**: bolagspoängen är oförändrade — endast")
    a2("   status-trösklarna och UI:t visar nu taket som datatäckningen sätter.")
    a2("2. Varje grön bedömning med täckning < 100 % bör läsas mot sitt maxMöjligt")
    a2("   (”poäng/max” i korstabellen) — 70 % av ett lägt tak är ett svagare utlåtande.")
    a2("3. Bästa vägen till täckning ≥ 80 % (grönt täckningschip) förblir pass 2:")
    a2("   bruttovinsthistorik (V14), aktieantalshistorik (V20), balanshistorik (V11),")
    a2("   ARR/segment (V02–V03) — se P6 §9.")
    a2("")
    a2("---")
    a2("")
    a2("*Verktyg: `verktyg/python/sammanstalla_korstabell.py` (D1-tillägg 2026-09-03,")
    a2("samma skript som P6-korstabellen — inget nätverk, läser befintliga cacher).*")
    a2("")
    a2("*AK1A Research Lab — pedagogisk forskning. ALDRIG investeringsråd.*")

    skriv_fil(RAPPORTFIL_D1, "\n".join(d) + "\n")

    print(f"Skrev {KORSTABELLFIL.replace(REPO_ROT + os.sep, '')} ({len(rader)} rader)")
    print(f"Skrev {RAPPORTFIL.replace(REPO_ROT + os.sep, '')}")
    print(f"Skrev {RAPPORTFIL_D1.replace(REPO_ROT + os.sep, '')}")
    print(f"Medel {sv(medel)} | median {sv(median)} | grön {status_raknare['gron']} / gul {status_raknare['gul']} / röd {status_raknare['rod']}")
    print(f"Trösklar: fasta (P6) grön {fast_raknare['gron']} / gul {fast_raknare['gul']} / röd {fast_raknare['rod']} → D1-skalade ovan")
    print(f"Datatackning: spann {sv(tat_min * 100)}–{sv(tat_max * 100)} %")
    print(f"Port-brott: {[t for t, _, _, _ in port_bolag]}")
    print(f"Beräkningsbara variabler: {len(berakningsbara)} av 20: {', '.join(berakningsbara)}")
    print("Pedagogisk forskning — ALDRIG investeringsråd.")
    return 0 if not saknade else 1


if __name__ == "__main__":
    sys.exit(main())
