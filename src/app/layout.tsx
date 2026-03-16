// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Nunito } from "next/font/google";
import localFont from "next/font/local";
import TopBar from "@/components/TopBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const instrumentSerif = localFont({ src: "./fonts/InstrumentSerif-Regular.ttf", variable: "--font-instrument-serif", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "First Principles",
  description: "A curiosity-driven STEM learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${nunito.variable} font-sans antialiased`}>
        <TopBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
