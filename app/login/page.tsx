"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import api from "@/lib/axios";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      // Step 1: Login
      const loginResponse = await api.post("/auth/login", data);
      const { token } = loginResponse.data;

      // Step 2: Save token and set default header
      localStorage.setItem("token", loginResponse.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Step 3: Get profile
      const profileResponse = await api.get("/auth/profile");
      const { role } = profileResponse.data;

      localStorage.setItem("role", role);

      // Step 4: Redirect
      if (role === "Admin") {
        router.push("/dashboard/admin");
      } else if (role === "User") {
        router.push("/dashboard/user");
      } else {
        console.error("Unknown role:", role);
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <img
          src="/Logoipsum.png"
          alt="Logoipsum"
          className="h-auto my-4 mx-auto"
        />
        <div>
          <label className="block text-sm text-black font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            {...register("username")}
            placeholder="Input username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm text-black font-medium mb-1">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Input password"
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
          />

          {/* ICON TOGGLE */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Login
          </button>
        </div>
        <div>
          <p className="text-center text-gray-400 mb-5 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 underline">
              Register here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
