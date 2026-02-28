import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "../context/DataContext";
import NavBar from "../components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFO.ai",
  description: "Actionable runway guidance powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DataProvider>
          <div className="min-h-screen px-4 py-6 sm:px-8 lg:px-16 max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold neon-text muted-glow tracking-tight">
                CFO.ai
              </h1>
              <p className="mt-2 text-slate-500 text-sm max-w-md mx-auto">
                Upload financials &middot; Analyze burn &middot; Extend runway
              </p>
            </header>

            {/* Nav */}
            <div className="flex justify-center mb-8">
              <NavBar />
            </div>

            {/* Page content */}
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
