function Hero({ onNavigate }) {
  const stats = [
    {
      icon: "🔗",
      label: "Short links",
      value: "clean URLs",
    },
    {
      icon: "📈",
      label: "Click tracking",
      value: "basic analytics",
    },
    {
      icon: "🚀",
      label: "Fast redirects",
      value: "simple flow",
    },
    {
      icon: "🧾",
      label: "QR codes",
      value: "coming next",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-b-4xl bg-black px-4 pb-8 pt-28 text-white sm:rounded-b-[3rem] sm:px-6 sm:pb-10 sm:pt-32 lg:px-10">
      {/* Soft purple glow */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-44 w-44 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col justify-between sm:min-h-[560px]">
        {/* Main hero content */}
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300 sm:text-xs">
            Simple URL shortener for makers
          </p>

          <h1 className="mx-auto max-w-[340px] text-[42px] font-semibold leading-[0.95] tracking-[-0.06em] sm:max-w-3xl sm:text-6xl md:text-7xl lg:text-8xl">
            Short links
            <br />
            that tell you what clicked
          </h1>

          <p className="mx-auto mt-5 max-w-[290px] text-[12px] leading-5 text-white/70 sm:max-w-md sm:text-sm md:text-base">
            SnapURL helps you create clean short links, redirect visitors, and
            track clicks from one simple dashboard.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate("signup")}
              className="rounded-full bg-violet-600 px-5 py-2.5 text-[11px] font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 sm:px-6 sm:py-3 sm:text-sm"
            >
              Start shortening links
            </button>

            <a
              href="#pricing"
              className="rounded-full border border-white/15 px-5 py-2.5 text-[11px] font-semibold text-white/80 transition hover:bg-white hover:text-black sm:px-6 sm:py-3 sm:text-sm"
            >
              View pricing
            </a>
          </div>
        </div>

        {/* Bottom latest activity */}
        <div className="mt-14 w-full">
          <p className="mb-3 text-[10px] font-medium text-white/80 sm:text-xs">
            MVP features included
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-full bg-white/10 px-2.5 py-2 backdrop-blur-md sm:px-4 sm:py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs sm:h-9 sm:w-9 sm:text-sm">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-semibold text-white sm:text-xs">
                      {item.label}
                    </p>
                    <p className="truncate text-[8px] text-white/50 sm:text-[10px]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
