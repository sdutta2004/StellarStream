import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StellarStream | Real-Time Payment & Salary Streaming Protocol",
  description:
    "Decentralized real-time XLM payment streaming and salary vesting protocol on Stellar blockchain. Stream funds per second, vest salaries on-chain, and earn STRM tokens powered by Soroban smart contracts.",
  keywords: [
    "StellarStream",
    "Stellar",
    "Soroban",
    "payment streaming",
    "salary vesting",
    "real-time payments",
    "STRM token",
    "blockchain",
    "DApp",
    "XLM",
    "smart contracts",
  ],
  openGraph: {
    title: "StellarStream",
    description: "Real-time XLM payment streaming protocol on Stellar Testnet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="lg:pl-64 min-h-screen flex flex-col bg-gradient-to-b from-black/40 via-black/20 to-black/40">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="flex-1 px-4 md:px-8 py-8 max-w-screen-2xl mx-auto w-full">
              {children}
            </main>

            {/* Footer */}
            <footer className="lg:pl-0 border-t border-white/[0.06] px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} <span className="gradient-text font-semibold">StellarStream</span> — Real-Time XLM Payment Streaming Protocol</span>
              <div className="flex items-center gap-4">
                <a href="https://github.com/sdutta2004/StellarStream" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Explorer</a>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Testnet</span>
              </div>
            </footer>
          </div>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(234, 22%, 10%)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "hsl(210, 40%, 98%)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
