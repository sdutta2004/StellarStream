import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
  weight: ["400", "500", "600"],
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
    <html lang="en">
      <body className={`${jakarta.variable} ${firaCode.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <Providers>
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="lg:pl-64 min-h-screen flex flex-col bg-slate-50/50">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="flex-1 px-4 md:px-8 py-8 max-w-screen-2xl mx-auto w-full">
              {children}
            </main>

            {/* Footer */}
            <footer className="lg:pl-0 border-t border-slate-200 bg-white px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} <span className="gradient-text font-bold">StellarStream</span> — Real-Time XLM Payment Streaming Protocol</span>
              <div className="flex items-center gap-4">
                <a href="https://github.com/sdutta2004/StellarStream" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Explorer</a>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />Testnet</span>
              </div>
            </footer>
          </div>

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            theme="light"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#0F172A",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
