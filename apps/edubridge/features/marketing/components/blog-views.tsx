import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/brand";
import {
  BLOG_ARTICLES,
  getArticle,
  getModuleById,
  type BlogArticle,
} from "../content/modules";

export function BlogIndex() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {PLATFORM_NAME}
        </Link>
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Product notes
        </h1>
        <p className="max-w-xl text-muted-foreground leading-relaxed">
          Short overviews of modules on the roadmap. Product surfaces land
          phase by phase; these articles explain the intent now.
        </p>
      </header>
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {BLOG_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/blog/${article.slug}`}
              className="group flex cursor-pointer flex-col gap-1 py-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="font-medium text-foreground group-hover:text-primary">
                {article.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {article.readingMinutes} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlogArticleView({ article }: { article: BlogArticle }) {
  const mod = getModuleById(article.moduleId);
  const Icon = mod?.Icon;

  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-5">
        <Link
          href="/blog"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          All notes
        </Link>
        {Icon ? (
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {article.readingMinutes} min read
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {article.description}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {article.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {section.heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-8">
        <Button asChild className="h-11 cursor-pointer px-5">
          <Link href="/sign-in">School workspace sign-in</Link>
        </Button>
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to home
        </Link>
      </footer>
    </article>
  );
}

export { getArticle };
