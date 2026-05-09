"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useModal } from "@/app/context/ModalContext";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openModal } = useModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0.5 select-none">
          <span
            className="font-display font-black text-2xl leading-none"
            style={{ color: "#C9A84C" }}
          >
            OHM
          </span>
          <span
            className={`font-display font-bold text-2xl leading-none transition-colors duration-300 ${
              scrolled ? "text-[#1A3D2B]" : "text-white"
            }`}
          >
            Golfness
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-[#C9A84C] ${
                scrolled ? "text-[#1A3D2B]" : "text-white/90"
              }`}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={openModal}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#C9A84C] text-[#1A3D2B] hover:bg-[#E9C46A] transition-colors duration-200"
          >
            Join Waitlist
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 mb-1.5 transition-colors duration-300 ${
              scrolled ? "bg-[#1A3D2B]" : "bg-white"
            }`}
          />
          <span
            className={`block w-6 h-0.5 mb-1.5 transition-colors duration-300 ${
              scrolled ? "bg-[#1A3D2B]" : "bg-white"
            }`}
          />
          <span
            className={`block w-6 h-0.5 transition-colors duration-300 ${
              scrolled ? "bg-[#1A3D2B]" : "bg-white"
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[#1A3D2B] font-medium hover:text-[#C9A84C] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); openModal(); }}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#C9A84C] text-[#1A3D2B] text-center hover:bg-[#E9C46A] transition-colors"
          >
            Join Waitlist
          </button>
        </div>
      )}
    </header>
  );
}
