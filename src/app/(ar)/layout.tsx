import "@/app/globals.css";
import {
  GlobaltSkal,
  spegelRotMetadata,
  globaltViewport,
} from "@/components/ak1a/globalt-skal";

/**
 * (ar)-ROTLAYOUT (VÅG 85 — html-lang-massflyttet) — de 13 arabiska
 * spegelrutternas dokumentägare.
 *
 * <html lang="ar" dir="rtl"> direkt i SSR-HTML (dir ägs av GlobaltSkal för
 * lang="ar"; f.d. src/app/ar/layout.tsx inline-skript raderat). Annars som
 * (en): SpegelSprakLeverantor("ar"), spegel-JSON-LD, fonts, lazy-globaler,
 * spegelRotMetadata("ar") som default-canonical mot /ar. URL:er oförändrade:
 * sidorna ligger under (ar)/ar/** ⇒ /ar/**.
 */
export const metadata = spegelRotMetadata("ar");
export const viewport = globaltViewport;

export default function ArLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GlobaltSkal lang="ar">{children}</GlobaltSkal>;
}
