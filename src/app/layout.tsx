import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Venuvella — Discover what’s worth having.", template: "%s | Venuvella" },
  description: "Beauty, home, fitness and style — thoughtfully discovered.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><Header />{children}<Footer /></body></html>;
}