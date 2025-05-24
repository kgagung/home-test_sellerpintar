"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const categories = ["All", "Technology", "Health", "Lifestyle", "Education"];

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
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/3db22360cc9442cb78dec9c16d45821461792f80.jpg')",
      }}
    >
      {/* Overlay biru transparan */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: "#2563EB", opacity: 0.86 }}
      />

      {/* Konten */}
      <div className="relative z-10 min-h-screen flex flex-col">
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
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </a>
                <a href="/logout" className="block px-4 py-2 hover:bg-gray-100">
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Search tengah */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-lg shadow p-6 w-full max-w-xl space-y-4">
            <h2 className="text-2xl font-bold text-center text-blue-800">
              Search Articles
            </h2>
            <div className="flex space-x-2">
              {/* Dropdown kategori */}
              <select
                className="w-1/3 px-4 py-2 border border-gray-300 rounded"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Input search */}
              <input
                type="text"
                placeholder="Search article title..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
