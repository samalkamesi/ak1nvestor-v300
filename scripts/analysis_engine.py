#!/usr/bin/env python3
"""
AK1A Analysis Engine — 5×5×4-ekosystem per aktie.
5 horisonter (Mikro/Kort/Medellång/Lång/Mega) × 5 teorier (Elliott/Fibonacci/
GANN/Lucas/Volym) × signal -1/0/+1, plus riskmått. Ärlighet: signalerna är
heuristiska proxy-mätare beräknade ur pris/volymdata (Yahoo Finance primärt,
Stooq som sekundär källa när symbol finns) — inte fulla Elliott-räkningar.
Teorierna är struktureringsverktyg utan vetenskapligt belagd prediktiv förmåga.

Kör: echo '{"tickers":["PREC.ST"]}' | python scripts/analysis_engine.py
"""
import sys, json, math, os, re, datetime, socket, urllib.request
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor

HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"]
TEORIER = ["elliott", "fibonacci", "gann", "lucas", "volym"]
ALLOWED_HOSTS = {
    "stooq.com", "www.stooq.com",
    "query1.finance.yahoo.com", "query2.finance.yahoo.com",
    "api.marketstack.com",
}


def _privat_ip(ip: str) -> bool:
    return ip.startswith(("127.", "10.", "192.168.", "169.254.", "::1", "fe80:", "0.")) or (
        ip.startswith("172.") and 16 <= int(ip.split(".")[1]) <= 31)


def _kontrollera_host(host_const: str) -> None:
    """Kontrollerar FAST värdkonstant mot allowlist + privat-IP (DNS om direkt före anrop)."""
    if host_const not in ("query1.finance.yahoo.com", "stooq.com", "api.marketstack.com"):
        raise ValueError("blockerad värd")
    ip = socket.getaddrinfo(host_const, 443, socket.AF_INET)[0][4][0]
    if _privat_ip(ip):
        raise ValueError("blockerad privat IP")


class _IngenRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("redirect blockerad")


def fetch_yahoo(ticker, period="1y", interval="1d"):
    """Yahoos publika chart-API — inga pip-beroenden (fungerar på Vercel serverless)."""
    try:
        _kontrollera_host("query1.finance.yahoo.com")
        ticker_kod = urllib.request.quote(ticker)
        if not re.fullmatch(r"[A-Za-z0-9.\-]{1,12}", ticker):
            return None
        url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker_kod + "?range=" + period + "&interval=" + interval
        opener = urllib.request.build_opener(_IngenRedirect)
        req = urllib.request.Request(url, headers={"User-Agent": "AK1A-Analysis/1.0"})
        raw = opener.open(req, timeout=15).read().decode()
        res = json.loads(raw)["chart"]["result"][0]
        meta = res.get("meta", {}) or {}
        q = res["indicators"]["quote"][0]
        dagar = res["timestamp"]
        close, high, low, vol = [], [], [], []
        for i in range(len(dagar)):
            c = q["close"][i]
            if c is None:
                continue
            close.append(round(float(c), 6))
            high.append(round(float(q["high"][i] or c), 6))
            low.append(round(float(q["low"][i] or c), 6))
            vol.append(float(q["volume"][i] or 0))
        if len(close) < 30:
            return None
        return {"close": close, "high": high, "low": low, "vol": vol,
                "meta": {k: meta.get(k) for k in
                         ("longName", "shortName", "currency", "fullExchangeName",
                          "fiftyTwoWeekHigh", "fiftyTwoWeekLow")}}
    except Exception:
        return None


def fetch_marketstack(ticker):
    """MarketStack (Business API) — färskhetsvaliderad: data äldre än 7 dagar avvisas."""
    key = os.environ.get("MARKETSTACK_KEY", "")
    if not key:
        return None
    symbol = ticker.replace(".ST", ".XSTO").replace(".st", ".XSTO")
    fran = (datetime.date.today() - datetime.timedelta(days=740)).isoformat()
    try:
        _kontrollera_host("api.marketstack.com")
        url = ("https://api.marketstack.com/v1/eod?access_key=" + key
               + "&symbols=" + urllib.request.quote(symbol) + "&date_from=" + fran + "&limit=1000")
        opener = urllib.request.build_opener(_IngenRedirect)
        req = urllib.request.Request(url, headers={"User-Agent": "AK1A-Analysis/1.0"})
        raw = opener.open(req, timeout=15).read().decode()
        rader = json.loads(raw).get("data") or []
        if len(rader) < 30:
            return None
        # Sortera stigande på datum; avvisa om senaste är för gammal (XSTO kan vara inaktuell)
        rader.sort(key=lambda r: r["date"])
        senast = rader[-1]["date"][:10]
        import datetime as _dt
        if (_dt.date.fromisoformat(senast) - _dt.date.today()).days < -7:
            return None
        close = [round(float(r["close"]), 6) for r in rader if r.get("close")]
        high = [round(float(r.get("high") or r["close"]), 6) for r in rader]
        low = [round(float(r.get("low") or r["close"]), 6) for r in rader]
        vol = [float(r.get("volume") or 0) for r in rader]
        return {"close": close, "high": high, "low": low, "vol": vol, "kalla": "marketstack"}
    except Exception:
        return None


def fetch_stooq(ticker):
    sym = ticker.lower().replace(".st", "").replace("-", "")
    try:
        _kontrollera_host("stooq.com")
        url = "https://stooq.com/q/d/l/?s=" + sym + "se&i=d"
        opener = urllib.request.build_opener(_IngenRedirect)
        req = urllib.request.Request(url, headers={"User-Agent": "AK1A-Analysis/1.0"})
        raw = opener.open(req, timeout=10).read().decode()
        lines = [l.split(",") for l in raw.strip().splitlines() if "," in l]
        if len(lines) < 40 or "Close" not in lines[0]:
            return None
        ci = lines[0].index("Close")
        closes = [float(r[ci]) for r in lines[1:] if r[ci] not in ("", "N/D")]
        return {"close": closes, "high": [], "low": [], "vol": []}
    except Exception:
        return None


def momentum(closes, n):
    if len(closes) <= n or closes[-n - 1] == 0:
        return None
    return closes[-1] / closes[-n - 1] - 1


def atr(highs, lows, closes, n=14):
    if len(closes) < n + 1 or not highs:
        return None
    trs = [max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]),
               abs(lows[i] - closes[i - 1])) for i in range(-n, 0)]
    return sum(trs) / len(trs)


def sigma_year(closes):
    if len(closes) < 30:
        return None
    rets = [math.log(closes[i] / closes[i - 1]) for i in range(1, len(closes)) if closes[i - 1] > 0]
    m = sum(rets) / len(rets)
    var = sum((r - m) ** 2 for r in rets) / (len(rets) - 1)
    return math.sqrt(var) * math.sqrt(252)


def ma(closes, n):
    if len(closes) < n:
        return None
    return sum(closes[-n:]) / n


def vag_klassificering(mom, pris, ma_ref):
    """Heuristisk vågklass: impulsvåg / korrigering / basbygge / osatt."""
    if mom is None:
        return "osatt"
    if mom > 0.06 and (ma_ref is None or pris >= ma_ref):
        return "impulsvåg"
    if mom < -0.06 and (ma_ref is None or pris < ma_ref):
        return "korrigering"
    if abs(mom) <= 0.06:
        return "basbygge"
    return "impulsvåg" if mom > 0 else "korrigering"


def sign(x, t=0.03):
    return 1 if x > t else (-1 if x < -t else 0)


def analysera_ticker(ticker):
    dag = fetch_yahoo(ticker, "2y", "1d")
    vecka = fetch_yahoo(ticker, "5y", "1wk")
    stooq = fetch_stooq(ticker)
    ms = fetch_marketstack(ticker)  # färskhetsvaliderad; None om data >7 dagar gammal
    kallor = 1 + (1 if stooq else 0) + (1 if ms else 0)

    if not dag and ms:
        dag = ms  # MarketStack som fallback när Yahoo fallerar (endast färska data)
    if not dag:
        return {"ticker": ticker, "fel": "ingen data (Yahoo/MarketStack)"}

    c = dag["close"]
    pris = c[-1]
    hojd52 = max(dag["high"] or c)
    lag52 = min(dag["low"] or c)
    span = max(1e-12, hojd52 - lag52)
    pos52 = (pris - lag52) / span

    moms = {
        "mikro": momentum(c, 5),
        "kort": momentum(c, 63),
        "medellang": momentum(c, 252 if len(c) > 252 else len(c) - 1),
    }
    if vecka and len(vecka["close"]) > 150:
        moms["lang"] = vecka["close"][-1] / vecka["close"][-150] - 1
        moms["mega"] = vecka["close"][-1] / vecka["close"][0] - 1
    else:
        moms["lang"] = momentum(c, min(400, len(c) - 1))
        moms["mega"] = momentum(c, len(c) - 1)

    ma50 = ma(c, 50)
    ma200 = ma(c, min(200, len(c)))
    vol20 = sum(dag["vol"][-20:]) / 20 if len(dag["vol"]) >= 20 else None
    vol90 = sum(dag["vol"][-90:]) / 90 if len(dag["vol"]) >= 90 else vol20
    voltrend = (vol20 / vol90 - 1) if (vol20 and vol90) else None
    fib38 = hojd52 - 0.382 * span
    fib62 = hojd52 - 0.618 * span
    drift_ar = sigma_year(c)
    a14 = atr(dag["high"], dag["low"], c)

    matris = {}
    vager = {}
    for hz in HORIZONTER:
        m = moms[hz]
        vager[hz] = vag_klassificering(m, pris, ma50 if hz in ("mikro", "kort") else ma200)
        matris[f"elliott.{hz}"] = sign(m, 0.04) if m is not None else 0
        matris[f"fibonacci.{hz}"] = 1 if pos52 > 0.62 else (-1 if pos52 < 0.38 else 0)
        matris[f"gann.{hz}"] = sign((drift_ar or 0) * 0.1 + (m or 0) * 0.3, 0.05) if m is not None else 0
        lucas_n = {"mikro": 11, "kort": 29, "medellang": 76, "lang": 199, "mega": min(500, len(c) - 1)}[hz]
        lm = momentum(c, min(lucas_n, len(c) - 1))
        matris[f"lucas.{hz}"] = sign(lm, 0.05) if lm is not None else 0
        if voltrend is not None and m is not None:
            matris[f"volym.{hz}"] = sign(voltrend * (1 if m > 0 else -1), 0.05)
        else:
            matris[f"volym.{hz}"] = 0

    celler = [matris[f"{t}.{h}"] for t in TEORIER for h in HORIZONTER]
    bull = sum(1 for x in celler if x > 0)
    bear = sum(1 for x in celler if x < 0)

    return {
        "ticker": ticker,
        "kallor": kallor,
        "namn": (dag.get("meta", {}).get("longName") or dag.get("meta", {}).get("shortName") or ticker),
        "bors": dag.get("meta", {}).get("fullExchangeName"),
        "valuta": dag.get("meta", {}).get("currency"),
        "data": {
            "pris": round(pris, 4), "hojd52": round(hojd52, 4), "lag52": round(lag52, 4),
            "pos52": round(pos52, 3),
            "sigma_ar": round(drift_ar, 4) if drift_ar else None,
            "atr14": round(a14, 4) if a14 else None,
            "ma50": round(ma50, 4) if ma50 else None,
            "ma200": round(ma200, 4) if ma200 else None,
            "vol20": round(vol20) if vol20 else None,
            "voltrend": round(voltrend, 4) if voltrend is not None else None,
            "fib38": round(fib38, 4), "fib62": round(fib62, 4),
        },
        "momentum": {k: (round(v, 4) if v is not None else None) for k, v in moms.items()},
        "vager": vager,
        "matris25": matris,
        "sammanfattning": {"bull": bull, "bear": bear, "neutral": 25 - bull - bear},
        "notering": "Heuristiska proxy-signaler från pris/volym (Yahoo%s) — pedagogiskt verktyg, inte investeringsråd." % ("+Stooq" if stooq else ""),
    }


def main():
    req = json.loads(sys.stdin.read() or "{}")
    tickers = req.get("tickers", [])[:12]
    with ThreadPoolExecutor(max_workers=4) as ex:
        resultat = list(ex.map(analysera_ticker, tickers))
    print(json.dumps({"tickers": resultat}, ensure_ascii=False))


if __name__ == "__main__":
    main()
