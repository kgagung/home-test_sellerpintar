"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [username, setUsername] = useState("User");

  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return isMobile;
  }

  const isMobile = useIsMobile();

  const isUserDashboard =
    pathname?.startsWith("/dashboard/user") &&
    !pathname?.includes("/dashboard/user/preview") &&
    !pathname?.includes("/dashboard/user/profile");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    console.log("Pathname:", pathname);
    console.log("Is user dashboard?", isUserDashboard);
  }, [pathname]);

  return (
    <>
      {/* Header */}
      <div
        className={`w-full flex justify-between items-center p-4 sm:p-6 ${
          isMobile || !isUserDashboard
            ? "relative z-10 bg-white border-b border-gray-200"
            : "absolute top-0 left-0 z-50 bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/dashboard/user" className="flex items-center">
          <img
            src={
              isMobile || !isUserDashboard ? "/Logoipsum.png" : "/Logoputih.png"
            }
            alt="Logo"
            className="h-6 sm:h-8 cursor-pointer"
          />
        </Link>

        {/* Profile and Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-blue-700"
          >
            {/* Profile Circle */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-semibold text-sm sm:text-base">
              {username.charAt(0).toUpperCase()}
            </div>

            {/* Username and Arrow - Hanya tampil di sm ke atas */}
            <div className="hidden sm:flex items-center space-x-1">
              <span
                className={`underline underline-offset-1 ${
                  isMobile || !isUserDashboard ? "text-black" : "text-white"
                }`}
              >
                {username}
              </span>
              <ChevronDown
                size={16}
                className={
                  isMobile || !isUserDashboard ? "text-black" : "text-white"
                }
              />
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-20">
              <a
                href="/dashboard/user/profile"
                className="block px-4 py-2 text-black hover:bg-gray-100"
              >
                My Account
              </a>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded shadow w-80">
              <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
              <p className="mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <a
                  href="/login"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-blue-600 w-full py-8">
        <div className="flex items-center justify-center space-x-2 text-white text-sm">
          <img src="/Logoputih.png" alt="Logo" className="h-5 w-auto" />
          <span>© 2025 Blog genzet. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
