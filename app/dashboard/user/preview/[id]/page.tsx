// app/dashboard/user/preview/[id]/page.tsx
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Dot } from "lucide-react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
};

async function getArticleById(id: string) {
  const res = await fetch(
    `https://test-fe.mysellerpintar.com/api/articles/${id}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data;
}

async function getRelatedArticles(date: string, excludeId: string) {
  const res = await fetch(`https://test-fe.mysellerpintar.com/api/articles`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch articles");
    return [];
  }

  const data = await res.json();
  const allArticles = Array.isArray(data.data) ? data.data : [];

  const targetDate = new Date(date);
  const related = allArticles
    .filter((a: any) => a.id !== excludeId)
    .map((a: any) => ({
      ...a,
      dateDiff: Math.abs(
        new Date(a.createdAt).getTime() - targetDate.getTime()
      ),
    }))
    .sort((a: any, b: any) => a.dateDiff - b.dateDiff)
    .slice(0, 3);

  return related;
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch(
    "https://test-fe.mysellerpintar.com/api/categories?limit=9999",
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const article = await getArticleById(id);
  const relatedArticles = article
    ? await getRelatedArticles(article.createdAt, article.id)
    : [];
  const categories = await getCategories();

  if (!article) {
    return notFound();
  }

  const getCategoryNameById = (id: string) => {
    const found = categories.find((cat) => cat.id === id);
    return found ? found.name : "";
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col items-center text-center mb-2">
        <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
          {format(new Date(article.createdAt), "dd MMMM yyyy")}
          <Dot size={16} />
          Created by Admin
        </p>
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      </div>

      <img
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />

      <div className="prose prose-lg max-w-none mb-10 text-justify">
        <div
          dangerouslySetInnerHTML={{
            __html: article.content.replace(/\n/g, "<br />"),
          }}
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Other Articles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((a: any) => (
          <Link href={`/dashboard/user/preview/${a.id}`} key={a.id}>
            <div className="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition">
              <img
                src={a.imageUrl}
                alt={a.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">
                  {formatDate(a.createdAt)}
                </p>
                <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {a.title}
                </h2>
                <p className="text-gray-600 mb-3">
                  {a.content.replace(/\n/g, "<br />").slice(0, 100)}...
                </p>
                <span className="inline-block bg-blue-300 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {getCategoryNameById(a.categoryId)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
