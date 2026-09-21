import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const govde = DM_Sans({
  variable: "--font-govde",
  subsets: ["latin"],
});

const baslik = Fraunces({
  variable: "--font-baslik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sofra — QR menü, tasarım ve adisyon",
  description:
    "PDF’ini at; dijital menü, masa QR’si, baskı PDF’i ve basit adisyon tek yerde. Komisyon yok.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${govde.variable} ${baslik.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
