import type { Metadata } from "next";
import { Archivo, Instrument_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rogerraker.com"),
  title: {
    default: "Roger Raker: short films, vlogs, and the tools behind them",
    template: "%s · Roger Raker",
  },
  description:
    "Filipino filmmaker and vlogger. Short films and VlogMeyts since 2010, plus the LUTs, project files, and templates used to make them.",
  openGraph: {
    title: "Roger Raker: short films, vlogs, and the tools behind them",
    description:
      "Short films and vlogs since 2010, plus the editing and color tools behind them.",
    type: "website",
    locale: "en_PH",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/branding/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/branding/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
