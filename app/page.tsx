import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <Image
        src="/3db22360cc9442cb78dec9c16d45821461792f80.jpg" // ganti sesuai nama file gambarmu
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      {/* Blue Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: "#2563EB", opacity: 0.86 }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-white text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Welcome to Blog Genzet
        </h1>
        <p className="text-lg sm:text-xl mb-10">
          Please login or register to continue
        </p>

        <div className="flex gap-6 flex-col sm:flex-row">
          <Link
            href="/login"
            className="bg-white text-blue-800 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-transparent border border-white font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-blue-800 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
