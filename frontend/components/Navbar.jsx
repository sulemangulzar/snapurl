import { useState } from "react";

function Logo() {
  return (
    <a href="#" className="group flex items-center gap-2.5 text-white">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/30 transition group-hover:scale-105">
        {/* Simple link icon */}
        <div className="absolute h-3.5 w-5 -rotate-45 rounded-full border-2 border-white" />
        <div className="absolute h-3.5 w-5 rotate-45 rounded-full border-2 border-white/80" />
        <div className="absolute h-2 w-2 rounded-full bg-white" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight sm:text-lg">
          SnapURL
        </span>
        <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.22em] text-violet-300 sm:text-[9px]">
          Short Links
        </span>
      </div>
    </a>
  );
}

function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Login", href: "#login", page: "login" },
  ];

  return (
    <nav className="absolute left-0 top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 rounded-full bg-white px-6 py-2 text-xs font-medium text-black shadow-lg md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => {
                if (link.page) {
                  event.preventDefault();
                  onNavigate(link.page);
                }
              }}
              className="transition hover:text-violet-600"
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={() => onNavigate("signup")}
            className="rounded-full bg-black px-4 py-1.5 text-white transition hover:bg-violet-600"
          >
            Start Free
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          <span className="text-lg leading-none">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="mx-auto mt-3 max-w-6xl rounded-3xl bg-white p-4 text-black shadow-xl md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => {
                  setIsOpen(false);
                  if (link.page) {
                    event.preventDefault();
                    onNavigate(link.page);
                  }
                }}
                className="rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate("signup");
              }}
              className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-600"
            >
              Start Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
