import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import "./product-themes.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumina Constellation · Eight Stars · One Sky · AI-Native Product Matrix",
  description: "Eight stars guiding every dimension of your life. AI Spiritual Companion (Vega) · Kids Storybook (Andromeda) · AI Directory (Polaris) · Prompt Library (Sirius) · Digital Memorial (Pleiades) · Caregiver (Lyra) · Genealogy (Cassiopeia) · Micro SaaS (Orion). 7 languages. PWA installable.",
  keywords: [
    "AI astrology", "tarot reading", "dream interpretation", "numerology", "Bazi",
    "AI kids storybook", "AI directory", "AI prompts", "digital memorial",
    "caregiver support", "genealogy", "Micro SaaS",
    "Lumina Constellation", "constellation", "eight stars",
    "Vega", "Andromeda", "Polaris", "Sirius", "Pleiades", "Lyra", "Cassiopeia", "Orion",
    "AI占星", "塔罗占卜", "解梦", "AI儿童故事书", "AI目录站",
  ],
  authors: [{ name: "Lumina Constellation" }],
  manifest: "/manifest.json",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
    apple: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumina Constellation",
  },
  applicationName: "Lumina Constellation",
  formatDetection: { telephone: false },
  openGraph: {
    title: "Lumina Constellation · Eight Stars · One Sky",
    description: "Eight stars guiding every dimension of your life. AI Spiritual Companion · Kids Storybook · AI Directory · Prompt Library · Digital Memorial · Caregiver · Genealogy · Micro SaaS",
    siteName: "Lumina Constellation",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN", "es_ES", "pt_BR", "ja_JP", "hi_IN", "ar_SA"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina Constellation",
    description: "Eight stars. One sky. Your story written in light. · 8 AI products · 7 languages · PWA",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      zh: "/?locale=zh",
      es: "/?locale=es",
      pt: "/?locale=pt",
      ja: "/?locale=ja",
      hi: "/?locale=hi",
      ar: "/?locale=ar",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Lumina Constellation",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web, iOS, Android",
              description: "Eight stars guiding every dimension of your life. AI-native product constellation.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free tier with 3 daily uses. Pro $19/mo. Premium $39/mo.",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1247",
              },
              featureList: [
                "AI Astrology Reading",
                "AI Tarot Reading",
                "AI Dream Interpretation",
                "AI Numerology / Bazi",
                "AI Digital Memorial",
                "AI Genealogy Story",
                "AI Personalized Kids Storybook",
                "AI Tools Directory",
                "AI Prompt Library",
                "AI Caregiver Support",
                "AI Micro SaaS Idea Generator",
              ],
              inLanguage: ["zh", "en", "es", "pt", "ja", "hi", "ar"],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
