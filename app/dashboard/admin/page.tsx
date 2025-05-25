"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalArticles, setTotalArticles] = useState(0);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Ambil semua artikel sekali saja
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchArticles();
      setLoading(false);
    }
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get("/articles", {
        params: {
          page: 1,
          limit: 1000, // Ambil semua data
        },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setAllArticles(data);
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil kategori", error);
      }
    }

    fetchCategories();
  }, []);

  // Filtering lokal
  useEffect(() => {
    let temp = allArticles;

    if (category) {
      temp = temp.filter((article) =>
        typeof article.category === "string"
          ? article.category === category
          : article.category?.name === category
      );
    }

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();
      temp = temp.filter((article) =>
        article.title?.toLowerCase().includes(keyword)
      );
    }

    setFilteredArticles(temp);
    setTotalArticles(temp.length);
    setCurrentPage(1); // Reset ke halaman awal saat filter berubah
  }, [allArticles, category, debouncedSearch]);

  const totalPages = Math.ceil(totalArticles / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute role="admin">
      <>
        <div className="flex justify-between items-center p-6 border border-gray-200 bg-white">
          <div className="text-xl text-black font-semibold">Articles</div>
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-white bg-transparent px-4 py-2 rounded hover:bg-blue-700 hover:text-white"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span className="text-black">John Doe</span>
              <ChevronDown size={16} className="text-black" />
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

        <div className="m-8 p-8 border border-gray-200 bg-white rounded-xl">
          <div className="flex gap-2 mb-8">
            <h2 className="font-bold">Total Article: {totalArticles}</h2>
          </div>
          <hr className="border-t -mx-8 border-gray-200 mb-8" />
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2 w-3/4">
              <select
                className="border p-2 rounded"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1); // reset ke halaman 1 saat filter berubah
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search by title"
                className="border p-2 rounded w-1/2"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Link href="/dashboard/admin/add">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                + Add Articles
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto -mx-8 bg-white shadow rounded">
            <table className="w-full table-fixed">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-center">Thumbnails</th>
                  <th className="p-3 text-center">Title</th>
                  <th className="p-3 text-center">Category</th>
                  <th className="p-3 text-center">Created At</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentArticles.map((article) => (
                  <tr key={article.id} className="border-t">
                    <td className="p-3 flex justify-center items-center">
                      <img
                        src={article.imageUrl || "/Logoipsum.png"}
                        alt="thumb"
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">
                      {typeof article.title === "string"
                        ? article.title
                        : JSON.stringify(article.title)}
                    </td>
                    <td className="p-3 text-center">
                      {typeof article.category === "string"
                        ? article.category
                        : article.category?.name}
                    </td>
                    <td className="p-3">
                      {new Date(article.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 space-x-2">
                      <Link
                        href={`/dashboard/user/preview/${article.id}`}
                        className="text-blue-600"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/dashboard/admin/edit/${article.id}`}
                        className="text-yellow-600"
                      >
                        Edit
                      </Link>
                      <button className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
        </div>
      </>
    </ProtectedRoute>
  );
}
