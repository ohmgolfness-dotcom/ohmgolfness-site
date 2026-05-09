import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/hero-golf.png"
        alt="Augusta-style golf course"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(26,61,43,0.72)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Wordmark */}
        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span
            className="font-display font-black text-5xl md:text-7xl leading-none"
            style={{ color: "#C9A84C" }}
          >
            OHM
          </span>
          <span className="font-display font-bold text-5xl md:text-7xl leading-none text-white">
            Golfness!
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          Smart Leagues.{" "}
          <em style={{ color: "#E9C46A", fontStyle: "italic" }}>
            Better Golf.
          </em>
        </h1>

        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Digital scorecards, live leaderboards, and effortless handicap
          tracking — built for clubs that take their game seriously.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#waitlist"
            className="px-8 py-4 rounded-full font-medium text-base transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
          >
            Join the Waitlist
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-full font-medium text-base border border-white/40 text-white hover:bg-white/10 transition-all duration-200"
          >
            See Features
          </a>
        </div>

        {/* Live demo pill */}
        <a
          href="https://bushwackersgolf.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors duration-200"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: "#52B788" }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: "#52B788" }}
            />
          </span>
          Live demo at Bushwackers Golf
        </a>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-1">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path
            d="M8 0v16M1 9l7 7 7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
