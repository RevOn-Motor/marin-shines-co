import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { faqs } from "@/content/site";
import { Faq } from "./faq";

type FaqPage = { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };

it("publishes FAQPage data that matches the questions on screen", () => {
  const { container } = render(<Faq />);
  const script = container.querySelector('script[type="application/ld+json"]');
  const data = JSON.parse(script?.textContent ?? "{}") as FaqPage;

  const shown = Array.from(container.querySelectorAll("details")).map((item) => ({
    question: item.querySelector("summary")?.textContent,
    answer: item.querySelector("p")?.textContent,
  }));

  expect(shown).toHaveLength(faqs.length);
  expect(data["@type"]).toBe("FAQPage");
  expect(data.mainEntity.map((entry) => ({ question: entry.name, answer: entry.acceptedAnswer.text }))).toEqual(shown);
});
