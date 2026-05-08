import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Place Portraits — Personalised Home Artwork",
  description:
    "Upload a photo of your house and preview a personalised artwork before you buy. Beautiful framed home portraits, created from your photo.",
  openGraph: {
    title: "Place Portraits — Personalised Home Artwork",
    description:
      "Turn your home into beautiful framed art. Preview before you buy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[#faf9f7] text-[#1c1a17] antialiased">
        {children}
      </body>
    </html>
  );
}
