const steps = [
  {
    number: "01",
    title: "Create your club",
    description:
      "Sign up and set up your club profile in under two minutes. Add your course details and you're ready.",
  },
  {
    number: "02",
    title: "Invite your players",
    description:
      "Send a link. Players join with one tap — no app store required, no account setup friction.",
  },
  {
    number: "03",
    title: "Run your first round",
    description:
      "Players score in real time. Handicaps calculate automatically. Leaderboards update live.",
  },
  {
    number: "04",
    title: "Track the season",
    description:
      "Watch your league's story unfold — standings, stats, and highlights accumulate all season long.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: "#2D6A4F" }}
          >
            How It Works
          </span>
          <h2
            className="font-display text-4xl md:text-5xl font-bold mt-3"
            style={{ color: "#1A3D2B" }}
          >
            Fast setup, zero headaches
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            From signup to first tee in minutes, not days.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop */}
          <div
            className="hidden md:block absolute top-8 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5"
            style={{ backgroundColor: "#52B788", opacity: 0.3 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                {/* Step circle */}
                <div
                  className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-6 font-display font-black text-lg border-2"
                  style={{
                    backgroundColor: i === 0 ? "#52B788" : "white",
                    borderColor: "#52B788",
                    color: i === 0 ? "white" : "#52B788",
                  }}
                >
                  {step.number}
                </div>
                <h3
                  className="font-display font-bold text-xl mb-3"
                  style={{ color: "#1A3D2B" }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
