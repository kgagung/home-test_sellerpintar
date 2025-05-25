import axios from "axios";

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  uploader?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

// Next.js 13 app directory server component
export default function Page({ params }: PageProps) {
  const { id } = params;

  let article: Article = {
    id: "",
    title: "",
    content: "",
    createdAt: "",
    uploader: "",
  };

  try {
    async () => {
      // Fetch artikel berdasarkan id
      const response = await axios.get(
        `https://test-fe.mysellerpintar.com/api/articles/${id}`
      );
      article = response.data;
    };
  } catch (error) {
    console.error("Failed to fetch article:", error);
  }

  // Jika artikel tidak ditemukan atau fetch gagal
  if (!article) {
    return <p>Article not found</p>;
  }

  // Fungsi optional untuk ekstrak URL gambar dari HTML content artikel
  function extractImageUrl(content: string) {
    const match = content.match(/<img[^>]+src="([^">]+)"/i);
    return match ? match[1] : null;
  }

  const imageSrc = extractImageUrl(article.content);
  const formattedDate = new Date(article.createdAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <img src="/Logoipsum.png" alt="Logo" className="h-10 w-auto" />
        <div className="font-medium">Nama User Login</div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-gray-600 text-sm">
          {formattedDate} - Uploaded by {article.uploader || "Unknown"}
        </div>

        <h1 className="text-3xl font-bold">{article.title}</h1>

        {imageSrc && (
          <img
            src={imageSrc}
            alt="Content image"
            className="w-full max-h-96 object-cover rounded"
          />
        )}

        <article
          className="prose max-w-full"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 w-full py-8">
        <div className="flex items-center justify-center space-x-2 text-white text-sm">
          <img src="/Logoputih.png" alt="Logo" className="h-5 w-auto" />
          <span>© 2025 Blog genzet. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
