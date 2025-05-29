"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import axios from "axios";

type Article = {
  id: number;
  title: string;
  content: string;
  categoryId: string;
  imageUrl: string;
  createdAt: string;
};

type Category = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const articlesPerPage = 9;

  // Debounce: memicu pencarian setelah 500ms tidak mengetik
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://test-fe.mysellerpintar.com/api/articles?limit=9999",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();
        console.log("Fetched articles:", result);

        const sortedArticles = result.data.sort(
          (a: Article, b: Article) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAllArticles(sortedArticles);
        setFilteredArticles(sortedArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get(
          "https://test-fe.mysellerpintar.com/api/categories?limit=9999"
        );
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          setCategoryId(response.data.data[0].id);
        }
      } catch (error) {
        console.error("Gagal mengambil kategori", error);
      }
    }

    fetchCategories();
  }, []);

  const getCategoryNameById = (id: string) => {
    const found = categories.find((cat) => cat.id === id);
    return found ? found.name : "";
  };

  // Filter logic saat search / kategori berubah
  useEffect(() => {
    const filtered = allArticles.filter((article) => {
      const matchCategory =
        category === "All" ||
        getCategoryNameById(article.categoryId) === category;
      const matchTitle = article.title
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCategory && matchTitle;
    });
    setFilteredArticles(filtered);
  }, [search, category, allArticles]);

  // Format tanggal Indonesia
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Pagination logic
  const indexOfLast = currentPage * articlesPerPage;
  const indexOfFirst = indexOfLast - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNavigate = (id: number) => {
    router.push(`/dashboard/user/preview/${id}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div
        className="h-screen sm:max-h-[80vh] bg-cover bg-center relative inset-0 z-0"
        style={{
          backgroundImage:
            "url('/3db22360cc9442cb78dec9c16d45821461792f80.jpg')",
        }}
      >
        {/* Overlay biru transparan */}
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: "#2563EB", opacity: 0.86 }}
        />

        {/* Konten */}
        <div className="relative z-10 h-full flex flex-col px-4 sm:px-8">
          {/* Search tengah */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-transparent w-full max-w-3xl">
              <h2 className="text-base sm:text-lg font-bold text-center text-white mb-3">
                Blog genzet
              </h2>
              <h2 className="text-4xl sm:text-5xl text-center text-white mb-3">
                The Journal : Design Resources, Interviews, and Industry News
              </h2>
              <p className="text-base sm:text-2xl text-center text-white mb-8 sm:mb-12">
                Your daily dose of design insights!
              </p>

              <div className="flex flex-col sm:flex-row gap-2 bg-blue-500 p-3 rounded-md">
                <select
                  className="border p-2 rounded text-black"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentPage(1); // reset ke halaman 1 saat filter berubah
                  }}
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search article title..."
                  className="px-4 py-2 text-black rounded-md flex-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Grid Artikel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
              onClick={() => handleNavigate(article.id)}
            >
              {/* Gambar dengan efek hover */}
              <div className="relative">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-48 object-cover transition duration-300 ease-in-out group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-30 transition duration-300"></div>
              </div>

              <div className="p-4">
                {/* Tanggal Upload */}
                <p className="text-sm text-gray-500 mb-1">
                  {formatDate(article.createdAt)}
                </p>

                {/* Judul (hover jadi biru) */}
                <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {article.title}
                </h2>

                {/* Ringkasan Konten */}
                <p
                  className="text-gray-600 mb-3"
                  dangerouslySetInnerHTML={{
                    __html:
                      article.content.slice(0, 100).replace(/\n/g, "<br />") +
                      "...",
                  }}
                ></p>

                {/* Kategori Bubble */}
                <span className="inline-block bg-blue-300 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {getCategoryNameById(article.categoryId)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6 mb-8">
          <button
            className="px-3 py-1 flex items-center gap-1"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1 ? "text-black" : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="px-3 py-1 flex items-center gap-1"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
