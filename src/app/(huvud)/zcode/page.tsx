import ZcodeKlient from "./zcode-klient";

/**
 * /ZCODE — EN-TRYCKS-INGÅNGEN (kunddirektivet "komma in med ett tryck",
 * 2026-09-30): en sida som tar kunden DIREKT in i ZCode-chatten — ingen
 * sidebar, ingen meny, bara chatt + input i ZCode-tema (mörk #0D1117).
 *
 * Filialen ligger i (huvud)-gruppen (prefixlös — URL är /zcode) för
 * svensk rot-layout, men sidan renderar EGEN fullscreen-yta: h-dvh +
 * overflow-hidden = app-känsla, body scrollar ALDRIG (bara chattytan).
 *
 * SERVER-WRAPPER (studio-page-mönstret, o16): segment-config-exporter är
 * endast tillåtna i server-komponenter; allt klientarbete bor i
 * zcode-klient.tsx. SSR-yn är ALLTID den neutrala kollar-vyn (authad=false
 * tills klientens sessionskontroll svarat) ⇒ HTML:en cache-bar som vanligt
 * innehåll: 3600 + swr = husets gröna mönster (o13).
 */
export const revalidate = 3600;

export default function ZcodeSida() {
  return <ZcodeKlient />;
}
