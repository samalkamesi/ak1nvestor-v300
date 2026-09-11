#!/usr/bin/env python3
"""AK1A Monte Carlo — GBM + valfria diskreta hopp (Merton-typ).

Moln-version moln-v1 (våg 103, 2026-09-11): stdlib-portning av kundens
lokala skill-skript (~/.agents/skills/ak1a-analys/scripts/monte_carlo.py) —
samma CLI, samma metodik, inga beroenden (körbar på servern). Notera:
stdlib-Random ger andra slumptalsströmmar än numpy vid samma seed, men
reproducerbarheten inom moln-versionen består (samma seed → samma utdata).

Reproducerbar: seed låses som standard till analysdagens datum (YYYYMMDD),
i enlighet med AK1A-metodikens krav på spårbar kvantmatematik.

Exempel (PREC 2026-08-08-läget):
  python monte_carlo.py --S0 0.86 --sigma 0.99 --mu 0.374 \
      --levels 0.82,1.25,1.40,2.03 --min-levels 0.82

μ-kalibrering mot scenarioväntevärde: mu = ln(EV/S0)/T.
  python monte_carlo.py --S0 0.86 --sigma 0.99 --target-mean 1.25 --levels 0.82
"""
import argparse
import datetime as _dt
import json
import math
import random


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--S0", type=float, required=True, help="Senaste stängning")
    p.add_argument("--sigma", type=float, required=True, help="Årlig volatilitet, t.ex. 0.99")
    p.add_argument("--mu", type=float, default=None,
                   help="Årlig logaritmisk drift. Om utelämnad krävs --target-mean.")
    p.add_argument("--target-mean", type=float, default=None,
                   help="Vägt scenarioväntevärde E[S_T] — kalibrerar mu = ln(EV/S0)/T.")
    p.add_argument("--days", type=int, default=252, help="Horisont i handelsdagar (default 252)")
    p.add_argument("--paths", type=int, default=10_000, help="Antal pather (default 10 000)")
    p.add_argument("--levels", type=str, default="",
                   help="Komma-separerade nivåer för terminal-/touch-sannolikheter")
    p.add_argument("--min-levels", type=str, default="",
                   help="Komma-separerade nivåer för P(min under perioden < nivå)")
    p.add_argument("--seed", type=int, default=None,
                   help="Seed (default: dagens datum YYYYMMDD)")
    p.add_argument("--jumps", type=str, default="",
                   help="Diskreta hopp, '|'-separerade: 'dag;faktor:sannolikhet,...' "
                        "t.ex. '5;1.08:0.60,0.80:0.25,0.90:0.15' (multiplikativa "
                        "faktorer, driftkompenseras automatiskt)")
    return p.parse_args()


def parse_jumps(spec, mu, days, paths):
    """Tolka hopp-spec och returnera (dag, faktorer, sannolikheter, kompensationsfaktor)."""
    parts = spec.split(";")
    day = int(parts[0])
    branches = []
    for b in parts[1].split(","):
        size, prob = b.split(":")
        branches.append((float(size), float(prob)))
    total = sum(p for _, p in branches)
    if abs(total - 1.0) > 1e-6:
        raise SystemExit(f"Hopp-sannolikheter på dag {day} summerar till {total}, inte 1,0")
    factors = [s for s, _ in branches]
    probs = [p for _, p in branches]
    e_jump = sum(f * p for f, p in zip(factors, probs))
    # Driftkompensation: bevara E[path] genom att skala om diffusionen efter hoppen.
    comp = 1.0 / e_jump if abs(e_jump) > 1e-12 else 1.0
    return day, factors, probs, comp


def percentile(sorted_vals, q):
    """Percentil ur en redan sorterad lista (linjär interpolering, som numpy)."""
    n = len(sorted_vals)
    if n == 1:
        return sorted_vals[0]
    pos = (n - 1) * (q / 100.0)
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return sorted_vals[lo]
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (pos - lo)


def main():
    a = parse_args()
    if a.mu is None and a.target_mean is None:
        raise SystemExit("Ange antingen --mu eller --target-mean")
    mu = math.log(a.target_mean / a.S0) if a.mu is None else a.mu
    seed = a.seed if a.seed is not None else int(_dt.date.today().strftime("%Y%m%d"))
    rng = random.Random(seed)
    n, T = a.paths, a.days
    dt = 1.0 / 252.0
    drift = (mu - 0.5 * a.sigma**2) * dt
    diffus = a.sigma * math.sqrt(dt)

    logS = [math.log(a.S0)] * n
    mins = [a.S0] * n
    maxs = [a.S0] * n
    comp_total = 1.0
    jump_days = {}
    if a.jumps:
        for spec in a.jumps.split("|"):
            day, factors, probs, comp = parse_jumps(spec, mu, T, n)
            jump_days[day] = (factors, probs)
            comp_total *= comp
    comp_per_dag = math.log(comp_total) / T

    for t in range(1, T + 1):
        if t in jump_days:
            factors, probs = jump_days[t]
            for i in range(n):
                z = rng.gauss(0.0, 1.0)
                jump = factors[rng.choices(range(len(factors)), weights=probs, k=1)[0]]
                logS[i] += drift + diffus * z + math.log(jump) + comp_per_dag
                s = math.exp(logS[i])
                if s < mins[i]:
                    mins[i] = s
                if s > maxs[i]:
                    maxs[i] = s
        else:
            for i in range(n):
                z = rng.gauss(0.0, 1.0)
                logS[i] += drift + diffus * z + comp_per_dag
                s = math.exp(logS[i])
                if s < mins[i]:
                    mins[i] = s
                if s > maxs[i]:
                    maxs[i] = s

    sT = [math.exp(x) for x in logS]
    sT_sorted = sorted(sT)

    def pct(q):
        return percentile(sT_sorted, q)

    out = {
        "parametrar": {
            "S0": a.S0, "sigma": a.sigma, "mu": mu,
            "mu_kalla": "target-mean-kalibrerad" if a.mu is None else "explicit",
            "dagar": T, "pather": n, "seed": seed,
            "hopp": a.jumps or None,
        },
        "percentiler": {f"P{q}": round(pct(q), 4) for q in (5, 10, 25, 50, 75, 90, 95)},
        "median": round(pct(50), 4),
        "vantevarde_E_ST": round(sum(sT) / n, 4),
        "variance_drag": {
            "median_vs_S0_pct": round((pct(50) / a.S0 - 1) * 100, 1),
            "forlust_per_ar_från_sigma": round(-0.5 * a.sigma**2 * 100, 1),
        },
        "terminal": {},
        "touch": {},
        "P_min_under": {},
    }
    if a.levels:
        for lv in [float(x) for x in a.levels.split(",")]:
            out["terminal"][f"P(S_T > {lv})"] = round(
                sum(1 for s in sT if s > lv) / n * 100, 1)
            out["touch"][f"P(max > {lv})"] = round(
                sum(1 for m in maxs if m > lv) / n * 100, 1)
    if a.min_levels:
        for lv in [float(x) for x in a.min_levels.split(",")]:
            out["P_min_under"][f"P(min < {lv})"] = round(
                sum(1 for m in mins if m < lv) / n * 100, 1)

    print(json.dumps(out, indent=2, ensure_ascii=False))
    print("\n— AK1A-påminnelse: GBM är referensfördelning, inte prognos. "
          "Scenariomodellen bär sannolikhetsmassan; verkliga utfall är klustervis "
          "diskreta vid magnetnivåer.")


if __name__ == "__main__":
    main()
