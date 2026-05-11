"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5EE] px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">⛳</div>
        <h1 className="font-display text-2xl font-bold text-[#1A3D2B] mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-[#1A3D2B] hover:bg-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
