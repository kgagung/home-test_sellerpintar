import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Dot } from "lucide-react";
import Link from "next/link";

async function getArticleById(id: string) {
  const res = await fetch(
    `https://test-fe.mysellerpintar.com/api/articles/${id}`
  );
  if (!res.ok) return null;
  return res.json();
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

  if (!Array.isArray(allArticles)) {
    console.error("Invalid article list format", data);
    return [];
  }

  const targetDate = new Date(date);
  const related = allArticles
    .filter((a) => a.id !== excludeId)
    .map((a) => ({
      ...a,
      dateDiff: Math.abs(
        new Date(a.createdAt).getTime() - targetDate.getTime()
      ),
    }))
    .sort((a, b) => a.dateDiff - b.dateDiff)
    .slice(0, 3);

  return related;
}

export default async function ArticlePreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const article = await getArticleById(id);

  if (!article) {
    return notFound();
  }

  const relatedArticles = await getRelatedArticles(
    article.createdAt,
    article.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col items-center text-center mb-2">
        {/* Tanggal dan Pembuat */}
        <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
          {format(new Date(article.createdAt), "dd MMMM yyyy")}
          <Dot size={16} />
          Created by Admin
        </p>

        {/* Judul */}
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      </div>

      {/* Gambar */}
      <img
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />

      {/* Konten */}
      <div className="prose prose-lg max-w-none mb-10 text-justify">
        {article.content}
      </div>

      {/* Other Articles */}
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
                  {format(new Date(a.createdAt), "dd MMM yyyy")}
                </p>
                <h3 className="text-md font-bold line-clamp-2 hover:text-blue-600">
                  {a.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
