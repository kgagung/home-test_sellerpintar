"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ArrowLeft, ImagePlus } from "lucide-react";
import { Dialog } from "@headlessui/react";
import axios from "@/lib/axios";

interface Article {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  imageUrl?: string;
}

export default function EditArticleForm() {
  const router = useRouter();
  const params = useParams(); // Ambil params dari hook
  const id = params?.id as string;

  const [showDropdown, setShowDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);

  const [username, setUsername] = useState("User");

  // Ambil data artikel & kategori saat mount
  useEffect(() => {
    async function fetchArticleAndCategories() {
      try {
        const [articleRes, categoriesRes] = await Promise.all([
          axios.get(`/articles/${id}`),
          axios.get("/categories"),
        ]);

        const articleData: Article = articleRes.data.data || articleRes.data;
        const categoriesData = categoriesRes.data.data || [];

        setTitle(articleData.title);
        setContent(articleData.content);
        setCategoryId(articleData.categoryId);
        setInitialImageUrl(articleData.imageUrl || null);
        setPreviewUrl(articleData.imageUrl || null);

        setCategories(categoriesData);
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
    }

    fetchArticleAndCategories();
  }, [id]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleClick = () => {
    router.push("/dashboard/admin/profile"); // arahkan ke halaman profil
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(initialImageUrl);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return initialImageUrl || "";

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "unsigned_articles_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dqx7esttu/image/upload",
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      throw new Error("Upload ke Cloudinary gagal");
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await handleImageUpload();

      await axios.put(`/articles/${id}`, {
        title,
        content,
        categoryId,
        imageUrl,
      });

      alert("Artikel berhasil diperbarui");
      router.back();
    } catch (err) {
      console.error("Gagal update artikel", err);
      alert("Gagal update artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-6 border border-gray-200 bg-white">
        <div className="text-xl text-black font-semibold">Articles</div>
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
        <form onSubmit={handleSubmit} className="relative px-8 py-6 space-y-6">
          {/* Back Button */}
          <button
            type="button"
            className="flex items-center text-lg mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2" size={20} />
            Edit Article
          </button>

          {/* Upload Image */}
          <div>
            <label className="block font-medium mb-1">Thumbnails</label>
            <label
              htmlFor="image-upload"
              className="cursor-pointer w-60 h-40 border border-dashed border-gray-400 rounded flex items-center justify-center text-gray-500 text-sm mb-2 overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <>
                  <div className="flex flex-col items-center text-gray-500">
                    <ImagePlus size={24} className="mb-1" />
                    <span className="underline text-sm">
                      Click to select files
                    </span>
                    <p className="text-xs mt-1">
                      Support file type: .jpg or .png
                    </p>
                  </div>
                </>
              )}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              placeholder="Input title"
              className="border p-2 rounded w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              className="border p-2 rounded w-full"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Text below select */}
            <p className="text-sm text-gray-600 mt-2">
              The existing category list can be seen in the{" "}
              <button
                type="button"
                className="text-blue-600 underline hover:text-blue-800"
                onClick={() => setIsModalOpen(true)}
              >
                category
              </button>{" "}
              menu.
            </p>

            {/* Modal */}
            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded p-6 w-full max-w-md shadow-lg">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Category List
                  </Dialog.Title>
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li
                        key={cat.id}
                        className="border p-2 rounded bg-gray-50"
                      >
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 text-right">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </Dialog>
          </div>

          {/* Content */}
          <div>
            <label className="block font-medium mb-1">Content</label>
            <textarea
              placeholder="Write your article here..."
              className="border p-2 rounded w-full min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Submit Button (right-bottom) */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {loading ? "Updating..." : "Update Article"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
