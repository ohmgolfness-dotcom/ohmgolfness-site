import Image from "next/image";

const features = [
  {
    icon: "📱",
    title: "Digital Scorecards",
    description:
      "Players enter scores from their phones — no paper, no transcription errors, no waiting.",
  },
  {
    icon: "🏆",
    title: "Live Leaderboards",
    description:
      "Real-time standings update as scores come in. Everyone knows where they stand.",
  },
  {
    icon: "📊",
    title: "Handicap Tracking",
    description:
      "Automated handicap calculations keep every round fair and competitive.",
  },
  {
    icon: "📅",
    title: "League Scheduling",
    description:
      "Build season schedules, manage tee times, and send automatic reminders.",
  },
  {
    icon: "💬",
    title: "Club Messaging",
    description:
      "Announce events, share results, and keep members in the loop — all in one place.",
  },
  {
    icon: "📈",
    title: "Stats & History",
    description:
      "Track every player's progress over time. Every birdie, eagle, and handicap move remembered.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: "#2D6A4F" }}
          >
            Platform Features
          </span>
          <h2
            className="font-display text-4xl md:text-5xl font-bold mt-3"
            style={{ color: "#1A3D2B" }}
          >
            Everything your league needs
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Purpose-built for golf clubs — not cobbled together from generic
            sports tools.
          </p>
        </div>

        {/* 6-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-8 flex flex-col gap-4 border border-[#E9E4D9]"
              style={{ backgroundColor: "#F8F5EE" }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3
                className="font-display font-bold text-xl"
                style={{ color: "#1A3D2B" }}
              >
                {f.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Showcase row */}
        <div
          className="rounded-3xl overflow-hidden grid md:grid-cols-2 gap-0"
          style={{ backgroundColor: "#1A3D2B" }}
        >
          {/* Copy side */}
          <div className="flex flex-col justify-center px-10 py-14 md:px-16">
            <span
              className="text-sm font-medium tracking-widest uppercase mb-4"
              style={{ color: "#52B788" }}
            >
              App Preview
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Because your league deserves{" "}
              <em style={{ color: "#E9C46A" }}>more than a spreadsheet.</em>
            </h3>
            <ul className="flex flex-col gap-4">
              {[
                "One-tap score entry per hole",
                "Offline mode — works on the course",
                "Auto-sync when back in range",
                "Optimized for gloves & sunlight",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "#52B788", color: "#1A3D2B" }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Phone mockup side — full bleed, no padding */}
          <div className="relative min-h-96">
            <Image
              src="/images/app-mockup.png"
              alt="OHMGolfness scorecard app on mobile"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
