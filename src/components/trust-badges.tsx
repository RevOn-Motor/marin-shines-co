import { trustBadges } from "@/content/site";
import { CheckIcon } from "./icons";

export function TrustBadges({ className = "" }: { className?: string }) {
  if (trustBadges.length === 0) return null;
  return (
    <ul aria-label="Why customers trust us" className={`flex flex-wrap gap-x-6 gap-y-2 font-bold text-canopy ${className}`}>
      {trustBadges.map((badge) => (
        <li key={badge} className="flex items-center gap-2">
          <CheckIcon className="size-5 shrink-0" />
          {badge}
        </li>
      ))}
    </ul>
  );
}
