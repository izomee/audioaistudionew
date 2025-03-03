import "./globals.css";
import { Inter, Fira_Code } from "next/font/google";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-geist-mono" 
});

export const metadata = {
  title: "Audio AI Studio - Free Online Audio Modifier | Pitch, Speed, Reverb",
  description: "Free online audio modifier with slowed + reverb, nightcore, pitch shifting, speed control, and more. No signup required. Modify your audio files instantly.",
  keywords: "audio modifier, slowed and reverb, nightcore, pitch shift, speed up audio, slow down audio, audio effects, audio AI, audio editor, audio enhancement, reverb effect, audio processing, audio AI tools, chopped and screwed, vaporwave, phonk",
  openGraph: {
    title: "Audio AI Studio - Free Online Audio Modifier | Pitch, Speed, Reverb",
    description: "Transform your audio with AI-powered tools. Create slowed + reverb, nightcore, and custom audio effects instantly.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Audio AI Studio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Audio AI Studio - Free Online Audio Modifier",
    description: "Transform your audio with AI-powered tools. Create slowed + reverb, nightcore, and custom audio effects instantly.",
    images: ["/og-image.png"]
  },
  alternates: {
    canonical: "https://audioaistudio.com"
  },
  other: {
    "google-site-verification": "YOUR_VERIFICATION_CODE"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#10b981" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Audio AI Studio",
            "url": "https://audioaistudio.com",
            "description": "Free online audio modifier with slowed + reverb, nightcore, pitch shifting, speed control, and more.",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }} />
      </head>
      <body className={`${inter.variable} ${firaCode.variable}`}>
        {children}
        <SpeedInsights />
        <Analytics />
        <footer className="border-t border-border/40 py-4 mt-auto backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-center text-muted-foreground">
                <span className="terminal-text">Audio AI Studio</span> - Intelligent audio processing and enhancement
              </p>
              <p className="text-xs text-center text-muted-foreground">
                © {new Date().getFullYear()} Audio AI Studio. All rights reserved. 
                <Link href="/terms" className="ml-2 hover:underline">Terms of Service</Link> | 
                <Link href="/privacy" className="mx-2 hover:underline">Privacy Policy</Link>
              </p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                <strong>Disclaimer:</strong> We do not have access to or knowledge of the content of your audio files. All processing happens in your browser.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
