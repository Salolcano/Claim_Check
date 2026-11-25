import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { WalletProvider } from "@/components/wallet-provider";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Claimcheck - claims, checked on chain",
  description:
    "List the claims in a published piece, put the sources on the record, and let GenLayer validators rule on every claim. The author's public record follows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <WalletProvider>
          <SiteHeader />
          <main>{children}</main>
          <footer className="hair" style={{ marginTop: 120 }}>
            <div className="wrap" style={{ padding: "32px 24px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
              <span className="label">&copy; 2026 claimcheck. MIT license. Built on GenLayer Studio Next.</span>
              <a href="/status" className="label" style={{ textDecoration: "underline" }}>status and diagnostics</a>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
