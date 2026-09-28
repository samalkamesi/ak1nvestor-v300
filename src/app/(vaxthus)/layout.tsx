import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Växthuset — bygg din sida med AI",
  description: "Bygg din egen sida med en AI-agent — samma system som byggde lab.ak1nvestor.com.",
  robots: { index: false, follow: false },
};

export default function VaxthusLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
