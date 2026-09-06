import type { ReactNode } from "react";
import type { LegalSection } from "../content/terms";
import { DraftBanner } from "./draft-banner";

type Props = {
  title: string;
  intro: string;
  sections: LegalSection[];
  table?: ReactNode;
};

export function LegalDocument({ title, intro, sections, table }: Props) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <DraftBanner />
        <p className="leading-relaxed text-muted-foreground">{intro}</p>
      </header>
      {table}
      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.id} className="flex flex-col gap-2">
            <h2 className="font-serif text-xl tracking-tight text-foreground">
              {section.title}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
