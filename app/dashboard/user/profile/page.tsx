"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedPassword = localStorage.getItem("password");

    if (!storedUsername || !storedPassword || storedRole !== "User") {
      // Jika tidak ada data user atau bukan user, redirect
      router.push("/login");
    } else {
      setUsername(storedUsername);
      setRole(storedRole);
      setPassword(storedPassword);
    }
  }, [router]);

  const handleClick = () => {
    router.push("/dashboard/user/profile"); // arahkan ke halaman profil
  };

  return (
    <>
      <div className="m-8 p-8 flex items-center justify-center bg-white rounded-xl">
        <div className="max-w-md w-full p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center text-blue-600">
            User Profile
          </h1>

          {/* Profile Circle with Initial */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center text-2xl text-blue-900 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="text-black space-y-2">
            {[
              { label: "Username", value: username },
              { label: "Password", value: password },
              { label: "Role", value: role },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center p-2 bg-gray-100 rounded-lg border border-gray-200 py-2"
              >
                {/* Label + colon container */}
                <div className="flex items-center space-x-1">
                  <div className="w-24 font-semibold">{item.label}</div>
                  <div className="font-semibold">:</div>
                </div>

                {/* Value */}
                <div className="text-center flex-1 text-gray-700">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/dashboard/user")}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
