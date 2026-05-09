const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for small informal groups just getting started.",
    features: [
      "Up to 10 players",
      "Digital scorecards",
      "Basic leaderboard",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "#waitlist",
    featured: false,
  },
  {
    name: "Pro",
    price: "$39",
    period: "per month",
    description: "For serious leagues that want the full OHMGolfness experience.",
    features: [
      "Unlimited players",
      "Live leaderboards",
      "Handicap tracking",
      "League scheduling",
      "Club messaging",
      "Priority support",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    featured: true,
  },
  {
    name: "Club",
    price: "$89",
    period: "per month",
    description: "Multi-league clubs with advanced reporting and white-label branding.",
    features: [
      "Everything in Pro",
      "Multiple leagues",
      "Advanced analytics",
      "White-label branding",
      "API access",
      "Dedicated onboarding",
    ],
    cta: "Contact Us",
    href: "mailto:hello@ohmgolfness.com",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24"
      style={{ backgroundColor: "#1A3D2B" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-sm font-medium tracking-widest uppercase"
            style={{ color: "#52B788" }}
          >
            Pricing
          </span>
          <h2
            className="font-display text-4xl md:text-5xl font-bold mt-3 text-white"
          >
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-xl mx-auto">
            No hidden fees. No per-player charges. Just straightforward plans
            that grow with your club.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col gap-6 relative ${
                plan.featured
                  ? "border-2 ring-1"
                  : "border border-white/10"
              }`}
              style={
                plan.featured
                  ? {
                      borderColor: "#C9A84C",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      boxShadow: "0 0 0 1px #C9A84C33",
                    }
                  : { backgroundColor: "rgba(255,255,255,0.04)" }
              }
            >
              {plan.featured && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
                  style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
                >
                  Most Popular
                </div>
              )}

              <div>
                <h3
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: plan.featured ? "#C9A84C" : "white" }}
                >
                  {plan.name}
                </h3>
                <p className="text-white/50 text-sm">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-5xl text-white">
                  {plan.price}
                </span>
                <span className="text-white/40 text-sm">/{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/70 text-sm">
                    <span style={{ color: "#52B788" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block text-center py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                  plan.featured ? "" : "border border-white/20 text-white hover:bg-white/10"
                }`}
                style={
                  plan.featured
                    ? { backgroundColor: "#C9A84C", color: "#1A3D2B" }
                    : {}
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
