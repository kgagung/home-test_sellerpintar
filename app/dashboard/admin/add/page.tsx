"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowLeft, ImagePlus } from "lucide-react";
import { Dialog } from "@headlessui/react";
import axios from "@/lib/axios";

export default function AddArticleForm() {
  const router = useRouter();
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

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/categories");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return "";
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

      await axios.post("/articles", {
        title,
        content, // tidak ada tag <img> di sini
        categoryId,
        imageUrl, // kirim imageUrl sebagai field terpisah
      });

      alert("Artikel berhasil ditambahkan");
      setTitle("");
      setContent("");
      setImage(null);
      setPreviewUrl(null);
      if (categories.length > 0) setCategoryId(categories[0].id);
    } catch (err) {
      console.error("Gagal submit artikel", err);
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
        <form onSubmit={handleSubmit} className="relative px-8 py-6 space-y-6">
          {/* Back Button */}
          <button
            type="button"
            className="flex items-center text-lg mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2" size={20} />
            Create Article
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
              {loading ? "Uploading..." : "Add Article"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
