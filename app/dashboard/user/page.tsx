"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Article = {
  id: number;
  title: string;
  content: string;
  categoryId: string;
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
  const articlesPerPage = 9;

  const categories = ["All", "Technology", "Health", "Lifestyle", "Education"];

  // Debounce: memicu pencarian setelah 500ms tidak mengetik
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/article"); // ganti URL sesuai backend kamu
        const data = await response.json();
        setAllArticles(data);
        setFilteredArticles(data); // initial state
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      }
    };

    fetchArticles();
  }, []);

  // Filter logic saat search / kategori berubah
  useEffect(() => {
    const filtered = allArticles.filter((article) => {
      const matchCategory =
        category === "All" || article.categoryId === category;
      const matchTitle = article.title
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCategory && matchTitle;
    });
    setFilteredArticles(filtered);
  }, [search, category, allArticles]);

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
        className="max-h-[80vh] bg-cover bg-center relative"
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
        <div className="relative z-10 min-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6">
            {/* Logo kiri atas */}
            <img src="/Logoputih.png" alt="Logoputih" className="h-auto" />

            {/* Profil kanan atas */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-white bg-transparent px-4 py-2 rounded hover:bg-blue-800"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span>John Doe</span>
                <ChevronDown size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-20">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-black hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/logout"
                    className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Search tengah */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-transparent px-0 w-full max-w-3xl">
              <h2 className="text-m font-bold text-center text-white space-y-4 mb-3">
                Blog genzet
              </h2>
              <h2 className="text-5xl text-center text-white space-y-4 mb-3">
                The Journal : Design Resources, Interviews, and Industry News
              </h2>
              <p className="text-2xl text-center text-white mb-12">
                Your daily dose of design insights!
              </p>
              <div className="flex space-x-2 bg-blue-500 p-3 rounded-md mx-20">
                <select
                  className="w-1/3 px-4 py-2 text-black rounded-md"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search article title..."
                  className="flex-1 px-4 py-2 text-black rounded-md"
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
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <span className="text-sm text-blue-600 font-semibold">
                  {article.categoryId}
                </span>
                <h2 className="text-xl font-bold mt-2">{article.title}</h2>
                <p className="text-gray-600 mt-2">{article.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <footer className="bg-blue-600 w-full py-8">
        <div className="flex items-center justify-center space-x-2 text-white text-sm">
          <img src="/Logoputih.png" alt="Logo" className="h-5 w-auto" />
          <span>© 2025 Blog genzet. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
