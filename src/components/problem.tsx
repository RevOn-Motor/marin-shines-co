import { problem } from "@/content/site";
import { sectionHeading, sectionInner } from "./ui";

export function Problem() {
  return (
    <section aria-labelledby="problem-heading">
      <div className={sectionInner}>
        <h2 id="problem-heading" className={`${sectionHeading} max-w-[20ch]`}>
          {problem.heading}
        </h2>
        <ul className="mt-8 max-w-[40ch] space-y-4 border-l-2 border-eucalyptus pl-6 text-xl md:text-2xl">
          {problem.pains.map((pain) => (
            <li key={pain}>{pain}</li>
          ))}
        </ul>
        <p className="mt-10 max-w-[60ch] text-lg">{problem.solution}</p>
      </div>
    </section>
  );
}
