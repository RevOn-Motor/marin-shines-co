import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Bitter } from "next/font/google";
import Script from "next/script";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
};

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bitter.variable} ${atkinson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        {googleAdsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(googleAdsId)});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
