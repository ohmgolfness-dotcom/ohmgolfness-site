export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#0D0D0D" }} className="py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-baseline gap-0.5 select-none">
          <span
            className="font-display font-black text-xl leading-none"
            style={{ color: "#C9A84C" }}
          >
            OHM
          </span>
          <span className="font-display font-bold text-xl leading-none text-white">
            Golfness!
          </span>
        </div>

        {/* Copyright + links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-white/40 text-sm">
          <span>© {year} OHMGolfness. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-white/70 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white/70 transition-colors">
              Terms
            </a>
            <a
              href="mailto:hello@ohmgolfness.com"
              className="hover:text-white/70 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
