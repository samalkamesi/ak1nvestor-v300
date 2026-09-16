import StudioKlient from "./studio-klient";

/**
 * /STUDIO — kundens EGEN webchat mot ZCode-agenten på servern (VÅG 81
 * WEBCHAT-STUDIO, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81"). Filialen ligger i
 * (huvud)-gruppen (prefixlös — URL är /studio) för delad typografi och
 * svenska rot-layouten (VÅG 85).
 *
 * SERVER-WRAPPER (o16, spår 7 cache-rond 3): segment-config-exporter är
 * endast tillåtna i SERVER-komponenter — samma regel som layout.tsx redan
 * dokumenterar för viewport. Allt klientarbete (lås-vy + StudioChat) bor i
 * studio-klient.tsx; denna wrapper gör inget annat än att återge den och
 * sätta ISR-cachen. SSR-yn är ALLTID den personligt neutrala låsvyn
 * (authad=false tills klientens sessionskontroll svarat), därför är
 * HTML:en cache-bar som vanligt innehåll: 3600 + swr = husets gröna
 * mönster (o13) — årslåset s-maxage=31536000 utan swr är borta.
 */

export const revalidate = 3600;

export default function StudioSida() {
  return <StudioKlient />;
}
