import type { Metadata } from "next";
import { Outfit, Pacifico, Syne } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/content";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const script = Pacifico({
  variable: "--font-script-face",
  subsets: ["latin"],
  weight: "400",
});

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: { default: `${brand.name} | Fruit and Jam from Chitral`, template: `%s | ${brand.name}` },
  description: brand.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${script.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
