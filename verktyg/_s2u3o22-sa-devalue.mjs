// SA SvelteKit __data.json-devalue-hydratör (s2-u3 omg22) — indexreferenser in i data-poolen
export function hydratera(d) {
  const pool = d.nodes[1].data;
  const losning = (x, guard) => {
    if (guard.has(x)) return "[CYKEL]";
    if (typeof x === "number") { guard.add(x); const v = losning(pool[x], guard); guard.delete(x); return v; }
    if (Array.isArray(x)) return x.map((e) => losning(e, guard));
    if (x && typeof x === "object") { const o = {}; for (const [k, v] of Object.entries(x)) o[k] = losning(v, guard); return o; }
    return x;
  };
  return losning(pool[0], new Set());
}
