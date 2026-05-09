"use client";

import { useModal } from "@/app/context/ModalContext";

export default function FooterCTA() {
  const { openModal } = useModal();

  return (
    <section
      id="waitlist"
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1A3D2B 0%, #2D6A4F 60%, #1A3D2B 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
        style={{ backgroundColor: "#52B788" }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10"
        style={{ backgroundColor: "#C9A84C" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <span
          className="text-sm font-medium tracking-widest uppercase"
          style={{ color: "#52B788" }}
        >
          Early Access
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-6 leading-tight">
          Be the first club{" "}
          <em style={{ color: "#E9C46A" }}>on the green</em>
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          We&apos;re rolling out early access to a select group of clubs. Join
          the waitlist and lock in your founding member rate.
        </p>

        <button
          onClick={openModal}
          className="px-10 py-4 rounded-full font-semibold text-base transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
        >
          Get Started Free
        </button>

        <p className="text-white/40 text-xs mt-6">
          No spam. Unsubscribe anytime. We&apos;ll only email you about OHMGolfness.
        </p>
      </div>
    </section>
  );
}
