"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import api from "@/lib/axios";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["Admin", "User"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post("/auth/register", data);
      console.log(response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "Admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (error: any) {
      alert("Registration failed. Please try again.");
      console.error("Error response:", error.response?.data);
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

        <div className="block text-sm text-black font-medium mb-1">
          <label className="block text-sm text-black font-medium mb-1">
            Username
          </label>
          <input
            {...register("username")}
            placeholder="Input username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
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
        <div className="block text-sm text-black font-medium mb-1">
          <label>Role</label>
          <select
            {...register("role")}
            className="w-full border p-2 rounded text-gray-800"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
        <div>
          <p className="text-center text-gray-400 mb-5 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 underline">
              Login here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
