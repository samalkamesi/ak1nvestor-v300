#!/usr/bin/env python3
"""AK1A Bayes — prior → posterior och vägt scenariomål.

Moln-version moln-v1 (våg 103, 2026-09-11): stdlib-portning av kundens
lokala skill-skript (~/.agents/skills/ak1a-analys/scripts/bayes.py) —
samma CLI, samma metodik, inga beroenden (körbar på servern).

Tre hypoteser (Bull/Base/Bear). Likelihoods anges explicit — metodikens
disciplinregel: uppdatera aldrig på känsla, endast på fördefinierade bevis.

Exempel (PREC 2026-08-08: prior 20/50/30, bevis E = TERP-brott + TR-kollaps):
  python bayes.py --prior 0.20,0.50,0.30 --likelihood 0.18,0.30,0.55 \
      --targets 2.03,1.40,0.93

Framåtmatris (förskrivna posteriors före t.ex. emissionsutfall):
  python bayes.py --prior 0.10,0.45,0.45 --forward 0.55,0.30,0.10;0.25,0.50,0.30;0.05,0.20,0.60 \
      --targets 2.03,1.40,0.93
"""
import argparse
import json


def posterior(prior, lik):
    num = [p * l for p, l in zip(prior, lik)]
    den = sum(num)
    if den <= 0:
        raise SystemExit("Alla likelihoods är noll — beviset kan inte vägas")
    return [x / den for x in num]


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--prior", required=True, help="p(Bull),p(Base),p(Bear) — summerar till 1")
    p.add_argument("--likelihood", default=None,
                   help="P(E|Bull),P(E|Base),P(E|Bear) för ett observerat bevis")
    p.add_argument("--forward", default=None,
                   help="Framåtmatris: rader ';'-separerade, varje rad = utfallsgrensens "
                        "likelihoods ','. Ger förskriven posterior per utfall.")
    p.add_argument("--targets", default=None, help="Prismål Bull,Base,Bear för vägt mål")
    a = p.parse_args()

    prior = [float(x) for x in a.prior.split(",")]
    if abs(sum(prior) - 1.0) > 1e-6:
        raise SystemExit(f"Prior summerar till {sum(prior)}, inte 1,0")
    names = ["Bull", "Base", "Bear"]
    out = {"prior": dict(zip(names, [round(x, 4) for x in prior]))}

    if a.likelihood:
        lik = [float(x) for x in a.likelihood.split(",")]
        post = posterior(prior, lik)
        out["bevis"] = {
            "likelihood": dict(zip(names, lik)),
            "rakneexempel": {
                "namnare": round(sum(pi_ * li for pi_, li in zip(prior, lik)), 4),
                "termer": {n: round(pi_ * li, 4)
                           for n, pi_, li in zip(names, prior, lik)},
            },
            "posterior": dict(zip(names, [round(x * 100, 1) for x in post])),
        }
        cur = post
    else:
        cur = prior

    if a.forward:
        rows = []
        for i, row in enumerate(a.forward.split(";"), 1):
            lik = [float(x) for x in row.split(",")]
            post = posterior(cur, lik)
            rows.append({
                "utfall": i,
                "likelihood": dict(zip(names, lik)),
                "posterior": dict(zip(names, [round(x * 100, 1) for x in post])),
            })
        out["framåtmatris"] = rows

    if a.targets:
        t = [float(x) for x in a.targets.split(",")]
        out["vagt_mal"] = round(sum(c * ti for c, ti in zip(cur, t)), 4)

    print(json.dumps(out, indent=2, ensure_ascii=False))
    print("\n— AK1A-disciplin: uppdatera Bayes först, agera sedan — aldrig omvänt.")


if __name__ == "__main__":
    main()
