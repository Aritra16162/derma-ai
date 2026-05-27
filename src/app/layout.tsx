import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

import { Providers } from "@/components/ui/Providers";

// Disable Next.js aggressive caching for the entire app to ensure fresh content on every refresh
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;


export const metadata: Metadata = {
  title: "Derma Guide",
  description: "AI skin condition analysis and triage",
};

import MaintenancePage from "./maintenance/page";
import { ENABLE_MAINTENANCE_MODE } from "@/lib/config";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If maintenance mode is active, override the entire layout with the maintenance screen
  if (ENABLE_MAINTENANCE_MODE) {
    return (
      <html
        lang="en"
        suppressHydrationWarning
        className={`${montserrat.variable} ${openSans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col m-0 p-0">
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${openSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="video" href="/new-video.mp4" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
