"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/app/context/ModalContext";
import IntakeForm from "./IntakeForm";

export default function IntakeModal() {
  const { isOpen, closeModal } = useModal();
  const backdropRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,61,43,0.85)" }}
      onClick={(e) => { if (e.target === backdropRef.current) closeModal(); }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="League intake form"
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 text-sm"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="px-8 py-10">
          <div className="mb-6">
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="font-display font-black text-2xl" style={{ color: "#C9A84C" }}>OHM</span>
              <span className="font-display font-bold text-2xl" style={{ color: "#1A3D2B" }}>Golfness</span>
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: "#1A3D2B" }}>
              Get your league set up
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tell us about your league and we&apos;ll reach out within 24 hours.
            </p>
          </div>

          <IntakeForm onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );
}
