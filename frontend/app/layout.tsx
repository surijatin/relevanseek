import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Afacad, Montserrat } from "next/font/google";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const afacad = Afacad({
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-afacad",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RelevanSeek",
  description: "Find the most relevant people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${geistSans.variable} ${geistMono.variable} ${afacad.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
