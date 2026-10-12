import type { Metadata } from "next";
import Link from "next/link";
import { focusRing } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Privacy policy | ${site.name}`,
  description: `How ${site.name} collects, uses, and protects the details you send through our quote form.`,
  alternates: { canonical: "/privacy" },
};

// LAUNCH-BLOCKER: have this draft privacy policy reviewed before launch
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
      <Link href="/" className={`font-display text-xl font-bold text-canopy underline ${focusRing}`}>
        {site.name}
      </Link>
      <h1 className="mt-10 font-display text-4xl font-bold text-canopy">Privacy policy</h1>
      <div className="mt-8 max-w-[65ch] space-y-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-canopy [&_p]:mt-2">
        <section>
          <h2>What we collect</h2>
          <p>
            When you request a quote, we collect what you enter: the service you need, your town, the size of your
            home, your name, phone number, email address, and any notes.
          </p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use it only to prepare your quote, contact you about it, and schedule and provide the cleaning you book.</p>
        </section>
        <section>
          <h2>Where it&apos;s stored</h2>
          <p>
            Quote requests are saved in a private Google Sheet and sent to our inbox through our email provider, Resend.
            If you came from a Google ad, Google may record that a quote request was completed. Our service-area map is
            provided by Google Maps, which may collect usage data under Google&apos;s own privacy policy.
          </p>
        </section>
        <section>
          <h2>Who we share it with</h2>
          <p>We don&apos;t sell or rent your information. We share it only with the services above, which handle it for us.</p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>
            You can ask what we hold about you, and ask us to correct or delete it. Email{" "}
            <a href={`mailto:${site.email}`} className={`underline ${focusRing}`}>
              {site.email}
            </a>{" "}
            or call {site.phone.display}.
          </p>
        </section>
      </div>
    </main>
  );
}
