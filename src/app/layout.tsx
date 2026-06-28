import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeScript from "@/components/ThemeScript";
import AnalyticsScript from "@/components/AnalyticsScript";
import InstallPrompt from "@/components/InstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import ClientIdProvider from "@/components/ClientIdProvider";
import FeedbackWidget from "@/components/FeedbackWidget";
import AdBlockDetector from "@/components/AdBlockDetector";
import AdsterraBanner from "@/components/AdsterraBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastProvider from "@/components/Toast";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/WebSiteJsonLd";
import SiteNavJsonLd from "@/components/SiteNavJsonLd";
import CanonicalTag from "@/components/CanonicalTag";
import HreflangTags from "@/components/HreflangTags";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://allaboutpdfediting.xyz"),
  title: "PDFTools - Free Online PDF Tools | Compress, Merge, Split & More",
  description:
    "40+ free online PDF tools including premium features: compress, merge, split, convert images, extract text, compare PDFs, generate certificates, convert PDF to audio, create booklets, and more. 100% free, no uploads, all processing happens in your browser.",
  keywords: ["PDF tools", "compress PDF", "merge PDF", "split PDF", "free online PDF editor", "PDF converter", "sign PDF", "protect PDF", "PDF compressor", "merge PDF files", "split PDF pages", "PDF creator", "edit PDF", "PDF merger", "PDF splitter", "PDF comparison", "PDF audio", "PDF certificates", "PDF booklet", "PDF redact", "PDF metadata"],
  openGraph: {
    title: "PDFTools - Free Online PDF Tools",
    description: "40+ free and premium PDF tools. Compress, merge, split, compare, convert to audio, generate certificates, and more. No uploads. 100% free.",
    url: "https://allaboutpdfediting.xyz",
    siteName: "PDFTools",
    type: "website",
    locale: "en_US",
    images: [{ url: "https://allaboutpdfediting.xyz/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFTools - Free Online PDF Tools",
    description: "40+ free and premium PDF tools. Compress, merge, split, compare, convert to audio, and more. No uploads. 100% free.",
    images: ["https://allaboutpdfediting.xyz/opengraph-image.png"],
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <HreflangTags />
        <meta name="google-site-verification" content="N8odpQukXkhYSNhTcTrnMKWHWTi5D5h_Cre96ZVGlTw" />
        <meta name="google-adsense-account" content="ca-pub-6315496314477761" />
        <ThemeScript />
        <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6315496314477761" strategy="afterInteractive" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}` }} />
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
              inLanguage: "en",
              areaServed: ["US", "CA", "GB", "AU", "NZ", "IE"],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-0YRS54VR4X" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0YRS54VR4X');`}
        </Script>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SiteNavJsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <CanonicalTag />
        </Suspense>
        <AnalyticsScript />
        <ClientIdProvider />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to content
        </a>
        <AuthProvider>
        <Header />
        <main id="main-content" className="flex-1"><ErrorBoundary>{children}</ErrorBoundary></main>
        <AdBlockDetector />
        <AdsterraBanner />
        <Footer />
        <InstallPrompt />
        <CookieConsent />
        <FeedbackWidget />
        <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
