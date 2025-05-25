"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Bersihkan data login di localStorage (jika ada)
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    // Redirect ke halaman login
    router.push("/login");
  };

  return (
    <ProtectedRoute role="admin">
      <>
        <div className="flex min-h-screen bg-gray-100">
          {/* Hamburger button - tampil di layar kecil */}
          <button
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-700 text-white rounded"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle sidebar"
          >
            {/* Icon garis 3 */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Sidebar */}
          <aside
            className={`
          fixed top-0 left-0 h-screen md:h-screen bg-blue-700 text-white p-6 flex flex-col
          w-64
          transform
          transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:fixed md:flex
        `}
          >
            <img
              src="/Logoputih.png"
              alt="Logoputih"
              className="h-auto w-40 mb-8"
            />
            <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard/admin"
                className={`p-2 rounded ${
                  pathname === "/dashboard/admin"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-600"
                }`}
                onClick={() => setIsOpen(false)} // close sidebar on link click (optional)
              >
                Articles
              </Link>
              <Link
                href="/dashboard/admin/category"
                className={`p-2 rounded ${
                  pathname === "/dashboard/admin/category"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Category
              </Link>
              <button
                className="p-2 text-left rounded hover:bg-blue-600"
                onClick={() => setIsOpen(true)}
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Backdrop overlay ketika sidebar terbuka di layar kecil */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            ></div>
          )}
          <main className="flex-1 bg-gray-100 md:ml-64">{children}</main>
        </div>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Logout</h2>
              <p className="mb-6">Are you sure want to logout?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  );
}
