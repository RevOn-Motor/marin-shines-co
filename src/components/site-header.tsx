import { site } from "@/content/site";
import { PhoneIcon } from "./icons";
import { PhoneLink } from "./phone-link";
import { secondaryButton } from "./ui";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-5">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-xl font-bold text-canopy md:text-2xl">{site.name}</span>
        <span className="hidden text-ink md:inline">{site.tagline}</span>
      </p>
      <PhoneLink className={secondaryButton}>
        <PhoneIcon className="size-5" />
        <span className="md:hidden">Call</span>
        <span className="hidden md:inline">Call or text {site.phone.display}</span>
      </PhoneLink>
    </header>
  );
}
