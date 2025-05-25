"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const router = useRouter();
  const [username, setUsername] = useState("User");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const [error, setError] = useState("");

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get("/categories", {
          params: {
            page: 1,
            limit: 1000,
          },
        });
        const data: Category[] = res.data.data || [];
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Gagal mengambil data kategori", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [search, categories]);

  const openEditModal = (id: string, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
    setShowEditModal(true);
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleClick = () => {
    router.push("/dashboard/admin/profile"); // arahkan ke halaman profil
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId || !editCategoryName.trim()) {
      alert("Nama kategori tidak boleh kosong.");
      return;
    }

    try {
      const res = await axios.put(`/categories/${editCategoryId}`, {
        name: editCategoryName,
      });

      const updatedCategory = res.data.data;
      const updated = categories.map((cat) =>
        cat.id === editCategoryId ? updatedCategory : cat
      );

      setCategories(updated);
      setFilteredCategories(updated);
      setShowEditModal(false);
      alert("Kategori berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal memperbarui kategori", error);
      alert("Gagal memperbarui kategori.");
    }
  };

  const openDeleteModal = (id: string, category: Category) => {
    setDeleteCategoryId(id);
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteCategoryId) return;

    try {
      await axios.delete(`/categories/${deleteCategoryId}`);
      const updated = categories.filter((cat) => cat.id !== deleteCategoryId);
      setCategories(updated);
      setFilteredCategories(updated);
      setShowDeleteModal(false);
      alert("Kategori berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus kategori", error);
      alert("Gagal menghapus kategori.");
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        alert("Nama kategori tidak boleh kosong.");
        return;
      }

      const response = await axios.post("/categories", {
        name: newCategoryName,
      });
      const newCategory = response.data.data;

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setNewCategoryName("");
      setShowModal(false);
      alert("Kategori berhasil ditambahkan.");
    } catch (error) {
      console.error("Gagal menambahkan kategori", error);
      alert("Gagal menambahkan kategori.");
    }
  };

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="flex justify-between items-center p-6 border border-gray-200 bg-white">
        <div className="text-xl text-black font-semibold">Categories</div>
        <div className="relative">
          <button
            onClick={handleClick}
            className="flex items-center space-x-2 text-white bg-transparent px-4 py-2 rounded hover:bg-blue-700 hover:text-white"
          >
            {/* Profile Circle with Initial */}
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>

            {/* Username Text */}
            <span className="text-black underline underline-offset-1">
              {username}
            </span>
          </button>
        </div>
      </div>

      <div className="m-8 p-8 border border-gray-200 bg-white rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">
            Total Category: {filteredCategories.length}
          </h2>
        </div>
        <hr className="border-t -mx-8 border-gray-200 mb-8" />
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Category
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-center">Category Name</th>
                <th className="p-2 text-center">Created At</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    Tidak ada kategori tersedia.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="border-t">
                    <td className="px-4 py-4 text-center">{cat.name}</td>
                    <td className="px-4 py-4 text-center">{cat.createdAt}</td>
                    <td className="px-4 py-4 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(cat.id, cat.name)}
                        className="text-blue-600 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat.id, cat)}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
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
                  currentPage === index + 1 ? "" : "bg-gray-200"
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
        )}
      </div>

      {/* Modal Add */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add Category</h2>
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setError(""); // reset error saat user ketik
              }}
              className="w-full px-4 py-2 border rounded mb-1"
            />
            {/* Pesan error */}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setNewCategoryName("");
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCategoryName.trim()) {
                    setError("Category field cannot be empty");
                    return;
                  }
                  handleAddCategory();
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Category</h2>
            <input
              type="text"
              placeholder="Category name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Delete Category</h2>
            <p className="mb-6 text-gray-700">
              Delete category “{selectedCategory?.name}”? This will remove it
              permanently.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
