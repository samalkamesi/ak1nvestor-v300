#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AK1A — P6: AKM1-bedömning (V01–V20) för samtliga 100 bolag i universet.

Läser:  data/portfolj-system/bolagsunivers.json (BolagsNyckeltal-formatet)
Skriver: data/cache/akm1-{TICKER}.json per bolag (AKM1Bedomning enligt
        src/lib/portfolj-forskning/typer.ts), TICKER sanerad: ABB.ST → ABB_ST.

FORMEL (dokumenterad, "akm2-2026" första spåret enligt data/forskning/AKM2-BESLUT.md §2):
    totalt = Σ(vikt_norm(Vxx) × poäng(Vxx)) × (100 / 5)
där vikt_norm(Vxx) = vikt(Vxx) / Σvikter. BESLUT §2:s V01–V20-tabell summerar
de facto 97 % (8+4+3+4+4+11+10+6+6+4+4+4+4+3+3+2+2+2+9+4); vikterna
normaliseras därför till Σ=1 innan viktningen. Alternativa tabellen i
r2-vikter §4.2 (summerar 100 %) har INTE använts — BESLUT-dokumentet är
normerande för byggagenter.

POÄNGKURVOR (AKM2-BESLUT §4 med exakta trösklar ur r2-vikter §6):
  V01 goldilocks (tak ~40–45 %), V06 konvex (värdefälle-hål), V07 konkav,
  V09 konkav (tak ~35 %), V19 klippfunktion. Övriga linjära band (r2: "övriga
  variabler behåller dagens linjära 0–5").

HÅRD PORT (AKM2-BESLUT §5): känd kassatäckning < 12 månader (V19) ⇒ totalt
max 45 oavsett övrigt. Port utlöses ENDAST av känt värde — osatt triggas aldrig.

ÄRLIGHETSPRINCIPEN: osatt data ⇒ 0 poäng + motivering som börjar på "osatt".
Modellen gissar aldrig. Konsekvensen (dokumenterad i P6-rapporten): 28 av 97
viktenheter (≈29 %) vilar på variabler som är osatta för samtliga bolag i
pass 1, vilket strukturellt trycker ner totalpoängen.

SÄKERHET (mönster från P1:s samla_nyckeltal.py — Mimosa L2): sanera_filnamn +
saker_sokvag med realpath-kontroll. INGET NÄTVERK — all data finns lokalt.

Pedagogisk forskning — ALDRIG investeringsråd.
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
from pathlib import Path
from statistics import pstdev

REPO_ROT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
UNIVERSFIL = os.path.join(REPO_ROT, "data", "portfolj-system", "bolagsunivers.json")
CACHE_ROT = os.path.join(REPO_ROT, "data", "cache")

# ── Säkerhetsmönster (ärvda från P1:s samla_nyckeltal.py) ────────────────────


def sanera_filnamn(ticker: str) -> str:
    """Sanera ticker till säkert filnamnsfragment (path-traversal-skydd).
    Endast [A-Za-z0-9._-] tillåts, övriga tecken ersätts med '_'; '..' och
    namn som börjar på '.' avvisas explicit."""
    if not ticker or ".." in ticker:
        raise ValueError(f"ogiltig ticker (path-traversal-misstänkt): {ticker!r}")
    rensat = re.sub(r"[^A-Za-z0-9._-]", "_", ticker)
    if not rensat or rensat.startswith("."):
        raise ValueError(f"ogiltig ticker efter sanering: {ticker!r}")
    return rensat


def saker_sokvag(rot: str, filnamn: str) -> str:
    """Bygg sökväg under rot och verifiera att den verkliga sökvägen inte
    lämnar roten (realpath-kontroll stoppar symlinks och traversal)."""
    sokvag = os.path.join(rot, filnamn)
    verklig = os.path.realpath(sokvag)
    rot_verklig = os.path.realpath(rot)
    if verklig != rot_verklig and not verklig.startswith(rot_verklig + os.sep):
        raise ValueError(f"sökväg utanför rot avvisad: {sokvag!r}")
    return sokvag


def ticker_namn(ticker: str) -> str:
    """Cache-filnamn: ABB.ST → ABB_ST (punkt ersätts enligt P6-direktiv)."""
    return sanera_filnamn(ticker).replace(".", "_")


# ── Vikter "akm2-2026" (AKM2-BESLUT §2, första spåret V01–V20) ───────────────

VIKTER = {
    "V01": 8.0, "V02": 4.0, "V03": 3.0, "V04": 4.0, "V05": 4.0,
    "V06": 11.0, "V07": 10.0, "V08": 6.0, "V09": 6.0, "V10": 4.0,
    "V11": 4.0, "V12": 4.0, "V13": 4.0, "V14": 3.0, "V15": 3.0,
    "V16": 2.0, "V17": 2.0, "V18": 2.0, "V19": 9.0, "V20": 4.0,
}
VIKT_SUMMA = sum(VIKTER.values())  # = 97,0 — normaliseras nedan (dokumenterat)

KATEGORIER = {
    "tillvaxt": ["V01", "V02", "V03"],
    "vardering": ["V04", "V05", "V06"],
    "lonsamhet": ["V07", "V08", "V09"],
    "stabilitet": ["V10", "V11", "V12"],
    "moat": ["V13", "V14", "V15"],
    "katalysator": ["V16", "V17", "V18"],
    "risk": ["V19", "V20"],
}

DATUM = "2026-09-03"  # insamlingsdatum för hela universet (manifest/hamtat)

# ── Svensk talformatering (åäö-korrekt text i motiveringar) ──────────────────


def sv(x: float, dec: int = 1) -> str:
    """Decimaltal med svensk kommatecken; 'saknas' för ogiltiga värden."""
    if x is None or not math.isfinite(x):
        return "saknas"
    f = 10 ** dec
    return str(round(x * f) / f).replace(".", ",")


def proc(x: float | None, dec: int = 1) -> str:
    """Andel (0,12) → '12,0 %'; 'saknas' för ogiltiga värden."""
    if x is None or not math.isfinite(x):
        return "saknas"
    return sv(x * 100.0, dec) + " %"


def _tal(v) -> float | None:
    """Hämta ett tal säkert ur nästlad struktur; None om det saknas/ogiltigt."""
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def hamta(post: dict, *sokvag: str) -> float | None:
    v = post
    for del_ in sokvag:
        if not isinstance(v, dict) or del_ not in v:
            return None
        v = v[del_]
    return _tal(v)


# ── Poängkurvor ──────────────────────────────────────────────────────────────
# Alla funktioner returnerar (poäng 0–5 | None om OSATT, motivering).
# None-poäng hanteras aldrig här: anroparen sätter osatt → 0 poäng.


def poang_v01(post: dict) -> tuple[int | None, str]:
    """V01 Försäljningstillväxt — goldilocks-kurva (r2 §6, tak ~40–45 %).
    Primär input: omsattningCAGR5ar (4-årsbas enligt känd begränsning);
    fallback: omsattningTillvaxtTTM."""
    cagr = hamta(post, "tillvaxt", "omsattningCAGR5ar")
    ttm = hamta(post, "tillvaxt", "omsattningTillvaxtTTM")
    bm = hamta(post, "lonksamhet", "bruttoMarginal")
    if cagr is None and ttm is None:
        return None, "osatt — ingen tillväxtdata (CAGR och TTM saknas; känd brist: ERIC-B.ST, GE, GS, INVE-B.ST, ITX.MC, JPM, PLD saknar resultaträkningshistorik)"
    g, kalla = (cagr, "5-års CAGR (4-årsbas)") if cagr is not None else (ttm, "TTM-tillväxt")
    extra = f" [{kalla}: {proc(g)}]"
    if g < -0.10:
        p = 0
    elif g < 0.0:
        p = 1
    elif g < 0.10:
        p = 2
    elif g < 0.20:
        p = 3
    elif g < 0.30:
        p = 4
    elif g <= 0.45 and bm is not None and bm >= 0.30:
        p = 5
    else:
        # 30–45 % utan bruttomarginal ≥ 30 %, eller > 45 % (hållbarhetsrabatt
        # enl. r2: extrem tillväxt mean-reverterar — > 60 % ger uttryckligen 4).
        p = 4
    not_brutto = f"; bruttomarginal {proc(bm)} (5-poängskravet ≥ 30 %)" if (0.30 <= g <= 0.45) else ""
    return p, f"Försäljningstillväxt {proc(g)}{extra}{not_brutto} → goldilocks-kurva {p}/5"


def poang_v02(post: dict) -> tuple[int | None, str]:
    return None, "osatt — ARR (årliga återkommande intäkter) redovisas ej i nyckeltalsunderlaget; klassas i manuell granskning"


def poang_v03(post: dict) -> tuple[int | None, str]:
    return None, "osatt — intäktsdiversifiering (segment/kundspridning) ingår inte i BolagsNyckeltal; kvalitativ granskning krävs"


def poang_v04(post: dict) -> tuple[int | None, str]:
    """V04 P/S — härledd identitet P/S = P/E × vinstmarginal (valutasäker:
    båda faktorerna är kvoter utan valutaenheter). Linjär bandning (r2: övriga
    linjära). SaaS-adaptern EV/Revenue (BESLUT §2) kan ej beräknas — ingen
    EV/Revenue i underlaget."""
    pe = hamta(post, "vardering", "pe")
    nm = hamta(post, "lonksamhet", "nettoMarginal")
    if pe is None or pe <= 0 or nm is None:
        return None, "osatt — P/S kunde ej härledas (P/E eller vinstmarginal saknar/ogiltig)"
    ps = pe * nm
    if ps <= 1.0:
        p = 5
    elif ps <= 2.0:
        p = 4
    elif ps <= 3.5:
        p = 3
    elif ps <= 5.0:
        p = 2
    elif ps <= 8.0:
        p = 1
    else:
        p = 0
    return p, f"P/S {sv(ps, 2)}x härlett som P/E {sv(pe, 1)} × vinstmarginal {proc(nm)} (identitet, valutasäker) → linjär band {p}/5"


def poang_v05(post: dict) -> tuple[int | None, str]:
    """V05 P/B — linjär bandning, lägre är bättre. Grahams varning för hög
    egenkapitalmultipl noteras."""
    pb = hamta(post, "vardering", "pb") or hamta(post, "vardering", "egenKapitalMultipl")
    if pb is None or pb <= 0:
        return None, "osatt — P/B (egenkapitalmultipl) saknar giltigt värde i underlaget"
    if pb <= 1.0:
        p = 5
    elif pb <= 2.0:
        p = 4
    elif pb <= 3.5:
        p = 3
    elif pb <= 5.0:
        p = 2
    elif pb <= 8.0:
        p = 1
    else:
        p = 0
    return p, f"P/B {sv(pb, 2)}x → linjär band {p}/5" + (" (Grahams ≥1,5-varning på egenkapitalmultipln är aktiverad)" if pb >= 1.5 else "")


def poang_v06(post: dict, v19_poang: int | None) -> tuple[int | None, str]:
    """V06 EV/EBITDA — konvex kurva (r2 §6). OBS PROXY: fältet evEbit är
    EV/EBIT (P1: ev/ebit_ttm), inte EV/EBITDA. EV/EBIT ≥ EV/EBITDA alltid,
    så poängen är en DOKUMENTERAD NEDRE GRÄNS (systematiskt sträng)."""
    ev_ebit = hamta(post, "vardering", "evEbit")
    if ev_ebit is None or ev_ebit <= 0:
        return None, "osatt — ingen EV/EBIT(-proxy) i underlaget"
    m = ev_ebit
    if m > 20.0:
        p = 1
    elif m >= 14.0:
        p = 2
    elif m >= 10.0:
        p = 3
    elif m >= 6.0:
        p = 4
    elif m >= 4.0:
        p = 5
    else:
        # < 4x: 5 endast om V19 ≥ 3, annars max 3 (port P4 — värdefalle-hålet)
        p = 5 if (v19_poang is not None and v19_poang >= 3) else 3
    hall = ""
    if m < 4.0:
        hall = f"; värdefalle-hål: <4x ger 5 endast om V19 ≥ 3 (V19-poäng: {v19_poang if v19_poang is not None else 'osatt'}) → {p}/5"
    return p, f"EV/EBIT {sv(m, 1)}x som NEDRE-GRÄNS-proxy för EV/EBITDA (EV/EBIT ≥ EV/EBITDA) → konvex kurva {p}/5{hall}"


def poang_v07(post: dict) -> tuple[int | None, str]:
    """V07 Bruttomarginal — konkav S-kurva (r2 §6). 5-poängsnivån kräver
    >70 % HÅLLIT 3+ år — ej verifierbar i pass 1 (bruttovinsthistorik saknas)
    → tak 4 med not."""
    bm = hamta(post, "lonksamhet", "bruttoMarginal")
    if bm is None:
        return None, "osatt — bruttomarginal saknas i underlaget"
    if bm < 0.15:
        p = 0
    elif bm < 0.25:
        p = 1
    elif bm < 0.35:
        p = 2
    elif bm < 0.50:
        p = 3
    elif bm <= 0.70:
        p = 4
    else:
        return 4, f"Bruttomarginal {proc(bm)} → konkav kurva 4/5 (5 kräver >70 % hållet 3+ år — bruttovinstserie saknas i pass 1, tak 4)"
    return p, f"Bruttomarginal {proc(bm)} → konkav kurva {p}/5"


def poang_v08(post: dict) -> tuple[int | None, str]:
    """V08 EBITDA-marginal — linjär bandning. PROXY: fältet är EBIT-marginal;
    EBITDA ≥ EBIT ⇒ poängen är dokumenterad nedre gräns."""
    em = hamta(post, "lonksamhet", "ebitMarginal")
    if em is None:
        return None, "osatt — EBIT-marginal saknas i underlaget"
    if em < 0.0:
        p = 0
    elif em < 0.06:
        p = 1
    elif em < 0.12:
        p = 2
    elif em < 0.18:
        p = 3
    elif em <= 0.25:
        p = 4
    else:
        p = 5
    return p, f"EBIT-marginal {proc(em)} som NEDRE-GRÄNS-proxy för EBITDA-marginal → linjär band {p}/5"


def poang_v09(post: dict) -> tuple[int | None, str]:
    """V09 ROE — konkav med tröskel vid kapitalkostnaden (r_e ≈ 9 %) och tak
    vid ~35 %. 5-poängsnivån kräver >35 % med 5+ års uthållighet och V10 ≤ 2 —
    uthållighet ej verifierbar (egenkapitalserien är tom i pass 1) → tak 4."""
    roe = hamta(post, "lonksamhet", "roe")
    if roe is None:
        return None, "osatt — ROE saknas i underlaget"
    if roe < 0.09:
        p = 0
        extra = " (under uppskattad kapitalkostnad ~9 % — värdeförstöringstriksel)"
    elif roe < 0.12:
        p, extra = 1, ""
    elif roe < 0.18:
        p, extra = 2, ""
    elif roe < 0.25:
        p, extra = 3, ""
    elif roe <= 0.35:
        p, extra = 4, ""
    else:
        return 4, f"ROE {proc(roe)} → konkav kurva 4/5 (5 kräver >35 % med 5+ års uthållighet och skuld/ek ≤ 2 — egenkapitalserie saknas i pass 1, tak 4)"
    return p, f"ROE {proc(roe)} → konkav kurva {p}/5{extra}"


def poang_v10(post: dict) -> tuple[int | None, str]:
    """V10 Skuldsättningsgrad (skuld/eget kapital) — linjär bandning, lägre
    är bättre. Finansbranschen: metodiskt null hos P1 (måttet meningslöst för
    banker) → osatt, triggas aldrig av port."""
    if post.get("bransch") == "finans":
        return None, "osatt (metodiskt) — skuld/EK sätts till null för finansbranschen enligt P1:s metodik; kräver branschanpassat kapitalkravsmått"
    se = hamta(post, "stabilitet", "skuldEgenkapital")
    if se is None:
        return None, "osatt — skuld/eget kapital saknas i underlaget"
    if se <= 0.3:
        p = 5
    elif se <= 0.8:
        p = 4
    elif se <= 1.5:
        p = 3
    elif se <= 2.5:
        p = 2
    elif se <= 4.0:
        p = 1
    else:
        p = 0
    return p, f"Skuld/eget kapital {sv(se, 2)} → linjär band {p}/5 (lägre är bättre)"


def poang_v11(post: dict) -> tuple[int | None, str]:
    return None, "osatt — kvick-likviditet (omsättningstillgångar/kortfristiga skulder) saknas: källorna tömde balansräkningshistoriken (känd begränsning i manifestet)"


def poang_v12(post: dict) -> tuple[int | None, str]:
    """V12 Intäktsstabilitet — volatilitetsmått ur serier.omsattning:
    standardavvikelsen på årliga tillväxttakter (yoy). Låg volatilitet =
    stabil intäktström. Serien är 4 räkenskapsår (3 yoy) — kort, noteras."""
    ser = post.get("serier") or {}
    oms = [x for x in (ser.get("omsattning") or []) if _tal(x) is not None]
    if len(oms) < 4:
        return None, f"osatt — omsättningsserie saknas/för kort ({len(oms)} punkter; känd brist för ERIC-B.ST, GE, GS, INVE-B.ST, ITX.MC, JPM, PLD)"
    yoy = [oms[i] / oms[i - 1] - 1.0 for i in range(1, len(oms)) if oms[i - 1] > 0]
    if len(yoy) < 3:
        return None, "osatt — för få positiva årskombinationer för volatilitetsmått"
    sigma = pstdev(yoy)
    if sigma <= 0.05:
        p = 5
    elif sigma <= 0.10:
        p = 4
    elif sigma <= 0.15:
        p = 3
    elif sigma <= 0.25:
        p = 2
    elif sigma <= 0.40:
        p = 1
    else:
        p = 0
    return p, f"Intäktsvolatilitet σ(yoy) {proc(sigma)} → stabilitetsband {p}/5 (4-årig serie — kort underlag, noteras)"


def poang_v13(post: dict) -> tuple[int | None, str]:
    return None, "osatt — Patent & IP är kvalitativ; ingen patentdata i pass 1 (manuell granskning krävs)"


def poang_v14(post: dict) -> tuple[int | None, str]:
    """V14 Varumärke & kundlojalitet — GROV SUBJEKTIV poäng: bruttomarginalens
    nivå som prissättningsmakt-proxy (Novy-Marx-logiken). 5-årsaggregaten som
    BESLUT-§2-avsåg är NULL för samtliga bolag i pass 1 — nuvärdet är enda
    underlaget. Tak 4 (subjektiv). Korrelerar med V07 — läs med försiktighet."""
    bm = hamta(post, "lonksamhet", "bruttoMarginal")
    if bm is None:
        return None, "osatt — bruttomarginal saknas (enda moat-proxyn i underlaget)"
    if bm < 0.15:
        p = 1
    elif bm < 0.30:
        p = 2
    elif bm < 0.50:
        p = 3
    else:
        p = 4
    return p, f"SUBJEKTIV grovpoäng {p}/4-tak: bruttomarginal {proc(bm)} som prissättningsmakt-proxy (5-årsaggregat saknas i pass 1; korrelerar med V07)"


def poang_v15(post: dict) -> tuple[int | None, str]:
    return None, "osatt — nätverkseffekter är kvalitativa; ingen data i pass 1 (manuell granskning krävs)"


def poang_v16(post: dict) -> tuple[int | None, str]:
    return None, "osatt — produktlanseringar är händelsebaserade; inget underlag i pass 1"


def poang_v17(post: dict) -> tuple[int | None, str]:
    return None, "osatt — avtal & partnerskap är händelsebaserade; inget underlag i pass 1"


def poang_v18(post: dict) -> tuple[int | None, str]:
    return None, "osatt — regulatoriska katalysatorer är händelsebaserade; inget underlag i pass 1"


def poang_v19(post: dict) -> tuple[tuple[int, bool], str]:
    """V19 Kassatäckning — klippfunktion (r2 §6). Hierarki:
      1. kassaManaderBurnRate känd → klippband (enl. P1 beräknad endast för
         bolag med negativt kassaflöde) + HÅRD PORT om < 12 mån.
      2. annars FCF-marginal: > 0 → 5 (självfinansierande), ≈ 0 (±1 % av
         omsättningen) → 4, negativ → osatt (kassan okänd — gissas aldrig).
    Returnerar ((poäng, port_utlöst), motivering)."""
    km = hamta(post, "stabilitet", "kassaManaderBurnRate")
    fcfm = hamta(post, "lonksamhet", "fcfMarginal")
    if km is not None:
        if km < 12.0:
            p, port = 0, True
        elif km <= 18.0:
            p, port = 1, False
        elif km <= 30.0:
            p, port = 2, False
        elif km <= 48.0:
            p, port = 3, False
        else:
            p, port = 4, False
        not_text = f"Kassatäckning {sv(km, 1)} mån → klippband {p}/5"
        if port:
            not_text += " — HÅRD PORT: < 12 mån ⇒ totalpoäng max 45 (AKM2-BESLUT §5)"
        if fcfm is not None and fcfm > 0:
            not_text += f" (OBS: FCF-marginal {proc(fcfm)} är samtidigt positiv — motstridiga källfält, burn-raten ges företräde enligt P1:s metodik och flaggas här)"
        return (p, port), not_text
    if fcfm is not None and fcfm > 0.01:
        return (5, False), f"FCF-marginal {proc(fcfm)} positiv → 5/5 (självfinansierande enligt r2 V19-tabellen; burn-rate ej beräknad av P1 då kassaflödet är positivt)"
    if fcfm is not None and -0.01 <= fcfm <= 0.01:
        return (4, False), f"FCF-marginal {proc(fcfm)} ≈ 0 → 4/5 (r2: '>48 mån eller FKF ≈ 0')"
    if fcfm is not None and fcfm < -0.01:
        return (0, False), f"osatt (0 poäng) — FCF-marginal {proc(fcfm)} negativ men kassatäckning i månader ej uppgiven (burn-rate beräknas endast när kassaflödesdata finns); port utlöses EJ av osatt värde"
    return (0, False), "osatt (0 poäng) — varken kassatäckning eller FCF-marginal i underlaget"


def poang_v20(post: dict) -> tuple[int | None, str]:
    """V20 Återköp — återköpsbelopp och aktieantalsminskning saknas hos alla
    källor i pass 1 (känd begränsning) → osatt. Insiderköp senaste 6 mån
    redovisas som NOT, aldrig som poänggrund."""
    insider = post.get("aterkop", {}).get("insiderkopSenaste6man")
    ins = "saknas" if insider is None else f"{int(insider)} st"
    return None, f"osatt — återköpsbelopp/aktieantalsminskning saknas hos källorna i pass 1; insiderköp 6 mån: {ins} (not, ej poänggrund)"


# ── Huvudberäkning ───────────────────────────────────────────────────────────


def bedom(post: dict) -> tuple[dict, dict]:
    """Beräknar en hel AKM1Bedomning för en BolagsNyckeltal-post.
    Returnerar (bedomning, meta) där meta bär interna fält (port, osatta)."""
    # V19 först — V06:s värdefalle-hål behöver V19-poängen
    (v19_p, port_v19), v19_m = poang_v19(post)

    fonster = {
        "V01": poang_v01, "V02": poang_v02, "V03": poang_v03,
        "V04": poang_v04, "V05": poang_v05,
        "V06": lambda p: poang_v06(p, v19_p),
        "V07": poang_v07, "V08": poang_v08, "V09": poang_v09,
        "V10": poang_v10, "V11": poang_v11, "V12": poang_v12,
        "V13": poang_v13, "V14": poang_v14, "V15": poang_v15,
        "V16": poang_v16, "V17": poang_v17, "V18": poang_v18,
    }

    poang: dict[str, int] = {}
    motivering: dict[str, str] = {}
    osatta: list[str] = []

    for vid, fn in fonster.items():
        p, m = fn(post)
        if p is None:
            poang[vid] = 0
            osatta.append(vid)
        else:
            poang[vid] = int(max(0, min(5, p)))
        motivering[vid] = m

    poang["V19"] = int(v19_p)
    motivering["V19"] = v19_m
    poang["V20"], m20 = poang_v20(post)
    motivering["V20"] = m20
    if poang["V20"] is None:
        poang["V20"] = 0
        osatta.append("V20")
    if v19_m.startswith("osatt"):
        osatta.append("V19")

    # totalt = Σ(vikt_norm × poäng) × (100/5) där vikt_norm = vikt/97
    # (BESLUT §2:s tabell summerar 97 — normalisering dokumenterad i filhuvudet)
    rå = sum(VIKTER[v] * poang[v] for v in VIKTER)
    totalt = round(rå / VIKT_SUMMA * 20.0, 1)
    if port_v19:
        totalt = min(totalt, 45.0)  # HÅRD PORT (AKM2-BESLUT §5), dokumenteras i V19-motiveringen

    per_kat = {}
    for kat, variabler in KATEGORIER.items():
        per_kat[kat] = round(sum(poang[v] for v in variabler) / len(variabler), 2)

    bedomning = {
        "ticker": post["ticker"],
        "poang": poang,
        "totalt": totalt,
        "perKategori": per_kat,
        "motivering": motivering,
        "datum": DATUM,
    }
    meta = {
        "ticker": post["ticker"],
        "namn": post.get("namn", ""),
        "bransch": post.get("bransch", ""),
        "portV19": port_v19,
        "osatta": osatta,
        "berakningsbara": [v for v in VIKTER if v not in osatta],
    }
    return bedomning, meta


def main() -> int:
    with open(UNIVERSFIL, encoding="utf-8") as f:
        univers = json.load(f)
    if not isinstance(univers, list) or not univers:
        print("FEL: bolagsunivers.json är inte en icke-tom lista", file=sys.stderr)
        return 1

    os.makedirs(CACHE_ROT, exist_ok=True)
    antal, portar, osatta_raknare = 0, [], {v: 0 for v in VIKTER}

    for post in univers:
        bedomning, meta = bedom(post)
        filnamn = f"akm1-{ticker_namn(post['ticker'])}.json"
        sokvag = saker_sokvag(CACHE_ROT, filnamn)
        # Bevakad skrivning via pathlib — saker_sokvag har redan realpath-
        # kontrollerat att målet ligger under CACHE_ROT.
        Path(os.path.realpath(sokvag)).write_text(
            json.dumps(bedomning, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8", newline="\n",
        )
        antal += 1
        if meta["portV19"]:
            portar.append((post["ticker"], bedomning["totalt"]))
        for v in meta["osatta"]:
            osatta_raknare[v] += 1

    print(f"AKM1: skrev {antal} bedömningar till data/cache/akm1-{{TICKER}}.json")
    print(f"Formel: totalt = Σ(vikt_norm × poäng) × 20, vikter = akm2-2026 (BESLUT §2, normaliserade från 97 → Σ1)")
    print(f"Port-brott (V19 < 12 mån, max 45p): {len(portar)}")
    for t, tp in portar:
        print(f"  PORT: {t} → totalt {sv(tp)}")
    print("Osatta per variabel (av 100):")
    for v in VIKTER:
        print(f"  {v}: {osatta_raknare[v]}")
    print("Pedagogisk forskning — ALDRIG investeringsråd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
