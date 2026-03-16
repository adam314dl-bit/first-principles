// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const instrumentSerif = localFont({ src: "./fonts/InstrumentSerif-Regular.ttf", variable: "--font-instrument-serif", display: "swap" });
const caveat = localFont({ src: "./fonts/Caveat-VariableFont_wght.ttf", variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "First Principles",
  description: "A curiosity-driven STEM learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${caveat.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
