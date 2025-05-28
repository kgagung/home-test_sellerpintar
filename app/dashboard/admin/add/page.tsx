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
  const [username, setUsername] = useState("User");

  const [errors, setErrors] = useState({
    title: "",
    categoryId: "",
    content: "",
    imageUrl: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/categories?limit=9999");
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

  const insertTag = (tag: string) => {
    const textarea = document.getElementById(
      "content-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const before = content.slice(0, start);
    const after = content.slice(end);

    const wrapped = `<${tag}>${selectedText || ""}</${tag}>`;
    const newContent = before + wrapped + after;

    setContent(newContent);

    // set cursor after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        before.length + wrapped.length;
    }, 0);
  };

  const insertBulletList = () => {
    const textarea = document.getElementById(
      "content-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    // Pisah teks yang dipilih jadi baris per baris
    const lines = selected.split("\n");

    // Tambahkan bullet "• " di awal setiap baris (jika belum ada)
    const bulletedLines = lines.map((line) => {
      return line.startsWith("• ") ? line : `• ${line}`;
    });

    // Gabungkan kembali
    const newSelected = bulletedLines.join("\n");

    // Update konten
    const newContent = before + newSelected + after;
    setContent(newContent);

    // Set posisi kursor agar tetap di bagian akhir pilihan yang baru
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + newSelected.length;
    }, 0);
  };

  const handleSubmit = async (e?: React.FormEvent, returnData = false) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await handleImageUpload();

      // Kirim data ke server
      const response = await axios.post("/articles", {
        title,
        content, // content tanpa tag <img>
        categoryId,
        imageUrl,
      });

      if (!returnData) {
        alert("Artikel berhasil ditambahkan");
        // reset form
        setTitle("");
        setContent("");
        setImage(null);
        setPreviewUrl(null);
        if (categories.length > 0) setCategoryId(categories[0].id);
      }

      if (returnData) {
        return response.data; // kembalikan data hasil post (misal ada id artikel)
      }
    } catch (err) {
      console.error("Gagal submit artikel", err);
      alert("Gagal submit artikel. Silakan cek konsol.");
      if (returnData) {
        throw err; // agar bisa ditangani caller
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewSubmit = async () => {
    try {
      const data = await handleSubmit(undefined, true); // tidak ada event, returnData = true
      router.push(`/dashboard/user/preview/${data.id}`);
    } catch (error) {
      // error sudah ditangani di handleSubmit
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

            {/* Formatting Buttons */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => insertTag("b")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => insertTag("i")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => insertTag("u")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              >
                Underline
              </button>
              <button type="button" onClick={insertBulletList} className="btn">
                • List
              </button>
            </div>

            <textarea
              id="content-textarea"
              placeholder="Write your article here..."
              className="border p-2 rounded w-full min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Submit Button (right-bottom) */}
          <div className="flex justify-end pt-4 space-x-3">
            {/* Tombol Cancel */}
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>

            {/* Tombol Preview */}
            <button
              type="button"
              onClick={handlePreviewSubmit}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating..." : "Preview"}
            </button>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Add Article"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
