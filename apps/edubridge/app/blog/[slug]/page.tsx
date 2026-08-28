import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleView, getArticle } from "@/features/marketing";
import { BLOG_ARTICLES } from "@/features/marketing/content/modules";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Product note | EduBridge" };
  return {
    title: `${article.title} | EduBridge`,
    description: article.description,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-dvh bg-background">
      <BlogArticleView article={article} />
    </div>
  );
}
