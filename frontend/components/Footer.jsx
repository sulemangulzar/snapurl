function Footer({ onNavigate }) {
  return (
    <footer className="bg-black px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500">
              <div className="absolute h-3 w-4 -rotate-45 rounded-full border-2 border-white" />
              <div className="absolute h-3 w-4 rotate-45 rounded-full border-2 border-white/80" />
              <div className="absolute h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <span className="text-sm font-bold">SnapURL</span>
          </div>

          <p className="mt-3 max-w-sm text-xs leading-5 text-white/50">
            A simple URL shortener MVP for clean links, redirects, and basic
            click tracking.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-white/60">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#roadmap" className="hover:text-white">
            Roadmap
          </a>
          <button
            onClick={() => onNavigate("login")}
            className="hover:text-white"
          >
            Login
          </button>
          <button
            onClick={() => onNavigate("signup")}
            className="hover:text-white"
          >
            Sign up
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/35">
        © 2026 SnapURL. Built by Suleman Gulzar.
      </div>
    </footer>
  );
}

export default Footer;
