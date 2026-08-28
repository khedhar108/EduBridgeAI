import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import localFont from "next/font/local";
import "@repo/ui/styles.css";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduBridge",
  description: "Multi-tenant school platform",
  icons: {
    icon: [
      { url: "/brand/logo-mark-drop.svg", type: "image/svg+xml" },
    ],
    shortcut: "/brand/logo-mark-drop.svg",
    apple: "/brand/logo-mark-drop.svg",
  },
  openGraph: {
    images: [{ url: "/brand/logo-mark-drop.svg", width: 200, height: 200, alt: "EduBridge" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
