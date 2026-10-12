import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Problem } from "@/components/problem";
import { Proof } from "@/components/proof";
import { ServiceArea } from "@/components/service-area";
import { Services } from "@/components/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { localBusinessJsonLd } from "@/lib/structured-data";

export const metadata = pageMetadata;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Services />
        <HowItWorks />
        <Proof />
        <Faq />
        <FinalCta />
        <ServiceArea />
      </main>
      <SiteFooter />
      <StickyCta />
      <JsonLd data={localBusinessJsonLd(siteUrl())} />
    </>
  );
}
