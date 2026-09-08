import "@/app/globals.css";
import {
  GlobaltSkal,
  huvudMetadata,
  globaltViewport,
} from "@/components/ak1a/globalt-skal";

/**
 * (huvud)-ROTLAYOUT (VÅG 85 — html-lang-massflyttet) — ALLT sv + neutralt.
 *
 * Äger <html lang="sv"> via GlobaltSkal (src/components/ak1a/globalt-skal.tsx)
 * + dagens rot-metadata (huvudMetadata() = ordagrann kopia av f.d.
 * src/app/layout.tsx:70-144) + globaltViewport + fonts via @/lib/typografi.
 * Gamla src/app/layout.tsx raderad (atomärt) — varje route-grupp äger sitt
 * dokument. URL:er oförändrade: (huvud) är prefixlös. Se STYRELSE-VAG85-FLYTT.
 */
export const metadata = huvudMetadata();
export const viewport = globaltViewport;

export default function HuvudLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GlobaltSkal lang="sv">{children}</GlobaltSkal>;
}
