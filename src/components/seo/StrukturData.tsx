/**
 * STRUKTURDATA (våg 122F — beslut mtzou25g åtgärd 7+8): sajtens generiska,
 * återanvändbara komponent för strukturerade data (schema.org JSON-LD).
 *
 * Renderar ETT <script type="application/ld+json">-block per anrop —
 * säkert för SSR/ISR: JSON.stringify escape:ar strängvärden och vi ersätter
 * dessutom "<" samt radbrytningstecknen U+2028/U+2029 som kan bryta
 * inbäddning i äldre parser-pipeliner. INGEN tolkning av data sker här —
 * komponenten är ren presentation; schema-byggandet lever i lib-lagret
 * (src/lib/seo.tsx + src/lib/schema-kurser.ts) nära innehållets sanning.
 *
 * Användning (server components):
 *   import { StrukturData } from "@/components/seo/StrukturData";
 *   <StrukturData data={schema.course} />
 *   <StrukturData data={articleJsonLd(post)} id="jsonld-artikel" />
 *
 * REGEL (våg 122F): ETT block per sidtyp — en kurssida renderar EN Course +
 * EN FAQPage + EN BreadcrumbList; aldrig dubbletter av samma @type på en
 * sida (Google Rich Results kan annars fälla validierungen).
 *
 * Juridikgrind: beskrivningar i allt schema formuleras som UTBILDNING
 * ("så fungerar metoden") — aldrig rekommendationsspråk (lagen 2007:528).
 */

export type StrukturDataProps = {
  /** Schema.org-objektet (eller @graph-array) som ska serialiseras. */
  data: object | object[];
  /** Valfritt DOM-id för testbarhet/framtidens debugging. */
  id?: string;
};

/** Serialiserar schema-data till injektionssäker JSON-sträng. */
function serialisera(data: object | object[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function StrukturData({ data, id }: StrukturDataProps) {
  return (
    <script
      type="application/ld+json"
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: serialisera(data) }}
    />
  );
}

export default StrukturData;
