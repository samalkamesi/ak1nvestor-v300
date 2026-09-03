#!/usr/bin/env python3
"""
AK1A Vagfundament — fundamentalvagornas ekosystem (VAGFUNDAMENT-SPEC P1-P8).

Per (aktie, AKM1-variabel V01-V20, horisont) beraknas en deterministisk
vagklass for variabelns EGN tidsserie: impulsvag / korrigering / basbygge /
osatt (P2: samma data -> samma svar). Horisonter enligt P3 (kvartal/ar).
Kalla: Yahoo fundamentals-timeseries pa query2 (ar + kvartal, ~4 ar / 5
kvartal tjock historik) — lang horisont (5 ar) blir darfor ofta "osatt".
Arighet (P8): saknad data => "osatt", ALDRIG gissa.

Kor:
  echo '{"tickers":["VOLV-B.ST"]}' | python scripts/vagfundament.py
  echo '{"tickers":["VOLV-B.ST","AAPL"],"vikter":{"VOLV-B.ST":0.7,"AAPL":0.3}}' | ...

Pedagogiskt verktyg — inte investeringsrad.
"""
import sys, json, re, time, socket, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

# P3 — horisonter for fundamentaldata (kvartal/ar, inte dagar)
HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"]
HZ_NAMN = {"mikro": "mikro", "kort": "kort", "medellang": "medellång",
           "lang": "lång", "mega": "mega"}

# P6 — kategorier med AKM1:s kategorivikter (superanalys.ts)
KATEGORIER = [
    ("tillvaxt", "Tillväxt", 0.15),
    ("vardering", "Värdering", 0.20),
    ("lonsamhet", "Lönsamhet", 0.20),
    ("stabilitet", "Stabilitet", 0.15),
    ("moat", "Moat", 0.15),
    ("katalysator", "Katalysator", 0.05),
    ("risk", "Risk", 0.10),
]

# V01-V20 med ekosystemets betydelser
VARIABLER = [
    ("V01", "Försäljningstillväxt", "tillvaxt"),
    ("V02", "ARR-tillväxt", "tillvaxt"),
    ("V03", "Intäktsdiversifiering", "tillvaxt"),
    ("V04", "P/S", "vardering"),
    ("V05", "P/B", "vardering"),
    ("V06", "EV/EBITDA", "vardering"),
    ("V07", "Bruttomarginal", "lonsamhet"),
    ("V08", "EBITDA-marginal", "lonsamhet"),
    ("V09", "ROE", "lonsamhet"),
    ("V10", "Skuldsättningsgrad", "stabilitet"),
    ("V11", "Likviditet", "stabilitet"),
    ("V12", "Intäktsstabilitet", "stabilitet"),
    ("V13", "Patent & IP", "moat"),
    ("V14", "Varumärke & Kundlojalitet", "moat"),
    ("V15", "Nätverkseffekter", "moat"),
    ("V16", "Produktlanseringar", "katalysator"),
    ("V17", "Avtal & Partnerskap", "katalysator"),
    ("V18", "Regulatoriska katalysatorer", "katalysator"),
    ("V19", "Kapitalförbrukning & Emission-risk", "risk"),
    ("V20", "Återköp", "risk"),
]
V_NAMN = {v[0]: v[1] for v in VARIABLER}
V_KAT = {v[0]: v[2] for v in VARIABLER}

VAG_TAL = {"impulsvåg": 1, "korrigering": -1, "basbygge": 0}

# Variabler som inte kan harledas ur Yahoo-serier (P5: nuvarde-baserade -> osatt)
OSATTA_VARIABLER = {"V02", "V03", "V06", "V13", "V14", "V15", "V16", "V17", "V18"}

ALLOWED_HOSTS = {"query2.finance.yahoo.com"}

TS_TYPER = [
    "annualTotalRevenue", "quarterlyTotalRevenue",
    "annualGrossProfit", "quarterlyGrossProfit",
    "annualOperatingIncome", "quarterlyOperatingIncome",
    "annualEbitda", "quarterlyEbitda",
    "annualNetIncome", "quarterlyNetIncome",
    "annualStockholdersEquity", "quarterlyStockholdersEquity",
    "annualTotalDebt", "quarterlyTotalDebt",
    "annualCurrentAssets", "quarterlyCurrentAssets",
    "annualCurrentLiabilities", "quarterlyCurrentLiabilities",
    "annualCashFlowFromOperating", "quarterlyCashFlowFromOperating",
    "annualCapitalExpenditure", "quarterlyCapitalExpenditure",
    "annualFreeCashFlow", "quarterlyFreeCashFlow",
    "annualShareIssued", "quarterlyShareIssued",
    "annualMarketCap", "quarterlyMarketCap",
    "annualCashAndCashEquivalents", "quarterlyCashAndCashEquivalents",
]


def _privat_ip(ip: str) -> bool:
    return ip.startswith(("127.", "10.", "192.168.", "169.254.", "::1", "fe80:", "0.")) or (
        ip.startswith("172.") and 16 <= int(ip.split(".")[1]) <= 31)


def _kontrollera_host(host_const: str) -> None:
    """Kontrollerar FAST vardkonstant mot allowlist + privat-IP (DNS fore anrop)."""
    if host_const not in ALLOWED_HOSTS:
        raise ValueError("blockerad värd")
    ip = socket.getaddrinfo(host_const, 443, socket.AF_INET)[0][4][0]
    if _privat_ip(ip):
        raise ValueError("blockerad privat IP")


class _IngenRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("redirect blockerad")


_CRUMB_CACHE = {"crumb": None, "cookie": None}


def _yahoo_crumb():
    """Cookie + crumb enligt analysis_engine._yahoo_crumb-monstret.
    Anvands ENDAST som reservande nar fundamentals-endpointen kraver crumb
    (primarflowen under query2 behover ingen crumb). Returnerar None vid fel."""
    if _CRUMB_CACHE["crumb"] and _CRUMB_CACHE["cookie"]:
        return _CRUMB_CACHE["cookie"], _CRUMB_CACHE["crumb"]
    try:
        _kontrollera_host("query2.finance.yahoo.com")
        opener = urllib.request.build_opener(_IngenRedirect)
        # fc.yahoo.com svarar 404 men satter cookie (samma knapp som forlagen)
        try:
            r = opener.open(
                urllib.request.Request("https://fc.yahoo.com", headers={"User-Agent": "Mozilla/5.0 (AK1A)"}),
                timeout=6)
            cookie = r.headers.get("Set-Cookie") or ""
        except urllib.error.HTTPError as e:
            cookie = e.headers.get("Set-Cookie") or ""
        cookie = cookie.split(";")[0]
        if not cookie:
            return None
        r2 = opener.open(
            urllib.request.Request(
                "https://query2.finance.yahoo.com/v1/test/getcrumb",
                headers={"User-Agent": "Mozilla/5.0 (AK1A)", "Cookie": cookie}),
            timeout=6)
        crumb = r2.read().decode().strip()
        if not crumb:
            return None
        _CRUMB_CACHE["crumb"] = crumb
        _CRUMB_CACHE["cookie"] = cookie
        return cookie, crumb
    except Exception:
        return None


def _get_json_text(url, cookie=None, timeout=15):
    _kontrollera_host("query2.finance.yahoo.com")
    opener = urllib.request.build_opener(_IngenRedirect)
    headers = {"User-Agent": "Mozilla/5.0 (AK1A)"}
    if cookie:
        headers["Cookie"] = cookie
    req = urllib.request.Request(url, headers=headers)
    return opener.open(req, timeout=timeout).read().decode("utf-8")


def _parsa_timeseries(raw):
    """{'typnamn': [(datum, varde), ...]} sorterat stigande;Null-rader kastas."""
    ut = {}
    valuta = None
    try:
        d = json.loads(raw)
        for blk in (d.get("timeseries") or {}).get("result") or []:
            for namn, rader in blk.items():
                if namn in ("meta", "timestamp") or not isinstance(rader, list):
                    continue
                serie = []
                for rad in rader:
                    if not isinstance(rad, dict):
                        continue
                    if valuta is None and rad.get("currencyCode"):
                        valuta = rad.get("currencyCode")
                    varde = (rad.get("reportedValue") or {}).get("raw")
                    datum = rad.get("asOfDate")
                    if varde is None or not datum:
                        continue
                    serie.append((str(datum)[:10], float(varde)))
                if serie:
                    serie.sort(key=lambda p: p[0])
                    ut[namn] = serie
    except Exception:
        return {}, None
    return ut, valuta


def hamta_fundament(ticker):
    """Yahoo fundamentals-timeseries (ar + kvartal) via query2.
    Primart utan crumb; vid 401/403 forsoks crumb+cookie (reservflode).
    Returnerar (serier, valuta) eller (None, None)."""
    if not re.fullmatch(r"[A-Za-z0-9.\-]{1,12}", ticker):
        return None, None
    p2 = int(time.time())
    url = ("https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"
           + urllib.request.quote(ticker)
           + "?type=" + ",".join(TS_TYPER)
           + "&period1=0&period2=" + str(p2) + "&merge=false")
    try:
        raw = _get_json_text(url)
    except urllib.error.HTTPError as e:
        if e.code not in (401, 403):
            return None, None
        par = _yahoo_crumb()
        if not par:
            return None, None
        cookie, crumb = par
        try:
            raw = _get_json_text(url + "&crumb=" + urllib.request.quote(crumb), cookie=cookie)
        except Exception:
            return None, None
    except Exception:
        return None, None
    serier, valuta = _parsa_timeseries(raw)
    return (serier, valuta) if serier else (None, None)


# ── Seriehjalpmedel ──────────────────────────────────────────────────────────

def _kv(data, namn):
    """Kvartalsserie som varden (stigande)."""
    return [v for _, v in (data.get("quarterly" + namn) or [])]


def _ar(data, namn):
    return [v for _, v in (data.get("annual" + namn) or [])]


def _kvot(data, tal_typ, namnare_typ):
    """Kvotserie pa matchade datum (P5 enhetlighetsregel: kvartalsvis fore arsvis)."""
    nam = {d: v for d, v in (data.get(namnare_typ) or [])}
    ut = []
    for d, v in (data.get(tal_typ) or []):
        n = nam.get(d)
        if n is None or n == 0 or v is None:
            continue
        ut.append(v / n)
    return ut


def _fcf_serie(data, prefix):
    """FCF = kassaflode lonande verksamhet minus capex (teckenrobust)."""
    capex = {d: v for d, v in (data.get(prefix + "CapitalExpenditure") or [])}
    ut = []
    for d, cfo in (data.get(prefix + "CashFlowFromOperating") or []):
        cx = capex.get(d)
        if cfo is None or cx is None:
            continue
        ut.append(cfo + cx if cx < 0 else cfo - cx)
    return ut


def _rull12(serie):
    """Summa av de 4 senaste kvartalen (None om historiken ar for kort)."""
    if len(serie) < 4:
        return None
    return sum(serie[-4:])


def _r0(x, n=2):
    """round() utan -0.0 i utdata (deterministisk normalisering)."""
    if x is None:
        return None
    v = round(x, n)
    return 0.0 if v == 0 else v


def _medel(varden):
    v = [x for x in varden if x is not None]
    return sum(v) / len(v) if v else None


# ── P2: deterministisk klassificering ────────────────────────────────────────

def _momentum(nu, forr):
    """Relativ forandring av variabelns eget varde. Guard: bara positiva par —
    serier som vaxlar tecken (t.ex. ROE genom noll) ger meningslos momentum."""
    if nu is None or forr is None:
        return None
    if nu <= 0 or forr <= 0:
        return None
    return nu / forr - 1.0


def vag_klassificering(mom, senaste, medel):
    """P2 exakt — pris-motorns granser for konsekvent ekosystem:
    impulsvag: momentum > +6% OCH senaste >= horisontens medel
    korrigering: momentum < -6% OCH senaste <= medel
    basbygge: |momentum| <= 6%
    momentum utan medel-bekraftelse -> momentumriktningen galler (dokumenterat).
    Returnerar (klass, medel_bekraftad); bekraftad=None nar orelevant."""
    if mom is None:
        return "osatt", None
    if abs(mom) <= 0.06:
        return "basbygge", None
    if mom > 0.06:
        if medel is None:
            return "impulsvåg", None
        return "impulsvåg", senaste >= medel
    if medel is None:
        return "korrigering", None
    return "korrigering", senaste <= medel


def _cell(kv, ar, hz, invertera=False):
    """(V, H)-cell enligt P3.
    mikro: qoq, jamforelse-medel = 4k-rull · kort: yoy, medel = 4 kvartal
    medellang: arstakt 3 ar, medel = 3 ars · lang: 5 ar · mega: hela serien.
    invertera=True (V20): minskat aktieantal = positivt momentum (aterekop)."""
    mom = senaste = medel = None
    if hz == "mikro":
        if len(kv) >= 2:
            mom, senaste, medel = _momentum(kv[-1], kv[-2]), kv[-1], _medel(kv[-4:])
    elif hz == "kort":
        if len(kv) >= 5:
            mom, senaste, medel = _momentum(kv[-1], kv[-5]), kv[-1], _medel(kv[-4:])
    elif hz == "medellang":
        if len(ar) >= 4:
            mom, senaste, medel = _momentum(ar[-1], ar[-4]), ar[-1], _medel(ar[-3:])
    elif hz == "lang":
        if len(ar) >= 6:
            mom, senaste, medel = _momentum(ar[-1], ar[-6]), ar[-1], _medel(ar[-5:])
    elif hz == "mega":
        if len(ar) >= 4:
            mom, senaste, medel = _momentum(ar[-1], ar[0]), ar[-1], _medel(ar)
    if mom is None:
        return {"vag": "osatt", "momentum": None, "medelBekraftad": None}
    if invertera:
        mom = -mom
        senaste = -senaste
        if medel is not None:
            medel = -medel
    klass, bek = vag_klassificering(mom, senaste, medel)
    return {"vag": klass, "momentum": _r0(mom * 100, 1), "medelBekraftad": bek}


def _v12_celler(data):
    """V12 Intaktsstabilitet (P5): ned/upp-antal i intaktsrorelserna ->
    vag via trend. momentum = (antal upp - antal ned) / antal rorelser.
    Fonster KRAVS fulla: mikro 3 kv · kort 5 kv (8-kvartsfonstret upp till
    tillgangligt) · medellang 4 ar · lang 6 ar · mega hela arsserien (>= 4).
    Ofullstandigt fonster -> osatt (P3: saknas data, gissa aldrig)."""
    kv, ar = _kv(data, "TotalRevenue"), _ar(data, "TotalRevenue")
    fonster = {"mikro": (kv, 3), "kort": (kv, 5),
               "medellang": (ar, 4), "lang": (ar, 6), "mega": (ar, None)}
    ut = {}
    for hz, (serie, n) in fonster.items():
        min_antal = n if n is not None else 4
        if len(serie) < min_antal:
            ut[hz] = {"vag": "osatt", "momentum": None, "medelBekraftad": None}
            continue
        f = serie[-n:] if n else serie
        rorelser = [f[i] - f[i - 1] for i in range(1, len(f))]
        if not rorelser:
            ut[hz] = {"vag": "osatt", "momentum": None, "medelBekraftad": None}
            continue
        upp = sum(1 for r in rorelser if r > 0)
        ned = sum(1 for r in rorelser if r < 0)
        mom = (upp - ned) / len(rorelser)
        klass, bek = vag_klassificering(mom, f[-1], _medel(f))
        ut[hz] = {"vag": klass, "momentum": _r0(mom * 100, 1), "medelBekraftad": bek}
    return ut


# ── Niva-mappning (AKM1-trosklar 0-5, deterministisk) ────────────────────────

def _r5(x):
    """Avrundning halv upp + clamp 0-5 (deterministisk, inga bankers rounding)."""
    return max(0, min(5, int(x + 0.5)))


def _niva_trappa(varde, p3, p5):
    """Linjar interpolering mellan AKM1-trosklarna (0 vid negativ, 3 vid p3,
    5 vid p5 och ovanfor) — for variabler dar hogre ar battre."""
    if varde is None:
        return None
    if varde < 0:
        return 0
    if varde >= p5:
        return 5
    if varde >= p3:
        return _r5(3 + 2 * (varde - p3) / (p5 - p3))
    return _r5(3 * varde / p3)


def _niva_skuld(d):
    """V10 (lagre ar battre): <=0.5x -> 5 · ~1.5x -> 3 · >=3x -> 0."""
    if d is None:
        return None
    d = max(d, 0.0)
    if d <= 0.5:
        return 5
    if d <= 1.5:
        return _r5(5 - 2 * (d - 0.5))
    if d < 3.0:
        return _r5(3 * (3.0 - d) / 1.5)
    return 0


def _niva_likviditet(c):
    """V11 kvickkvot-proxy: <1 -> 0 · ~1.5 -> 3 · >=2 -> 5."""
    if c is None:
        return None
    if c < 1:
        return 0
    if c >= 2:
        return 5
    if c >= 1.5:
        return _r5(3 + 2 * (c - 1.5) / 0.5)
    return _r5(3 * (c - 1) / 0.5)


def _niva_position_hist(nu, hist):
    """V04/V05: position i egen historik (sektor finns inte i kalldata).
    Kraver minst 3 historikpunkter — annars osatt."""
    if nu is None or not hist or len(hist) < 3:
        return None
    lo, hi = min(hist), max(hist)
    if hi <= lo:
        return 3
    if nu > hi:
        return 0
    pos = (nu - lo) / (hi - lo)
    if pos <= 0.2:
        return 5
    if pos <= 0.4:
        return 4
    if pos <= 0.6:
        return 3
    if pos <= 0.8:
        return 2
    return 1


# ── Indikator-bygge ──────────────────────────────────────────────────────────

def _tom_cell():
    return {"vag": "osatt", "momentum": None, "medelBekraftad": None}


def _ind_fran_celler(vid, celler, nuvarde, niva, enhet):
    vager = {hz: celler[hz]["vag"] for hz in HORIZONTER}
    return {
        "namn": V_NAMN[vid],
        "kategori": V_KAT[vid],
        "niva": niva,
        "nivaKalla": "beraknad" if niva is not None else "osatt",
        "nuvarde": nuvarde,
        "enhet": enhet,
        "vager": vager,
        "momentum": {hz: celler[hz]["momentum"] for hz in HORIZONTER},
        "medelBekraftad": {hz: celler[hz]["medelBekraftad"] for hz in HORIZONTER},
    }


def _ind_serie(vid, kv, ar, nuvarde, niva, enhet, invertera=False):
    celler = {hz: _cell(kv, ar, hz, invertera) for hz in HORIZONTER}
    return _ind_fran_celler(vid, celler, nuvarde, niva, enhet)


def _ind_osatt(vid):
    return _ind_fran_celler(vid, {hz: _tom_cell() for hz in HORIZONTER}, None, None, None)


def bygg_indikatorer(data):
    """P5: standardiserad faltmappning -> variabelserier -> (niva, vag)-par."""
    ind = {}

    rev_kv, rev_ar = _kv(data, "TotalRevenue"), _ar(data, "TotalRevenue")
    rev12 = _rull12(rev_kv)

    # V01 — omsattningens yoy-takt som grundvara; vagen = intaktsseriens momentum
    v01 = None
    if len(rev_kv) >= 5 and sum(rev_kv[-5:-1]) > 0:
        v01 = sum(rev_kv[-4:]) / sum(rev_kv[-5:-1]) - 1.0
    elif len(rev_ar) >= 2 and rev_ar[-2] > 0:
        v01 = rev_ar[-1] / rev_ar[-2] - 1.0
    ind["V01"] = _ind_serie("V01", rev_kv, rev_ar,
                            round(v01, 4) if v01 is not None else None,
                            _niva_trappa(v01, 0.10, 0.20), "procent")

    # V04 — P/S: arsserie (bor svardemang / omsattning); historik enligt P5
    ps_ar = _kvot(data, "annualMarketCap", "annualTotalRevenue")
    mcap_kv = _kv(data, "MarketCap")
    ps_nu = None
    if mcap_kv and rev12 and rev12 > 0:
        ps_nu = mcap_kv[-1] / rev12
    elif ps_ar:
        ps_nu = ps_ar[-1]
    ind["V04"] = _ind_serie("V04", [], ps_ar,
                            round(ps_nu, 3) if ps_nu is not None else None,
                            _niva_position_hist(ps_nu, ps_ar), "kvot")

    # V05 — P/B: kvartalsserie (mcap/ekvitet) + arsserie for langre horisonter
    pb_kv = _kvot(data, "quarterlyMarketCap", "quarterlyStockholdersEquity")
    pb_ar = _kvot(data, "annualMarketCap", "annualStockholdersEquity")
    pb_nu = pb_kv[-1] if pb_kv else (pb_ar[-1] if pb_ar else None)
    pb_hist = pb_ar if len(pb_ar) >= 3 else pb_kv
    ind["V05"] = _ind_serie("V05", pb_kv, pb_ar,
                            round(pb_nu, 3) if pb_nu is not None else None,
                            _niva_position_hist(pb_nu, pb_hist), "kvot")

    # V07 — bruttomarginal (rull-12 for niva)
    gp_kv = _kvot(data, "quarterlyGrossProfit", "quarterlyTotalRevenue")
    gp_ar = _kvot(data, "annualGrossProfit", "annualTotalRevenue")
    gp_rull = None
    gp_kv_r = _kv(data, "GrossProfit")
    if len(gp_kv_r) >= 4 and rev12 and rev12 > 0:
        gp_rull = sum(gp_kv_r[-4:]) / rev12
    elif gp_ar:
        gp_rull = gp_ar[-1]
    ind["V07"] = _ind_serie("V07", gp_kv, gp_ar,
                            round(gp_rull, 4) if gp_rull is not None else None,
                            _niva_trappa(gp_rull, 0.25, 0.40), "procent")

    # V08 — EBITDA-marginal (om ebitda saknas: rorelseresultat enligt P5)
    eb_kv = _kvot(data, "quarterlyEbitda", "quarterlyTotalRevenue") or \
        _kvot(data, "quarterlyOperatingIncome", "quarterlyTotalRevenue")
    eb_ar = _kvot(data, "annualEbitda", "annualTotalRevenue") or \
        _kvot(data, "annualOperatingIncome", "annualTotalRevenue")
    eb_kv_r = _kv(data, "Ebitda") or _kv(data, "OperatingIncome")
    eb_rull = None
    if len(eb_kv_r) >= 4 and rev12 and rev12 > 0:
        eb_rull = sum(eb_kv_r[-4:]) / rev12
    elif eb_ar:
        eb_rull = eb_ar[-1]
    ind["V08"] = _ind_serie("V08", eb_kv, eb_ar,
                            round(eb_rull, 4) if eb_rull is not None else None,
                            _niva_trappa(eb_rull, 0.10, 0.20), "procent")

    # V09 — ROE (rull-12 pa snittekvitet enligt AKM1:s formel)
    roe_kv = _kvot(data, "quarterlyNetIncome", "quarterlyStockholdersEquity")
    roe_ar = _kvot(data, "annualNetIncome", "annualStockholdersEquity")
    ni_kv, eq_kv = _kv(data, "NetIncome"), _kv(data, "StockholdersEquity")
    roe_nu = None
    if len(ni_kv) >= 4 and len(eq_kv) >= 5 and (eq_kv[-5] + eq_kv[-1]) != 0:
        roe_nu = sum(ni_kv[-4:]) / ((eq_kv[-5] + eq_kv[-1]) / 2)
    elif roe_ar:
        roe_nu = roe_ar[-1]
    ind["V09"] = _ind_serie("V09", roe_kv, roe_ar,
                            round(roe_nu, 4) if roe_nu is not None else None,
                            _niva_trappa(roe_nu, 0.10, 0.20), "procent")

    # V10 — skuldsattningsgrad (total skuld / ekvitet)
    de_kv = _kvot(data, "quarterlyTotalDebt", "quarterlyStockholdersEquity")
    de_ar = _kvot(data, "annualTotalDebt", "annualStockholdersEquity")
    de_nu = de_kv[-1] if de_kv else (de_ar[-1] if de_ar else None)
    ind["V10"] = _ind_serie("V10", de_kv, de_ar,
                            round(de_nu, 3) if de_nu is not None else None,
                            _niva_skuld(de_nu), "kvot")

    # V11 — likviditet (omsattningstillgangar / kortfristiga skulder)
    li_kv = _kvot(data, "quarterlyCurrentAssets", "quarterlyCurrentLiabilities")
    li_ar = _kvot(data, "annualCurrentAssets", "annualCurrentLiabilities")
    li_nu = li_kv[-1] if li_kv else (li_ar[-1] if li_ar else None)
    ind["V11"] = _ind_serie("V11", li_kv, li_ar,
                            round(li_nu, 3) if li_nu is not None else None,
                            _niva_likviditet(li_nu), "kvot")

    # V12 — intaktsstabilitet via ned/upp-antal (egen celllogik)
    ind["V12"] = _ind_fran_celler("V12", _v12_celler(data), None, None, None)

    # V19 — FCF som serie; niva via runway (kassa / forbranning).
    # FCF = CFO - capex enligt P5; om nagon komponent saknas i kallean faller
    # motorn tillbaka pa Yahoo:s egna FreeCashFlow-serie (samma endpoint).
    fcf_kv, fcf_ar = _fcf_serie(data, "quarterly"), _fcf_serie(data, "annual")
    if not fcf_kv:
        fcf_kv = _kv(data, "FreeCashFlow")
    if not fcf_ar:
        fcf_ar = _ar(data, "FreeCashFlow")
    fcf12 = _rull12(fcf_kv)
    if fcf12 is None and fcf_ar:
        fcf12 = fcf_ar[-1]
    kassa_kv, kassa_ar = _kv(data, "CashAndCashEquivalents"), _ar(data, "CashAndCashEquivalents")
    kassa_nu = kassa_kv[-1] if kassa_kv else (kassa_ar[-1] if kassa_ar else None)
    v19_niva = None
    if fcf12 is not None:
        if fcf12 > 0:
            v19_niva = 5
        elif kassa_nu is not None and fcf12 < 0:
            v19_niva = 3 if kassa_nu / abs(fcf12) >= 3 else 0
        elif fcf12 == 0:
            v19_niva = 3
    ind["V19"] = _ind_serie("V19", fcf_kv, fcf_ar,
                            round(fcf12 / 1e6, 1) if fcf12 is not None else None,
                            v19_niva, "miljoner (valuta)")

    # V20 — aktieantal som serie; INVERTERAD momentum (aterekop = minskning)
    sc_kv, sc_ar = _kv(data, "ShareIssued"), _ar(data, "ShareIssued")
    v20_delta = None
    if len(sc_kv) >= 5 and sc_kv[-5] > 0:
        v20_delta = sc_kv[-1] / sc_kv[-5] - 1.0
    elif len(sc_ar) >= 2 and sc_ar[-2] > 0:
        v20_delta = sc_ar[-1] / sc_ar[-2] - 1.0
    v20_niva = None
    if v20_delta is not None:
        if v20_delta > 0.005:
            v20_niva = 0  # utspadande emissioner
        elif v20_delta >= -0.005:
            v20_niva = 3  # neutral aktivitet
        else:
            v20_niva = 5 if (fcf12 or 0) > 0 else 1  # aterekop: FCF-finansierat?
    ind["V20"] = _ind_serie("V20", sc_kv, sc_ar,
                            _r0(v20_delta * 100, 2) if v20_delta is not None else None,
                            v20_niva, "procent", invertera=True)

    # V02/V03/V06/V13-V18 — nuvarde-baserade i AKM1, ingen serie i kallan -> osatt
    for vid in sorted(OSATTA_VARIABLER):
        ind[vid] = _ind_osatt(vid)
    return {vid: ind[vid] for vid, _, _ in VARIABLER}


def _klass_fran_tal(tal):
    """P6: aggregerat celltal (-1..+1) -> klasstext for rapportrader."""
    if tal is None:
        return "osatt"
    if tal >= 0.5:
        return "impulsvåg"
    if tal <= -0.5:
        return "korrigering"
    return "basbygge"


def analysera_ticker(ticker):
    serier, valuta = hamta_fundament(ticker)
    if not serier:
        return {"ticker": ticker, "fel": "ingen fundamentaldata (Yahoo fundamentals-timeseries)"}

    indikatorer = bygg_indikatorer(serier)
    matris = {}
    for vid, _, _ in VARIABLER:
        matris[vid] = {}
        for hz in HORIZONTER:
            k = indikatorer[vid]["vager"][hz]
            matris[vid][hz] = VAG_TAL[k] if k in VAG_TAL else None

    # Kategori-bild (7x5): enkel viktad okvot per kategori
    kategorier = {}
    for kid, _, _ in KATEGORIER:
        kategorier[kid] = {}
        for hz in HORIZONTER:
            celler = [matris[v[0]][hz] for v in VARIABLER if v[2] == kid and matris[v[0]][hz] is not None]
            kategorier[kid][hz] = round(sum(celler) / len(celler), 3) if celler else None

    # AKM1-helhet: kategorierna viktade med AKM1:s kategorivikter
    total = {}
    for hz in HORIZONTER:
        tal = vik = 0.0
        for kid, _, vikt in KATEGORIER:
            t = kategorier[kid][hz]
            if t is not None:
                tal += t * vikt
                vik += vikt
        total[hz] = round(tal / vik, 3) if vik > 0 else None

    alla = [matris[v[0]][hz] for v in VARIABLER for hz in HORIZONTER]
    sammanfattning = {
        "impulsvag": sum(1 for x in alla if x is not None and x > 0),
        "korrigering": sum(1 for x in alla if x is not None and x < 0),
        "basbygge": sum(1 for x in alla if x is not None and x == 0),
        "osatt": sum(1 for x in alla if x is None),
    }

    # Senaste rapportdatum for kontext
    datum = set()
    for namn in ("quarterlyTotalRevenue", "quarterlyStockholdersEquity", "quarterlyShareIssued"):
        for d, _ in (serier.get(namn) or [])[-1:]:
            datum.add(d)
    data_per = max(datum) if datum else None

    return {
        "ticker": ticker,
        "valuta": valuta,
        "dataPer": data_per,
        "indikatorer": indikatorer,
        "matris": matris,
        "kategorier": kategorier,
        "total": total,
        "sammanfattning": sammanfattning,
        "notering": (
            "Fundamentalserier från Yahoo (query2): cirka 4 år årsdata och 5 kvartal — "
            "lång horisont (5 år) och delar av historiken är därför ofta osatta. "
            "Momentumklassificering enligt ekosystemets gemensamma gränser; celler utan "
            "medel-bekräftelse redovisas med momentumriktningen. Återköp (V20) läses inverted: "
            "minskat aktieantal = positiv våg."
        ),
        "disclaimer": (
            "AK1A Vågfundament är ett pedagogiskt analysverktyg — inte investeringsråd. "
            "Klassificeringar är deterministiska hjälpmätare på fundamentaldata från Yahoo Finance."
        ),
    }


# ── P6: portfoljsaggregering (forst varje aktie, sedan helheten) ──────────────

def _normalisera_vikter(resultat, vikter):
    """Saknad vikt => medel av angivna vikter (eller 1.0 om inga angivna)."""
    angivna = [float(v) for v in vikter.values() if isinstance(v, (int, float)) and v > 0]
    standard = sum(angivna) / len(angivna) if angivna else 1.0
    ut = {}
    for r in resultat:
        v = vikter.get(r["ticker"])
        ut[r["ticker"]] = float(v) if isinstance(v, (int, float)) and v > 0 else standard
    return ut


def portfoljaggregera(resultat, vikter_obj):
    vikt_tab = _normalisera_vikter(resultat, vikter_obj)

    # Cellvis viktat genomsnitt (null-hopp) over de 20x5 cellerna
    matris = {}
    for vid, _, _ in VARIABLER:
        matris[vid] = {}
        for hz in HORIZONTER:
            tal = vik = 0.0
            for r in resultat:
                if r.get("fel") or not r.get("matris"):
                    continue
                cell = r["matris"].get(vid, {}).get(hz)
                if cell is None:
                    continue
                tal += cell * vikt_tab[r["ticker"]]
                vik += vikt_tab[r["ticker"]]
            matris[vid][hz] = round(tal / vik, 3) if vik > 0 else None

    kategorier = {}
    for kid, _, _ in KATEGORIER:
        kategorier[kid] = {}
        for hz in HORIZONTER:
            celler = [matris[v[0]][hz] for v in VARIABLER if v[2] == kid and matris[v[0]][hz] is not None]
            kategorier[kid][hz] = round(sum(celler) / len(celler), 3) if celler else None

    total = {}
    for hz in HORIZONTER:
        tal = vik = 0.0
        for kid, _, vikt in KATEGORIER:
            t = kategorier[kid][hz]
            if t is not None:
                tal += t * vikt
                vik += vikt
        total[hz] = round(tal / vik, 3) if vik > 0 else None

    # "Var ligger portfoljen i genomsnitt": starkaste horisont per kategori
    radTexter = []
    for kid, knamn, _ in KATEGORIER:
        basta, belopp = None, 0.0
        for hz in HORIZONTER:
            t = kategorier[kid][hz]
            if t is not None and abs(t) >= belopp:
                belopp = abs(t)
                basta = hz
        radTexter.append(knamn + ": " + (_klass_fran_tal(kategorier[kid].get(basta)) if basta else "osatt")
                         + (" på " + HZ_NAMN[basta] if basta else ""))

    total_hz, total_belopp = None, 0.0
    for hz in HORIZONTER:
        t = total[hz]
        if t is not None and abs(t) >= total_belopp:
            total_belopp = abs(t)
            total_hz = hz

    ok_vikt = sum(vikt_tab[r["ticker"]] for r in resultat if not r.get("fel"))
    all_vikt = sum(vikt_tab.values())

    return {
        "matris": matris,
        "kategorier": kategorier,
        "total": total,
        "radTexter": radTexter,
        "totalText": ("Portföljen i genomsnitt: " + _klass_fran_tal(total.get(total_hz))
                      + (" på " + HZ_NAMN[total_hz] if total_hz else "")) if total_hz else "Portföljen i genomsnitt: osatt",
        "tackningProcent": round(100 * ok_vikt / all_vikt) if all_vikt > 0 else 0,
        "notering": (
            "Cellvis viktat genomsnitt per (variabel, horisont) utan null-hopp; "
            "kategori- och totalrader enligt AKM1:s kategorivikter. Aggregerade tal mellan "
            "−1 och +1; klassgränser vid ±0,5. Pedagogiskt verktyg — inte investeringsråd."
        ),
    }


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    req = json.loads(sys.stdin.read() or "{}")
    tickers = req.get("tickers", [])[:12]
    vikter = req.get("vikter") or {}
    with ThreadPoolExecutor(max_workers=4) as ex:
        resultat = list(ex.map(analysera_ticker, tickers))
    ut = {"tickers": resultat}
    if vikter and tickers:
        ut["portfolj"] = portfoljaggregera(resultat, vikter)
    print(json.dumps(ut, ensure_ascii=False))


if __name__ == "__main__":
    main()
