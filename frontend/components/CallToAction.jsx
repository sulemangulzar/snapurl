function CallToAction({ onNavigate }) {
  return (
    <section
      id="login"
      className="bg-white px-4 pb-16 text-black sm:px-6 sm:pb-24 lg:px-10"
    >
      <div
        id="start"
        className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-violet-600 px-6 py-14 text-center text-white sm:rounded-[3rem] sm:px-10 sm:py-20"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
          Start simple
        </p>

        <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
          Create your first short link in seconds.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
          Sign up, paste a long URL, and get a clean short link you can share
          anywhere. The MVP is built for speed, learning, and real users.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => onNavigate("signup")}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white sm:w-auto"
          >
            Start Free
          </button>

          <button
            onClick={() => onNavigate("login")}
            className="w-full rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black sm:w-auto"
          >
            Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
