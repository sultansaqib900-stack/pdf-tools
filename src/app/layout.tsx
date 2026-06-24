import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import AnalyticsScript from "@/components/AnalyticsScript";
import InstallPrompt from "@/components/InstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import ClientIdProvider from "@/components/ClientIdProvider";
import AdsterraBanner from "@/components/AdsterraBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://allaboutpdfediting.xyz"),
  title: "PDFTools - Free Online PDF Tools | Compress, Merge, Split & More",
  description:
    "Free online PDF tools to compress, merge, split, convert images, extract text, add page numbers, rotate, protect, sign, and unlock PDFs. 100% free, no uploads, all processing happens in your browser.",
  keywords: ["PDF tools", "compress PDF", "merge PDF", "split PDF", "free online PDF editor", "PDF converter", "sign PDF", "protect PDF"],
  openGraph: {
    title: "PDFTools - Free Online PDF Tools",
    description: "Compress, merge, split, and convert PDFs instantly in your browser. No uploads. 100% free.",
    url: "https://allaboutpdfediting.xyz",
    siteName: "PDFTools",
    type: "website",
    images: [{ url: "https://allaboutpdfediting.xyz/opengraph-image.png", width: 1200, height: 630 }],
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#4f46e5",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "PDFTools",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <ThemeScript />
        <AnalyticsScript />
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js")})}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PDFTools",
              url: "https://allaboutpdfediting.xyz",
              description:
                "Free online PDF tools to compress, merge, split, convert images, extract text, add page numbers, rotate, protect, sign, and unlock PDFs. All processing happens locally in your browser.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "All",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientIdProvider />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1"><ErrorBoundary>{children}</ErrorBoundary></main>
        <AdsterraBanner />
        <Footer />
        <InstallPrompt />
        <CookieConsent />
      </body>
    </html>
  );
}
