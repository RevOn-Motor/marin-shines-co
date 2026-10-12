import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Problem } from "@/components/problem";
import { Services } from "@/components/services";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Services />
        <HowItWorks />
      </main>
      <StickyCta />
    </>
  );
}
