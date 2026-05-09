import type { Metadata } from "next";
import IntakeForm from "@/app/components/IntakeForm";

export const metadata: Metadata = {
  title: "Get Started — OHMGolfness",
  description:
    "Tell us about your golf league and we'll get you set up with OHMGolfness.",
};

export default function StartPage() {
  return (
    <main
      className="min-h-screen py-16 px-6"
      style={{
        background: "linear-gradient(135deg, #1A3D2B 0%, #2D6A4F 60%, #1A3D2B 100%)",
      }}
    >
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-baseline gap-0.5 mb-8">
            <span className="font-display font-black text-3xl" style={{ color: "#C9A84C" }}>OHM</span>
            <span className="font-display font-bold text-3xl text-white">Golfness</span>
          </a>
          <h1 className="font-display text-3xl font-bold text-white mt-4 mb-2">
            Get your league set up
          </h1>
          <p className="text-white/60 text-sm">
            Tell us about your league and we&apos;ll be in touch within 24 hours.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl px-8 py-10 shadow-2xl">
          <IntakeForm />
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          By submitting you agree to our{" "}
          <a href="/privacy" className="underline hover:text-white/70">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
