#!/usr/bin/env python3
"""AK1A Kelly — diskret scenario-Kelly, kontinuerlig Kelly och verklighetsfilter.

Moln-version moln-v1 (våg 103, 2026-09-11): stdlib-portning av kundens
lokala skill-skript (~/.agents/skills/ak1a-analys/scripts/kelly.py) —
samma CLI, samma metodik, inga beroenden (körbar på servern).

Metodikens kärna: om samtliga scenariomål ligger över spot är diskret Kelly
formellt obegränsat — det är en diagnos av felkalibrerade odds, inte en gåva.
Slutlig positionsstorlek sätts av RISKBUDGETEN (acceptabel förlust / avstånd
till stopp), med Kelly-talet och filtren som tak.

Exempel (PREC 2026-08-08):
  python kelly.py --probs 0.10,0.45,0.45 --returns 1.36,0.63,0.08 \
      --sigma 0.99 --mu 0.374 --stop-dist 0.10 --portfolio-loss 0.005
"""
import argparse
import json
import math


def discrete_kelly(probs, returns):
    """Lös f* = argmax E[ln(1+f·R)] genom gyllene-sektion-sökning på [0, bound]."""
    def ev(f):
        return sum(p * math.log(1 + f * r) for p, r in zip(probs, returns))
    if min(returns) >= 0:
        return None  # q = 0 → divergerar formellt
    # gyllene-sektion efter maximum (ev är konkav i f där 1+f·R > 0)
    phi = (5 ** 0.5 - 1) / 2
    a = 0.0
    b = min(1e6, -1.0 / min(r for r in returns if r < 0) * 0.999)
    c, d = b - phi * (b - a), a + phi * (b - a)
    for _ in range(200):
        if ev(c) > ev(d):
            b, d = d, c
            c = b - phi * (b - a)
        else:
            a, c = c, d
            d = a + phi * (b - a)
    return (a + b) / 2


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--probs", required=True, help="p per scenario, komma-separerat")
    p.add_argument("--returns", required=True,
                   help="Avkastning mot spot per scenario (t.ex. 1.36 = +136 %)")
    p.add_argument("--sigma", type=float, help="Årlig volatilitet för kontinuerlig Kelly")
    p.add_argument("--mu", type=float, help="Årlig drift för kontinuerlig Kelly")
    p.add_argument("--stop-dist", type=float,
                   help="Avstånd till stopp i decimal (0.10 = −10 %)")
    p.add_argument("--portfolio-loss", type=float, default=0.005,
                   help="Acceptabel portföljförlust vid stopp (default 0,5 %)")
    p.add_argument("--index-sigma", type=float, default=0.18,
                   help="Referensvolatilitet för vol-budgetfiltret (default 18 %)")
    a = p.parse_args()

    probs = [float(x) for x in a.probs.split(",")]
    rets = [float(x) for x in a.returns.split(",")]
    out = {"scenarier": {"sannolikheter": probs, "avkastningar": rets},
           "vantevarde": round(sum(p * r for p, r in zip(probs, rets)), 4),
           "min_utfall": min(rets)}

    fk = discrete_kelly(probs, rets)
    out["diskret_kelly"] = ("OBEGRÄNSAT — alla utfall positiva; modellen saknar "
                            "förlustgren och är inte kalibrerad (AK1A-diagnos)"
                            if fk is None else round(fk, 4))

    if a.mu is not None and a.sigma:
        out["kontinuerlig_kelly_f"] = round(a.mu / a.sigma**2, 4)

    chain = []
    base = out.get("kontinuerlig_kelly_f") or (fk if fk else None)
    if base is None:
        chain.append({"filter": "full Kelly", "kvar": "obegänsat/odefinierat — oanvändbart"})
    else:
        v1 = base / 10
        chain.append({"filter": "modellosäkerhetsrabatt (~1/10)", "kvar": round(v1, 4)})
        v2 = v1 * (a.index_sigma / a.sigma)
        chain.append({"filter": f"volatilitetsbudget (∝ 1/σ, {a.index_sigma:.0%} referens)",
                      "kvar": round(v2, 4)})
        v3 = v2 / 2
        chain.append({"filter": "halvering vid binärt utfall inom 90 dagar", "kvar": round(v3, 4)})
    out["verklighetsfilter"] = chain

    if a.stop_dist:
        size = a.portfolio_loss / a.stop_dist
        out["riskbudget_storlek"] = {
            "formel": "acceptabel_förlust / stopp_avstånd",
            "storlek": round(size, 4),
            "som_pct_av_portfoljen": f"{size * 100:.1f} %",
            "not": "Storleken sätts av riskbudgeten — Kelly-talet är tak och diagnos.",
        }

    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
