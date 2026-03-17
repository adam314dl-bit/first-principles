// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora, EB_Garamond } from "next/font/google";
import TopBar from "@/components/TopBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-lora-var", display: "swap" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-eb-garamond-var", display: "swap" });

export const metadata: Metadata = {
  title: "First Principles",
  description: "A curiosity-driven STEM learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable} ${ebGaramond.variable} font-sans antialiased`}>
        <TopBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
