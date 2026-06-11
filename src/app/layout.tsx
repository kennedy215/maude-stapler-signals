import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maude-stapler-signals.vercel.app"),
  title: "MAUDE Signal Explorer — Surgical Staplers",
  description:
    "An independent human-factors lens on FDA MAUDE adverse-event data for surgical staplers: reporting trends, use-error signals, and what post-market data can (and can't) tell HFE teams.",
  openGraph: {
    title: "MAUDE Signal Explorer — Surgical Staplers",
    description:
      "A human-factors lens on FDA adverse-event data for surgical staplers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
