"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`bg-blue-700 text-white p-6 flex flex-col w-64 md:static md:flex z-40 transform transition-transform duration-300 ease-in-out
    fixed top-0 left-0
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
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
              onClick={() => setIsSidebarOpen(false)}
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
              onClick={() => setIsSidebarOpen(false)}
            >
              Category
            </Link>
            <button
              className="p-2 text-left rounded hover:bg-blue-600"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Backdrop for sidebar on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 bg-gray-100">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow md:hidden">
            <button
              className="text-blue-700 focus:outline-none"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Actual page content */}
          <div className="p-4">{children}</div>
        </main>

        {/* Logout Modal */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Logout</h2>
              <p className="mb-6">Are you sure want to logout?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setIsLogoutModalOpen(false)}
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
      </div>
    </ProtectedRoute>
  );
}
