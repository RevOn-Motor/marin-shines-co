/** Single-stroke silhouette of Mt. Tamalpais ("the Sleeping Lady"), drawn in a 1440×160 box. */
export const RIDGE_PATH =
  "M0 140 C120 132 220 120 320 104 S470 70 540 58 C580 50 600 44 630 40 L655 30 C668 26 680 28 690 34 C720 46 740 44 770 36 L800 24 C812 20 826 22 840 30 C900 60 980 82 1080 96 S1300 124 1440 132";

export function RidgeLine({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 160" preserveAspectRatio="none" className={className}>
      <path d={RIDGE_PATH} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
